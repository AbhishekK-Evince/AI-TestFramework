# AI Test Framework - Settings Management Guide

This guide explains how to manage your API keys and configuration settings in the AI Test Framework.

## Overview

The AI Test Framework stores your API keys and configuration settings securely using your system's credential manager. This ensures that sensitive information like API keys are never stored in plain text files and are protected by your operating system's security features.

## Initial Setup

### First Time Users

If you're setting up the AI Test Framework for the first time, you'll need to configure your API keys and settings:

1. **Run the setup script:**
   ```bash
   node scripts/set-secrets.js
   ```

2. **Follow the prompts** to enter your:
   - OpenAI API key
   - MongoDB connection details
   - Optional LangChain settings

3. **Start the application:**
   ```bash
   npm start
   ```

## Managing Settings After Setup

### Method 1: Using the Settings Tab (Recommended)

The easiest way to manage your settings is through the application's built-in Settings tab:

1. **Open the AI Test Framework application**
2. **Click on the "Settings" tab** in the navigation bar
3. **Use the available options:**
   - **Load Current Settings**: Populates the form with your existing configuration
   - **Test Connection**: Verifies that your current settings work correctly
   - **Save Settings**: Updates your configuration with new values

#### Settings Tab Features

- **View Current Settings**: See what's currently configured
- **Update API Keys**: Change your OpenAI API key or other credentials
- **Test Connections**: Verify that your MongoDB and OpenAI connections work
- **Application Info**: View version information and system details

### Method 2: Using the Command Line Script

You can also update your settings using the command line:

```bash
node scripts/set-secrets.js
```

This script will:
- Show your current settings
- Allow you to update specific values
- Validate your input
- Save changes securely

## Available Settings

### Required Settings

These settings are essential for the application to function:

| Setting | Description | Example |
|---------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key for AI-powered test generation | `sk-1234567890abcdef...` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGODB_DB` | MongoDB database name | `ai_test_framework` |

### Optional Settings

These settings enhance functionality but aren't required:

| Setting | Description | Default | Example |
|---------|-------------|---------|---------|
| `LANGCHAIN_TRACKING_V2` | Enable LangChain tracking | `true` | `true` or `false` |
| `LANGCHAIN_API_KEY` | LangChain API key for enhanced tracking | None | `ls_1234567890...` |
| `LANGCHAIN_PROJECT` | Project name for LangChain tracking | `ai-test-case-generation` | `my-test-project` |
| `LANGSMITH_ENDPOINT` | LangSmith API endpoint URL | `https://api.smith.langchain.com` | `https://api.smith.langchain.com` |

## Security Features

### Secure Storage

- **System Credential Manager**: All secrets are stored using your operating system's secure credential store
- **No Plain Text Files**: API keys are never stored in configuration files
- **Encrypted Storage**: Credentials are encrypted by your OS security features

### Access Control

- **User-Specific**: Settings are stored per user account
- **Process Isolation**: Only the application can access the stored credentials
- **No Network Transmission**: Credentials are never sent over the network

## Troubleshooting

### Common Issues

#### "Settings not found" Error
- **Cause**: Settings haven't been configured yet
- **Solution**: Run `node scripts/set-secrets.js` to set up your configuration

#### "Connection test failed" Error
- **Cause**: Invalid API keys or connection strings
- **Solution**: 
  1. Check your API keys are correct
  2. Verify MongoDB is running and accessible
  3. Test your connection strings manually

#### "Permission denied" Error
- **Cause**: System credential manager access issues
- **Solution**: 
  1. Run the application with appropriate permissions
  2. Check your system's credential manager settings
  3. Try running as administrator (Windows) or with sudo (Linux/Mac)

### Getting Help

If you encounter issues:

1. **Check the logs**: Look for error messages in the application console
2. **Verify your credentials**: Ensure your API keys and connection strings are correct
3. **Test connections manually**: Try connecting to your services using other tools
4. **Check system requirements**: Ensure your OS supports the credential manager

## Best Practices

### API Key Management

- **Rotate Regularly**: Update your API keys periodically
- **Use Environment-Specific Keys**: Use different keys for development and production
- **Monitor Usage**: Keep track of your API usage to avoid unexpected charges

### Database Configuration

- **Use Strong Passwords**: Ensure your MongoDB has secure authentication
- **Network Security**: Use VPN or firewall rules to restrict database access
- **Regular Backups**: Back up your test data regularly

### General Security

- **Keep Software Updated**: Regularly update the AI Test Framework
- **Monitor Logs**: Check application logs for unusual activity
- **Limit Access**: Only give access to users who need it

## Advanced Configuration

### Custom LangChain Settings

For advanced users who want to customize LangChain behavior:

```bash
# Set custom project name
node scripts/set-secrets.js
# Enter custom LANGCHAIN_PROJECT value

# Or use the Settings tab to update the value
```

### Multiple Environments

To manage different environments (dev, staging, prod):

1. **Use different database names** for each environment
2. **Use different LangChain project names** to separate tracking
3. **Consider using different OpenAI API keys** for cost tracking

## Support

If you need help with settings management:

1. **Check this guide** for common solutions
2. **Review the main README** for general setup instructions
3. **Check the application logs** for detailed error information
4. **Contact support** if issues persist

---

*This guide covers the settings management features of AI Test Framework. For general usage instructions, see the main README.md file.* 