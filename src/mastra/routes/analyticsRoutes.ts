import { db } from '../../db/client.js';
import { pageViews } from '../../db/schema';
import { desc, gte, sql, and, eq } from 'drizzle-orm';
import crypto from 'crypto';

const generateId = () => crypto.randomUUID();

const parseUserAgent = (ua: string) => {
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const isTablet = /Tablet|iPad/i.test(ua);
  const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
  
  let browser = 'unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edge')) browser = 'Edge';
  
  return { deviceType, browser };
};

const hashIP = (ip: string) => {
  const salt = process.env.ANALYTICS_SALT || 'pulse-salt-fallback';
  return crypto.createHash('sha256').update(ip + salt).digest('hex').substring(0, 16);
};

export const analyticsRoutes = [
  {
    path: "/api/analytics/track",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const { page, referrer, sessionId, tenantId = 'pulse', duration } = body;
        
        if (!page) {
          return c.json({ error: 'Page is required' }, 400);
        }
        
        const userAgent = c.req.header('user-agent') || '';
        const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '0.0.0.0';
        const { deviceType, browser } = parseUserAgent(userAgent);
        
        // Check for existing record in same session for same page (within last 30 minutes)
        if (sessionId) {
          const existingRecord = await db.select()
            .from(pageViews)
            .where(
              and(
                eq(pageViews.sessionId, sessionId),
                eq(pageViews.page, page),
                sql`${pageViews.createdAt} > NOW() - INTERVAL '30 minutes'`
              )
            )
            .limit(1);
          
          if (existingRecord.length > 0 && duration) {
            // Update existing record with duration
            await db.update(pageViews)
              .set({ duration })
              .where(eq(pageViews.id, existingRecord[0].id));
            
            logger?.info('📊 [Analytics] Page view updated with duration', { page, sessionId, duration });
            return c.json({ success: true, id: existingRecord[0].id, updated: true });
          }
          
          // If record exists but no duration provided, skip duplicate insert
          if (existingRecord.length > 0) {
            logger?.info('📊 [Analytics] Page view already exists, skipping', { page, sessionId });
            return c.json({ success: true, id: existingRecord[0].id, skipped: true });
          }
        }
        
        // Insert new record only if no existing record
        const record = {
          id: generateId(),
          tenantId,
          page,
          referrer: referrer || null,
          userAgent,
          ipHash: hashIP(ip),
          sessionId: sessionId || null,
          deviceType,
          browser,
          country: null,
          city: null,
          duration: duration || null,
        };
        
        await db.insert(pageViews).values(record);
        
        logger?.info('📊 [Analytics] Page view tracked', { page, sessionId });
        return c.json({ success: true, id: record.id });
      } catch (error: any) {
        logger?.error('❌ [Analytics] Track error', { error: error.message });
        return c.json({ error: 'Failed to track' }, 500);
      }
    }
  },
  {
    path: "/api/analytics/dashboard",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const tenantId = c.req.query('tenantId') || 'pulse';
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const allViews = await db.select().from(pageViews)
          .where(eq(pageViews.tenantId, tenantId))
          .orderBy(desc(pageViews.createdAt));
        
        const todayViews = allViews.filter(v => new Date(v.createdAt) >= todayStart);
        const weekViews = allViews.filter(v => new Date(v.createdAt) >= weekStart);
        const monthViews = allViews.filter(v => new Date(v.createdAt) >= monthStart);
        
        const uniqueSessions = new Set(allViews.map(v => v.sessionId).filter(Boolean));
        const todaySessions = new Set(todayViews.map(v => v.sessionId).filter(Boolean));
        
        const pageStats: Record<string, number> = {};
        allViews.forEach(v => {
          pageStats[v.page] = (pageStats[v.page] || 0) + 1;
        });
        const topPages = Object.entries(pageStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([page, views]) => ({ page, views }));
        
        const referrerStats: Record<string, number> = {};
        allViews.filter(v => v.referrer).forEach(v => {
          const ref = v.referrer!;
          referrerStats[ref] = (referrerStats[ref] || 0) + 1;
        });
        const topReferrers = Object.entries(referrerStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([referrer, count]) => ({ referrer, count }));
        
        const deviceStats = { desktop: 0, mobile: 0, tablet: 0 };
        allViews.forEach(v => {
          if (v.deviceType === 'desktop') deviceStats.desktop++;
          else if (v.deviceType === 'mobile') deviceStats.mobile++;
          else if (v.deviceType === 'tablet') deviceStats.tablet++;
        });
        const total = deviceStats.desktop + deviceStats.mobile + deviceStats.tablet || 1;
        const deviceBreakdown = {
          desktop: Math.round((deviceStats.desktop / total) * 100),
          mobile: Math.round((deviceStats.mobile / total) * 100),
          tablet: Math.round((deviceStats.tablet / total) * 100),
        };
        
        const hourlyStats: number[] = new Array(24).fill(0);
        todayViews.forEach(v => {
          const hour = new Date(v.createdAt).getHours();
          hourlyStats[hour]++;
        });
        
        const dailyStats: { date: string; views: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
          const dateStr = date.toISOString().split('T')[0];
          const dayViews = allViews.filter(v => {
            const vDate = new Date(v.createdAt).toISOString().split('T')[0];
            return vDate === dateStr;
          }).length;
          dailyStats.push({ date: dateStr, views: dayViews });
        }
        
        const avgDuration = allViews
          .filter(v => v.duration && v.duration > 0)
          .reduce((sum, v) => sum + (v.duration || 0), 0) / (allViews.filter(v => v.duration).length || 1);
        
        return c.json({
          today: { views: todayViews.length, sessions: todaySessions.size },
          week: { views: weekViews.length },
          month: { views: monthViews.length },
          allTime: { views: allViews.length, sessions: uniqueSessions.size },
          topPages,
          topReferrers,
          deviceBreakdown,
          hourlyStats,
          dailyStats,
          avgDuration: Math.round(avgDuration),
        });
      } catch (error: any) {
        logger?.error('❌ [Analytics] Dashboard error', { error: error.message });
        return c.json({ 
          today: { views: 0, sessions: 0 },
          week: { views: 0 },
          month: { views: 0 },
          allTime: { views: 0, sessions: 0 },
          topPages: [],
          topReferrers: [],
          deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
          hourlyStats: new Array(24).fill(0),
          dailyStats: [],
          avgDuration: 0,
        });
      }
    }
  },
  {
    path: "/api/analytics/live",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const tenantId = c.req.query('tenantId') || 'pulse';
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        const recentViews = await db.select().from(pageViews)
          .where(and(
            eq(pageViews.tenantId, tenantId),
            gte(pageViews.createdAt, fiveMinutesAgo)
          ));
        
        const uniqueSessions = new Set(recentViews.map(v => v.sessionId).filter(Boolean));
        
        return c.json({
          liveVisitors: uniqueSessions.size,
          recentPageViews: recentViews.length,
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        logger?.error('❌ [Analytics] Live error', { error: error.message });
        return c.json({ liveVisitors: 0, recentPageViews: 0, timestamp: new Date().toISOString() });
      }
    }
  }
];
