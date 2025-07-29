// Script to clean up old data without user isolation
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './config/.env' });

async function cleanupOldData() {
  if (!process.env.MONGODB_URI || !process.env.MONGODB_DB) {
    console.error('MongoDB not configured');
    return;
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI, {});
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    
    // Collections to clean up
    const collections = ['testcase_generator', 'codegen_recordings', 'generated_scripts'];
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      
      // Find documents without userId field
      const oldDocs = await collection.find({ userId: { $exists: false } }).toArray();
      
      if (oldDocs.length > 0) {
        console.log(`Found ${oldDocs.length} old documents in ${collectionName} without user isolation`);
        
        // Delete old documents
        const result = await collection.deleteMany({ userId: { $exists: false } });
        console.log(`Deleted ${result.deletedCount} old documents from ${collectionName}`);
      } else {
        console.log(`No old documents found in ${collectionName}`);
      }
    }
    
    await client.close();
    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

cleanupOldData(); 