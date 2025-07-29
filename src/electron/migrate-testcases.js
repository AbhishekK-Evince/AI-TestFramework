// Migration script to convert existing test cases from single documents to individual test cases
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './config/.env' });

async function migrateTestCases() {
  if (!process.env.MONGODB_URI || !process.env.MONGODB_DB) {
    console.error('MongoDB not configured');
    return;
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI, {});
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection('testcase_generator');
    
    // Find documents that contain multiple test cases (old format)
    const oldFormatDocs = await collection.find({
      generatedTestCases: { $regex: /Title:.*Title:/s } // Contains multiple "Title:" entries
    }).toArray();
    
    console.log(`Found ${oldFormatDocs.length} documents with multiple test cases to migrate`);
    
    for (const doc of oldFormatDocs) {
      const testCases = doc.generatedTestCases;
      
      // Split into individual test cases
      const testCaseBlocks = testCases.split(/\n\s*Title:/).map((block, index) => {
        if (index === 0) return block;
        return 'Title:' + block;
      }).filter(block => block.trim() && block.includes('Title:'));
      
      console.log(`Document ${doc._id}: Found ${testCaseBlocks.length} individual test cases`);
      
      // Delete the old document
      await collection.deleteOne({ _id: doc._id });
      
      // Insert individual test cases
      for (const testCaseBlock of testCaseBlocks) {
        await collection.insertOne({
          sourceType: doc.sourceType,
          testCaseTypes: doc.testCaseTypes,
          userInput: doc.userInput,
          generatedTestCases: testCaseBlock.trim(),
          codegenFile: doc.codegenFile || '',
          userId: doc.userId,
          sessionId: doc.sessionId,
          timestamp: doc.timestamp
        });
      }
    }
    
    await client.close();
    console.log('Test case migration completed successfully');
    
  } catch (error) {
    console.error('Test case migration failed:', error);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateTestCases();
}

module.exports = { migrateTestCases }; 