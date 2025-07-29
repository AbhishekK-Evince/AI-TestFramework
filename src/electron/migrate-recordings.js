// Migration script to convert existing recordings to user-specific storage
const Store = require('electron-store');
const fs = require('fs-extra');
const crypto = require('crypto');
const os = require('os');

// Generate user ID (same logic as in main.js)
function generateUserId() {
  const machineInfo = os.hostname() + os.userInfo().username + os.platform();
  return crypto.createHash('sha256').update(machineInfo).digest('hex');
}

async function migrateRecordings() {
  try {
    const store = new Store({
      name: 'ai-test-framework-data'
    });
    
    const userId = generateUserId();
    console.log(`Migrating recordings for user: ${userId}`);
    
    // Get existing recordings
    const existingRecordings = store.get('recordings', []);
    
    if (existingRecordings.length === 0) {
      console.log('No existing recordings found to migrate');
      return;
    }
    
    console.log(`Found ${existingRecordings.length} existing recordings to migrate`);
    
    // Filter recordings that still exist on disk
    const validRecordings = existingRecordings.filter(recording => {
      return fs.existsSync(recording.path);
    });
    
    console.log(`${validRecordings.length} recordings are still valid`);
    
    // Add user information to each recording
    const migratedRecordings = validRecordings.map(recording => ({
      ...recording,
      userId: userId,
      sessionId: crypto.randomBytes(32).toString('hex'),
      migratedAt: new Date().toISOString()
    }));
    
    // Store in user-specific key
    const userRecordingsKey = `recordings_${userId}`;
    store.set(userRecordingsKey, migratedRecordings);
    
    // Remove old shared recordings
    store.delete('recordings');
    
    console.log(`Successfully migrated ${migratedRecordings.length} recordings to user-specific storage`);
    console.log(`User recordings key: ${userRecordingsKey}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateRecordings();
}

module.exports = { migrateRecordings }; 