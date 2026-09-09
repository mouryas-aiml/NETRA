import { writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { randomInt } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_PATH = resolve(__dirname, '../output/bengaluru_synthetic_crime_2020_2024.parquet');

// Create minimal synthetic data for time model donation
// This provides hour-of-day distributions without requiring full LA dataset
const generateMinimalDonor = () => {
  const records = [];
  const crimeCategories = ['THEFT', 'ASSAULT', 'BURGLARY', 'ROBBERY', 'OTHER'];
  const premises = ['STREET', 'RESIDENCE', 'COMMERCIAL', 'VEHICLE', 'OTHER'];
  
  // Generate 10,000 records with realistic hour distributions
  for (let i = 0; i < 10000; i++) {
    const crime = crimeCategories[randomInt(0, crimeCategories.length)];
    const premise = premises[randomInt(0, premises.length)];
    
    // Realistic hour distribution (more crimes during evening/night)
    let hour;
    const rand = randomInt(0, 100);
    if (rand < 10) hour = randomInt(0, 6);    // 12am-6am: 10%
    else if (rand < 30) hour = randomInt(6, 12);  // 6am-12pm: 20%
    else if (rand < 60) hour = randomInt(12, 18); // 12pm-6pm: 30%
    else hour = randomInt(18, 24);           // 6pm-12am: 40%
    
    records.push({
      'DR_NO': String(i),
      'Date Rptd': '2020-01-01',
      'DATE OCC': '2020-01-01',
      'TIME OCC': hour * 100, // Format: HHMM
      'Crm Cd': String(randomInt(100, 999)),
      'Crm Cd Desc': crime,
      'Vict Age': randomInt(18, 70),
      'Vict Sex': ['M', 'F', 'X'][randomInt(0, 3)],
      'Premis Cd': String(randomInt(100, 999)),
      'Premis Desc': premise,
      'Weapon Used Cd': '',
      'Weapon Desc': '',
      'Status': ['IC', 'AO', 'AA'][randomInt(0, 3)],
      'Status Desc': 'Invest Cont'
    });
  }
  
  return records;
};

const main = async () => {
  console.log('Generating minimal synthetic donor dataset...');
  const records = generateMinimalDonor();
  
  // Write as CSV (simple format for now)
  const headers = Object.keys(records[0]).join(',');
  const rows = records.map(r => Object.values(r).join(',')).join('\n');
  const csv = `${headers}\n${rows}`;
  
  await writeFile(OUTPUT_PATH.replace('.parquet', '.csv'), csv);
  console.log(`Generated ${records.length} records to ${OUTPUT_PATH.replace('.parquet', '.csv')}`);
  
  // Note: This creates CSV instead of parquet - the ETL might need adjustment
  console.log('Note: Generated CSV format. ETL may need to be adjusted to read CSV instead of parquet.');
};

main().catch(console.error);