#!/usr/bin/env node

/**
 * AI Test Framework - Secrets Setup Script
 * 
 * This script helps users set up their API keys and configuration settings
 * for the AI Test Framework. It stores secrets securely using the system's
 * credential manager via the keytar library.
 * 
 * Usage:
 *   node scripts/set-secrets.js
 */

const keytar = require('keytar');
const readline = require('readline');

const SERVICE_NAME = 'ai-test-framework';

// Required secrets
const REQUIRED_SECRETS = [
  'OPENAI_API_KEY',
  'MONGODB_URI',
  'MONGODB_DB'
];

// Optional secrets
const OPTIONAL_SECRETS = [
  'LANGCHAIN_TRACKING_V2',
  'LANGCHAIN_API_KEY',
  'LANGCHAIN_PROJECT',
  'LANGSMITH_ENDPOINT'
];

// Default values for optional secrets
const DEFAULT_VALUES = {
  'LANGCHAIN_TRACKING_V2': 'true',
  'LANGCHAIN_PROJECT': 'ai-test-case-generation',
  'LANGSMITH_ENDPOINT': 'https://api.smith.langchain.com'
};

// Help text for each secret
const HELP_TEXT = {
  'OPENAI_API_KEY': 'Your OpenAI API key (starts with sk-). Get it from https://platform.openai.com/api-keys',
  'MONGODB_URI': 'MongoDB connection string (e.g., mongodb://localhost:27017 or mongodb+srv://...)',
  'MONGODB_DB': 'MongoDB database name (e.g., ai_test_framework)',
  'LANGCHAIN_TRACKING_V2': 'Enable LangChain tracking (true/false)',
  'LANGCHAIN_API_KEY': 'LangChain API key (optional, for enhanced tracking)',
  'LANGCHAIN_PROJECT': 'Project name for LangChain tracking',
  'LANGSMITH_ENDPOINT': 'LangSmith API endpoint URL'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const showHelp = () => {
  console.log('\n🤖 AI Test Framework - Secrets Setup');
  console.log('=====================================\n');
  console.log('This script will help you configure your API keys and settings.');
  console.log('All secrets are stored securely using your system\'s credential manager.\n');
  console.log('Required settings:');
  REQUIRED_SECRETS.forEach(secret => {
    console.log(`  • ${secret}: ${HELP_TEXT[secret]}`);
  });
  console.log('\nOptional settings:');
  OPTIONAL_SECRETS.forEach(secret => {
    console.log(`  • ${secret}: ${HELP_TEXT[secret]}`);
  });
  console.log('\n');
};

const validateOpenAIKey = (key) => {
  if (!key || key.trim() === '') return false;
  return key.startsWith('sk-') && key.length > 20;
};

const validateMongoDBUri = (uri) => {
  if (!uri || uri.trim() === '') return false;
  return uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
};

const validateMongoDBDb = (db) => {
  if (!db || db.trim() === '') return false;
  return /^[a-zA-Z0-9_-]+$/.test(db);
};

const getSecretValue = async (secretName, isRequired = true) => {
  const helpText = HELP_TEXT[secretName];
  const defaultValue = DEFAULT_VALUES[secretName];
  
  console.log(`\n📝 ${secretName}:`);
  console.log(`   ${helpText}`);
  
  if (defaultValue && !isRequired) {
    console.log(`   Default: ${defaultValue}`);
  }
  
  const prompt = isRequired ? 
    `Enter ${secretName}${defaultValue ? ' (or press Enter for default)' : ''}: ` :
    `Enter ${secretName} (optional${defaultValue ? ', press Enter for default' : ''}): `;
  
  let value = await question(prompt);
  value = value.trim();
  
  // Use default value if provided and user pressed Enter
  if (!value && defaultValue) {
    value = defaultValue;
    console.log(`   Using default: ${defaultValue}`);
  }
  
  // Validation for required secrets
  if (isRequired && !value) {
    console.log(`   ❌ ${secretName} is required!`);
    return await getSecretValue(secretName, isRequired);
  }
  
  // Specific validations
  if (value) {
    if (secretName === 'OPENAI_API_KEY' && !validateOpenAIKey(value)) {
      console.log('   ❌ Invalid OpenAI API key format. Should start with "sk-"');
      return await getSecretValue(secretName, isRequired);
    }
    
    if (secretName === 'MONGODB_URI' && !validateMongoDBUri(value)) {
      console.log('   ❌ Invalid MongoDB URI format. Should start with "mongodb://" or "mongodb+srv://"');
      return await getSecretValue(secretName, isRequired);
    }
    
    if (secretName === 'MONGODB_DB' && !validateMongoDBDb(value)) {
      console.log('   ❌ Invalid database name. Use only letters, numbers, underscores, and hyphens');
      return await getSecretValue(secretName, isRequired);
    }
  }
  
  return value;
};

const saveSecret = async (secretName, value) => {
  try {
    if (value) {
      await keytar.setPassword(SERVICE_NAME, secretName, value);
      console.log(`   ✅ ${secretName} saved successfully`);
    } else {
      console.log(`   ⏭️  ${secretName} skipped (optional)`);
    }
  } catch (error) {
    console.log(`   ❌ Failed to save ${secretName}: ${error.message}`);
    return false;
  }
  return true;
};

const main = async () => {
  try {
    showHelp();
    
    console.log('🚀 Starting secrets setup...\n');
    
    const secrets = {};
    
    // Get required secrets
    console.log('📋 Required Settings:');
    for (const secret of REQUIRED_SECRETS) {
      secrets[secret] = await getSecretValue(secret, true);
    }
    
    // Get optional secrets
    console.log('\n📋 Optional Settings:');
    for (const secret of OPTIONAL_SECRETS) {
      secrets[secret] = await getSecretValue(secret, false);
    }
    
    // Save all secrets
    console.log('\n💾 Saving secrets...');
    let allSaved = true;
    
    for (const [secretName, value] of Object.entries(secrets)) {
      const saved = await saveSecret(secretName, value);
      if (!saved) allSaved = false;
    }
    
    if (allSaved) {
      console.log('\n🎉 All secrets saved successfully!');
      console.log('\n✅ Setup complete! You can now run the AI Test Framework.');
      console.log('   Run: npm start');
    } else {
      console.log('\n⚠️  Some secrets failed to save. Please try again.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
};

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Setup cancelled. You can run this script again anytime.');
  rl.close();
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, getSecretValue, saveSecret }; 