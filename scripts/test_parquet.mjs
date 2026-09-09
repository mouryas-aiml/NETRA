import { DuckDBInstance } from '@duckdb/node-api';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PARQUET_PATH = resolve(__dirname, '../output/bengaluru_synthetic_crime_2020_2024.parquet');

const main = async () => {
  console.log('Testing parquet file...');
  
  const db = await DuckDBInstance.create(':memory:');
  const connection = await db.connect();
  
  try {
    const result = await connection.run(`SELECT * FROM read_parquet('${PARQUET_PATH.replace(/\\/g, '/')}') LIMIT 5`);
    console.log('Sample data:', result);
    
    const count = await connection.run(`SELECT COUNT(*) as count FROM read_parquet('${PARQUET_PATH.replace(/\\/g, '/')}')`);
    console.log('Total records:', count);
    
    const hourTest = await connection.run(`SELECT substr(occurred_at, 12, 2) as hour FROM read_parquet('${PARQUET_PATH.replace(/\\/g, '/')}') LIMIT 5`);
    console.log('Hour extraction test:', hourTest);
    
  } finally {
    // DuckDB cleanup is automatic
  }
};

main().catch(console.error);