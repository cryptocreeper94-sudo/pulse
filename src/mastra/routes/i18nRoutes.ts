import { db } from '../../db/client.js';
import { sql } from 'drizzle-orm';

const translations: Record<string, Record<string, string>> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.markets': 'Markets',
    'nav.portfolio': 'Portfolio',
    'nav.alerts': 'Alerts',
    'nav.defi': 'DeFi',
    'nav.social': 'Social',
    'nav.settings': 'Settings',
    'common.buy': 'Buy',
    'common.sell': 'Sell',
    'common.price': 'Price',
    'common.volume': 'Volume',
    'common.change': 'Change',
    'common.market_cap': 'Market Cap',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm'
  },
  es: {
    'nav.dashboard': 'Panel',
    'nav.markets': 'Mercados',
    'nav.portfolio': 'Portafolio',
    'nav.alerts': 'Alertas',
    'nav.defi': 'DeFi',
    'nav.social': 'Social',
    'nav.settings': 'Configuración',
    'common.buy': 'Comprar',
    'common.sell': 'Vender',
    'common.price': 'Precio',
    'common.volume': 'Volumen',
    'common.change': 'Cambio',
    'common.market_cap': 'Cap. de Mercado',
    'common.loading': 'Cargando...',
    'common.error': 'Ocurrió un error',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar'
  },
  zh: {
    'nav.dashboard': '仪表板',
    'nav.markets': '市场',
    'nav.portfolio': '投资组合',
    'nav.alerts': '警报',
    'nav.defi': 'DeFi',
    'nav.social': '社交',
    'nav.settings': '设置',
    'common.buy': '买入',
    'common.sell': '卖出',
    'common.price': '价格',
    'common.volume': '成交量',
    'common.change': '涨跌',
    'common.market_cap': '市值',
    'common.loading': '加载中...',
    'common.error': '发生错误',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.confirm': '确认'
  },
  ja: {
    'nav.dashboard': 'ダッシュボード',
    'nav.markets': 'マーケット',
    'nav.portfolio': 'ポートフォリオ',
    'nav.alerts': 'アラート',
    'nav.defi': 'DeFi',
    'nav.social': 'ソーシャル',
    'nav.settings': '設定',
    'common.buy': '購入',
    'common.sell': '売却',
    'common.price': '価格',
    'common.volume': '出来高',
    'common.change': '変動',
    'common.market_cap': '時価総額',
    'common.loading': '読み込み中...',
    'common.error': 'エラーが発生しました',
    'common.save': '保存',
    'common.cancel': 'キャンセル',
    'common.confirm': '確認'
  },
  ko: {
    'nav.dashboard': '대시보드',
    'nav.markets': '시장',
    'nav.portfolio': '포트폴리오',
    'nav.alerts': '알림',
    'nav.defi': 'DeFi',
    'nav.social': '소셜',
    'nav.settings': '설정',
    'common.buy': '매수',
    'common.sell': '매도',
    'common.price': '가격',
    'common.volume': '거래량',
    'common.change': '변동',
    'common.market_cap': '시가총액',
    'common.loading': '로딩 중...',
    'common.error': '오류가 발생했습니다',
    'common.save': '저장',
    'common.cancel': '취소',
    'common.confirm': '확인'
  },
  ru: {
    'nav.dashboard': 'Панель',
    'nav.markets': 'Рынки',
    'nav.portfolio': 'Портфель',
    'nav.alerts': 'Оповещения',
    'nav.defi': 'DeFi',
    'nav.social': 'Социальное',
    'nav.settings': 'Настройки',
    'common.buy': 'Купить',
    'common.sell': 'Продать',
    'common.price': 'Цена',
    'common.volume': 'Объём',
    'common.change': 'Изменение',
    'common.market_cap': 'Капитализация',
    'common.loading': 'Загрузка...',
    'common.error': 'Произошла ошибка',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.confirm': 'Подтвердить'
  },
  pt: {
    'nav.dashboard': 'Painel',
    'nav.markets': 'Mercados',
    'nav.portfolio': 'Portfólio',
    'nav.alerts': 'Alertas',
    'nav.defi': 'DeFi',
    'nav.social': 'Social',
    'nav.settings': 'Configurações',
    'common.buy': 'Comprar',
    'common.sell': 'Vender',
    'common.price': 'Preço',
    'common.volume': 'Volume',
    'common.change': 'Variação',
    'common.market_cap': 'Cap. de Mercado',
    'common.loading': 'Carregando...',
    'common.error': 'Ocorreu um erro',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar'
  }
};

export const i18nRoutes = [
  {
    path: "/api/i18n/languages",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      return c.json({
        languages: [
          { code: 'en', name: 'English', nativeName: 'English' },
          { code: 'es', name: 'Spanish', nativeName: 'Español' },
          { code: 'zh', name: 'Chinese', nativeName: '中文' },
          { code: 'ja', name: 'Japanese', nativeName: '日本語' },
          { code: 'ko', name: 'Korean', nativeName: '한국어' },
          { code: 'ru', name: 'Russian', nativeName: 'Русский' },
          { code: 'pt', name: 'Portuguese', nativeName: 'Português' }
        ]
      });
    }
  },

  {
    path: "/api/i18n/translations/:lang",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const lang = c.req.param('lang');
      
      if (!translations[lang]) {
        return c.json({ error: 'Language not supported' }, 404);
      }
      
      return c.json({ 
        language: lang,
        translations: translations[lang]
      });
    }
  },

  {
    path: "/api/i18n/user-preference/:userId",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const userId = c.req.param('userId');
        
        const result = await db.execute(sql`
          SELECT language FROM user_preferences WHERE user_id = ${userId}
        `);
        
        return c.json({ 
          language: result.rows?.[0]?.language || 'en'
        });
      } catch (error: any) {
        return c.json({ language: 'en' });
      }
    }
  },

  {
    path: "/api/i18n/user-preference/:userId",
    method: "PUT" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const userId = c.req.param('userId');
        const { language } = await c.req.json();
        
        if (!translations[language]) {
          return c.json({ error: 'Language not supported' }, 400);
        }
        
        await db.execute(sql`
          INSERT INTO user_preferences (user_id, language, updated_at)
          VALUES (${userId}, ${language}, NOW())
          ON CONFLICT (user_id) DO UPDATE SET language = ${language}, updated_at = NOW()
        `);
        
        return c.json({ success: true, language });
      } catch (error: any) {
        console.error('Update language error:', error);
        return c.json({ error: 'Failed to update language' }, 500);
      }
    }
  }
];
