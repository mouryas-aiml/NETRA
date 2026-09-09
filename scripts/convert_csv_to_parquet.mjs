import { DuckDBInstance } from '@duckdb/node-api';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CSV_PATH = resolve(__dirname, '../output/bengaluru_synthetic_crime_2020_2024.csv');
const PARQUET_PATH = resolve(__dirname, '../output/bengaluru_synthetic_crime_2020_2024.parquet');

const main = async () => {
  console.log('Converting CSV to Parquet using DuckDB...');
  
  const db = await DuckDBInstance.create(':memory:');
  const connection = await db.connect();
  
  // Create table from CSV
  await connection.run(`
    CREATE TABLE donor_data AS 
    SELECT * FROM read_csv('${CSV_PATH.replace(/\\/g, '/')}', 
      header=true, 
      columns={
        'DR_NO': 'VARCHAR',
        'Date Rptd': 'VARCHAR',
        'DATE OCC': 'VARCHAR',
        'TIME OCC': 'INTEGER',
        'Crm Cd': 'VARCHAR',
        'Crm Cd Desc': 'VARCHAR',
        'Vict Age': 'INTEGER',
        'Vict Sex': 'VARCHAR',
        'Premis Cd': 'VARCHAR',
        'Premis Desc': 'VARCHAR',
        'Weapon Used Cd': 'VARCHAR',
        'Weapon Desc': 'VARCHAR',
        'Status': 'VARCHAR',
        'Status Desc': 'VARCHAR'
      })
  `);
  
  // Write to parquet
  await connection.run(`
    COPY donor_data TO '${PARQUET_PATH.replace(/\\/g, '/')}'
    (FORMAT PARQUET, COMPRESSION 'SNAPPY')
  `);
  
  const result = await connection.run('SELECT COUNT(*) as count FROM donor_data');
  console.log('Query result:', result);
  const count = result[0]?.count || result.length || 0;
  console.log(`Converted ${count} records to parquet`);
  console.log(`Output: ${PARQUET_PATH}`);
};

main().catch(console.error);