# Session Management & Data Cleanup System

## Overview

The AI Test Framework now includes a comprehensive session management system that ensures data isolation between users and automatic cleanup of old data.

## 🔐 Session Management

### User Identification
- **User ID**: Generated from machine info (hostname + username + platform)
- **Session ID**: Random 32-byte hex string for each app session
- **Data Isolation**: All data is filtered by User ID to ensure complete isolation

### How It Works
1. Each user gets a unique User ID based on their machine
2. Each app session gets a unique Session ID
3. All data is stored with both IDs for complete tracking
4. Data retrieval is filtered by User ID only

## 🧹 Automatic Data Cleanup

### Default Retention Periods
- **Test Cases**: 30 days
- **Codegen Recordings**: 60 days  
- **Generated Scripts**: 45 days
- **Application Logs**: 90 days

### Cleanup Schedule
- **Frequency**: Every 24 hours
- **Initial Cleanup**: Runs 5 seconds after app startup
- **Automatic**: No user intervention required

### What Gets Cleaned
- Documents older than retention period
- Only affects current user's data (filtered by User ID)
- Preserves recent and important data

## ⚙️ Configuration

### Modify Retention Periods
Edit `session-config.json` to change retention periods:

```json
{
  "sessionCleanup": {
    "retentionPeriods": {
      "testcase_generator": 30,    // Days
      "codegen_recordings": 60,    // Days
      "generated_scripts": 45,     // Days
      "winston_logs": 90          // Days
    },
    "cleanupInterval": 24         // Hours
  }
}
```

### Disable Cleanup
Set `"enabled": false` in `session-config.json` to disable automatic cleanup.

## 🛠️ Manual Cleanup

### Run Cleanup Now
Use the IPC handler: `run-cleanup-now`

### Cleanup Old Data (One-time)
Run the cleanup script:
```bash
node cleanup-old-data.js
```

## 📊 Monitoring

### Check Cleanup Status
- Use `get-cleanup-config` IPC handler
- View last cleanup timestamp
- Monitor cleanup statistics in console logs

### Cleanup Logs
The application logs cleanup activities:
```
Session cleanup scheduled every 24 hours
Running scheduled session cleanup...
Cleaned up 15 old documents from testcase_generator (older than 30 days)
Session cleanup completed: 23 total documents removed
```

## 🔒 Security Benefits

1. **Data Isolation**: Users can only see their own data
2. **Automatic Cleanup**: Reduces database size and improves performance
3. **Configurable Retention**: Adjust based on business needs
4. **Audit Trail**: Session IDs provide tracking capability

## 🚀 Performance Benefits

1. **Reduced Database Size**: Automatic cleanup prevents data accumulation
2. **Faster Queries**: Less data to scan and filter
3. **Better Resource Usage**: Efficient storage management
4. **Scalable**: Works for any number of users

## 📝 Best Practices

1. **Review Retention Periods**: Adjust based on your needs
2. **Monitor Cleanup Logs**: Ensure cleanup is working properly
3. **Backup Important Data**: Export critical test cases before cleanup
4. **Test Configuration**: Verify settings in development before production

## 🔧 Troubleshooting

### Cleanup Not Running
- Check MongoDB connection
- Verify cleanup is enabled in config
- Check console logs for errors

### Data Missing
- Verify retention periods are appropriate
- Check if manual cleanup was run
- Review cleanup logs for details

### Performance Issues
- Reduce retention periods
- Increase cleanup frequency
- Monitor database size 