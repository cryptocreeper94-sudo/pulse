import { Pool } from 'pg';
import fs from 'fs';

async function exportPredictions() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  console.log('Exporting predictions from development database...');
  
  const result = await pool.query(`
    SELECT * FROM strikeagent_predictions 
    ORDER BY created_at DESC
  `);
  
  console.log(`Found ${result.rows.length} predictions to export`);
  
  const jsonExport = {
    exportDate: new Date().toISOString(),
    totalRecords: result.rows.length,
    predictions: result.rows
  };
  
  fs.writeFileSync('exports/predictions-export.json', JSON.stringify(jsonExport, null, 2));
  console.log('Exported to exports/predictions-export.json');
  
  let inserts = '-- StrikeAgent Predictions Export\n';
  inserts += '-- Generated: ' + new Date().toISOString() + '\n\n';
  
  for (const row of result.rows) {
    const values = [
      row.id, row.user_id, row.token_address, row.token_symbol, row.token_name,
      row.dex, row.chain, row.price_usd, row.price_sol, row.market_cap_usd,
      row.liquidity_usd, row.token_age_minutes, row.ai_recommendation, row.ai_score,
      row.ai_reasoning, row.safety_metrics, row.movement_metrics, row.holder_count,
      row.top10_holders_percent, row.bot_percent, row.bundle_percent,
      row.mint_authority_active, row.freeze_authority_active, row.is_honeypot,
      row.liquidity_locked, row.is_pump_fun, row.creator_wallet_risky,
      row.payload_hash, row.onchain_signature, row.status,
      row.created_at, row.stamped_at
    ].map(v => {
      if (v === null || v === undefined) return 'NULL';
      if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
      if (typeof v === 'number') return v.toString();
      if (v instanceof Date) return `'${v.toISOString()}'`;
      return `'${String(v).replace(/'/g, "''")}'`;
    }).join(', ');
    
    inserts += `INSERT INTO strikeagent_predictions VALUES (${values}) ON CONFLICT (id) DO NOTHING;\n`;
  }
  
  fs.writeFileSync('exports/predictions-inserts.sql', inserts);
  console.log('Exported to exports/predictions-inserts.sql');
  
  await pool.end();
  console.log('Export complete!');
}

exportPredictions().catch(console.error);
