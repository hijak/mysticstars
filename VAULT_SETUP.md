# HashiCorp Vault Setup Guide

This guide explains how to configure HashiCorp Vault for use with the MysticStars GitHub Actions pipeline.

## Prerequisites

- HashiCorp Vault server (v1.15.0+ recommended)
- Vault CLI installed
- Admin access to Vault
- GitHub repository with OIDC trust configured

## Step 1: Enable GitHub JWT Auth Method

```bash
# Enable the GitHub JWT auth method
vault auth enable jwt

# Rename to github for convenience
vault auth rename jwt github

# Configure the JWT auth method for GitHub
vault write auth/github/config \
  oidc_discovery_url="https://token.actions.githubusercontent.com" \
  bound_issuer="https://token.actions.githubusercontent.com"
```

## Step 2: Create Vault Role for Your Repository

Create a role that allows your repository to authenticate:

```bash
# Create a role for your repository
vault write auth/github/role/mysticstars-role \
  role_type="jwt" \
  bound_audiences="api://AzureADTokenExchange" \
  user_claim="sub" \
  bound_subject="repo:jcowey/mysticstars:ref:refs/heads/main" \
  bound_claims="sub=repo:jcowey/mysticstars:ref:refs/heads/main" \
  policies="mysticstars-policy" \
  ttl="1h"
```

**Note:** Update the `bound_subject` with your actual GitHub repository path.

## Step 3: Create Vault Policy

Create a policy that allows access to the required secrets:

```bash
# Create the policy file
cat > mysticstars-policy.hcl << EOF
# Allow reading secrets from the KV store
path "kv/data/mysticstars" {
  capabilities = ["read"]
}

# Allow reading from KV v1 store (if using version 1)
path "secret/mysticstars" {
  capabilities = ["read"]
}

# Allow token lookup for debugging
path "auth/token/lookup-self" {
  capabilities = ["read"]
}
EOF

# Write the policy to Vault
vault policy write mysticstars-policy mysticstars-policy.hcl
```

## Step 4: Store Secrets in Vault

For KV v1 (as specified in your requirements):

```bash
# Store secrets in KV v1 store
vault kv put secret/mysticstars \
  BLACKBOX_API_KEY="your-blackbox-api-key-here" \
  POSTGRES_URI="postgresql://username:password@host:5432/database" \
  TELEGRAM_BOT_TOKEN="your-telegram-bot-token" \
  TELEGRAM_CHAT_ID="your-telegram-chat-id"
```

For KV v2 (if you decide to upgrade):

```bash
# Enable KV v2 secrets engine
vault secrets enable -path=secret kv-v2

# Store secrets in KV v2 store
vault kv put secret/mysticstars \
  BLACKBOX_API_KEY="your-blackbox-api-key-here" \
  POSTGRES_URI="postgresql://username:password@host:5432/database" \
  TELEGRAM_BOT_TOKEN="your-telegram-bot-token" \
  TELEGRAM_CHAT_ID="your-telegram-chat-id"
```

## Step 5: Test Authentication

Test that the GitHub JWT authentication works:

```bash
# Test JWT authentication (you'll need a real JWT token from GitHub Actions)
# This is typically done within the GitHub Actions workflow
```

## GitHub Actions Configuration

Add the following secrets to your GitHub repository:

### Required GitHub Secrets

1. **VAULT_ADDR**
   - Your Vault server URL
   - Example: `https://vault.example.com`

2. **VAULT_ROLE**
   - The Vault role name created in Step 2
   - Example: `mysticstars-role`

3. **VAULT_SECRET_PATH**
   - Path to your secrets in Vault
   - For KV v1: `secret/mysticstars`
   - For KV v2: `secret/data/mysticstars`

4. **KUBECONFIG**
   - Base64 encoded Kubernetes configuration file
   - Generate with: `cat kubeconfig | base64 -w 0`

5. **VAULT_GITHUB_APP_ID** (if using GitHub App auth)
   - Your GitHub App ID
   - Alternative to direct JWT token approach

6. **VAULT_GITHUB_PRIVATE_KEY** (if using GitHub App auth)
   - Your GitHub App private key
   - Base64 encoded

## Security Best Practices

1. **Least Privilege**: Use specific claims and subjects in Vault roles
2. **Short TTL**: Set appropriate token TTL (1 hour is reasonable)
3. **Audit Logging**: Enable audit logging in Vault
4. **Regular Rotation**: Rotate secrets regularly
5. **Environment Separation**: Use different paths for dev/staging/prod

## Troubleshooting

### Common Issues

1. **"permission denied" errors**
   - Check Vault policy permissions
   - Verify role configuration
   - Ensure secret path is correct

2. **JWT authentication fails**
   - Verify GitHub repository path in bound_subject
   - Check OIDC discovery URL
   - Ensure GitHub Actions runner can reach Vault

3. **Secrets not found**
   - Verify secret path (KV v1 vs KV v2)
   - Check if secrets exist in Vault
   - Ensure correct mount point

### Debug Commands

```bash
# Check auth methods
vault auth list

# Check policies
vault policy list

# Check role configuration
vault read auth/github/role/mysticstars-role

# Check secret exists
vault kv get secret/mysticstars

# Test token lookup (with valid token)
vault token lookup <token>
```

## Integration with GitHub Actions

The GitHub Actions workflow will automatically:

1. Generate a JWT token from GitHub's OIDC provider
2. Authenticate to Vault using the JWT token
3. Retrieve secrets from the specified path
4. Create Kubernetes secrets dynamically
5. Deploy the application

No additional configuration is needed once the above steps are completed.

## Monitoring and Alerts

Consider setting up monitoring for:

- Vault authentication failures
- Secret access patterns
- Token expiration issues
- API rate limits

The pipeline includes Telegram notifications for deployment status to help monitor the deployment process.