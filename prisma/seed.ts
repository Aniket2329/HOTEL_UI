import { DatabaseService } from '../server/lib/database';

async function main() {
  console.log('🚀 Starting database seed...');
  
  try {
    await DatabaseService.connect();
    await DatabaseService.seed();
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await DatabaseService.disconnect();
  }
}

main();
