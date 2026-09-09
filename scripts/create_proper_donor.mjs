import { DuckDBInstance } from '@duckdb/node-api';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomInt } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PARQUET_PATH = resolve(__dirname, '../output/bengaluru_synthetic_crime_2020_2024.parquet');

const main = async () => {
  console.log('Creating proper donor dataset with correct schema...');
  
  const db = await DuckDBInstance.create(':memory:');
  const connection = await db.connect();
  
  try {
    // Create donor table with correct schema matching ETL expectations
    await connection.run(`
      CREATE TABLE donor_data (
        crime_category VARCHAR,
        premise_category VARCHAR,
        occurred_at VARCHAR
      )
    `);
    
    // Generate synthetic data with correct schema
    const crimeCategories = ['property_crime', 'violent_crime', 'fraud_cyber_crime', 'family_child_offence', 'sexual_offence', 'public_order', 'weapons_offence', 'drug_offence', 'other_incident'];
    const premiseCategories = ['outdoor', 'residential', 'commercial', 'vehicle', 'intersection'];
    
    const insertValues = [];
    for (let i = 0; i < 50000; i++) {
      const crime = crimeCategories[randomInt(0, crimeCategories.length)];
      const premise = premiseCategories[randomInt(0, premiseCategories.length)];
      
      // Generate realistic timestamp distribution
      const year = 2020 + randomInt(0, 5); // 2020-2024
      const month = String(randomInt(1, 13)).padStart(2, '0');
      const day = String(randomInt(1, 29)).padStart(2, '0');
      
      // Realistic hour distribution
      let hour;
      const rand = randomInt(0, 100);
      if (rand < 10) hour = randomInt(0, 6);    // 12am-6am: 10%
      else if (rand < 30) hour = randomInt(6, 12);  // 6am-12pm: 20%
      else if (rand < 60) hour = randomInt(12, 18); // 12pm-6pm: 30%
      else hour = randomInt(18, 24);           // 6pm-12am: 40%
      
      const minute = String(randomInt(0, 60)).padStart(2, '0');
      const second = String(randomInt(0, 60)).padStart(2, '0');
      
      const timestamp = `${year}-${month}-${day} ${String(hour).padStart(2, '0')}:${minute}:${second}`; // Format: YYYY-MM-DD HH:MM:SS
      
      insertValues.push(`('${crime}', '${premise}', '${timestamp}')`);
    }
    
    // Insert data in batches
    const batchSize = 1000;
    for (let i = 0; i < insertValues.length; i += batchSize) {
      const batch = insertValues.slice(i, i + batchSize);
      await connection.run(`INSERT INTO donor_data VALUES ${batch.join(', ')}`);
    }
    
    // Write to parquet
    await connection.run(`
      COPY donor_data TO '${PARQUET_PATH.replace(/\\/g, '/')}'
      (FORMAT PARQUET, COMPRESSION 'SNAPPY')
    `);
    
    const result = await connection.run('SELECT COUNT(*) as count FROM donor_data');
    console.log(`Generated ${insertValues.length} records to parquet`);
    console.log(`Output: ${PARQUET_PATH}`);
    console.log(`Schema: crime_category, premise_category, occurred_at`);
    
  } finally {
    // DuckDB cleanup is automatic
  }
};

main().catch(console.error);