# MysticStars Deployment Guide

This guide covers the complete deployment process for the MysticStars application using GitHub Actions and HashiCorp Vault.

## Overview

The deployment pipeline automates the following process:

1. **Code Quality & Testing** - Linting, unit tests, security scanning
2. **Container Building** - Build and push images to GitHub Container Registry
3. **Security Scanning** - Container vulnerability scanning with Trivy
4. **Vault Integration** - Retrieve secrets dynamically from HashiCorp Vault
5. **Kubernetes Deployment** - Deploy API and CronJobs with rolling updates
6. **Health Checks** - Verify deployment success and API functionality

## Architecture

```
GitHub Repository → GitHub Actions → Vault → GHCR → Kubernetes Cluster
```

- **Source**: GitHub repository (jcowey/mysticstars)
- **CI/CD**: GitHub Actions workflows
- **Secrets**: HashiCorp Vault with JWT authentication
- **Registry**: GitHub Container Registry (ghcr.io)
- **Target**: Kubernetes cluster with Ingress

## Prerequisites

### 1. Kubernetes Cluster

- Kubernetes v1.25+ (tested with v1.28.0)
- Nginx Ingress Controller
- Persistent storage for PostgreSQL
- Network policies if required

### 2. HashiCorp Vault

- Vault server v1.15.0+
- JWT authentication enabled at `/github` path
- KV v1 secrets engine with secrets stored
- See [VAULT_SETUP.md](./VAULT_SETUP.md) for detailed configuration

### 3. GitHub Repository

- Repository with GitHub Actions enabled
- OIDC trust relationship with Vault configured
- Required secrets configured in GitHub Settings

## GitHub Secrets Configuration

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### Required Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VAULT_ADDR` | Vault server URL | `https://vault.example.com` |
| `VAULT_ROLE` | Vault role for GitHub JWT | `mysticstars-role` |
| `VAULT_SECRET_PATH` | Path to secrets in Vault | `secret/mysticstars` |
| `KUBECONFIG` | Base64 encoded kubeconfig file | `(base64 output)` |
| `VAULT_GITHUB_APP_ID` | GitHub App ID for auth | `123456` |
| `VAULT_GITHUB_PRIVATE_KEY` | GitHub App private key | `(base64 output)` |

### Optional Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SLACK_WEBHOOK` | Slack notifications | `https://hooks.slack.com/...` |
| `NOTIFICATION_EMAIL` | Email for alerts | `admin@example.com` |

## Deployment Process

### Automatic Deployment

The pipeline triggers automatically on:

- **Push to main branch** → Full production deployment
- **Pull requests** → Testing and validation only
- **Manual dispatch** → On-demand deployment

### Manual Deployment

1. Go to Actions tab in your GitHub repository
2. Select "Deploy to Kubernetes" workflow
3. Click "Run workflow"
4. Choose branch (default: main)
5. Click "Run workflow"

### Pipeline Stages

1. **Code Quality & Testing**
   - Node.js linting
   - Unit tests with Jest
   - npm security audit

2. **Build & Security**
   - Build API and CronJob Docker images
   - Push to GitHub Container Registry
   - Container vulnerability scanning with Trivy
   - Upload results to GitHub Security tab

3. **Vault Integration**
   - GitHub JWT authentication to Vault
   - Retrieve application secrets
   - Create Kubernetes secrets dynamically

4. **Kubernetes Deployment**
   - Update image tags in manifests
   - Apply secrets and configurations
   - Deploy API with rolling updates
   - Deploy CronJobs
   - Health checks and validation

5. **Post-Deployment**
   - API endpoint testing
   - CronJob status verification
   - Telegram notifications for deployment status

## Application Components

### API Service

- **Image**: `ghcr.io/jcowey/mysticstars/mysticstars-api:latest`
- **Replicas**: 2 (with rolling updates)
- **Port**: 3000
- **Health Checks**: `/api/health/live` and `/api/health/ready`
- **Resources**: 200m CPU, 256Mi memory (requests)

### CronJobs

| CronJob | Schedule | Purpose |
|---------|----------|---------|
| `daily-readings-generator` | `0 1 * * *` | Daily horoscope readings |
| `weekly-readings-generator` | `0 2 * * 0` | Weekly horoscope readings |
| `monthly-readings-generator` | `0 3 1 * *` | Monthly horoscope readings |
| `yearly-readings-generator` | `0 4 1 1 *` | Yearly horoscope readings |
| `monitoring-cronjob` | `*/30 * * * *` | Application monitoring |

### Secrets Management

All sensitive data is stored in Vault and injected at deployment time:

- `BLACKBOX_API_KEY` - Blackbox AI API authentication
- `POSTGRES_URI` - Database connection string
- `TELEGRAM_BOT_TOKEN` - Monitoring bot token
- `TELEGRAM_CHAT_ID` - Alert destination

## Monitoring and Alerts

### Health Endpoints

- **Liveness**: `/api/health/live` - Service is running
- **Readiness**: `/api/health/ready` - Service is ready for traffic
- **API Root**: `/api/` - Basic API status

### Logging

- Application logs are sent to stdout/stderr
- Kubernetes collects logs for all pods
- GitHub Actions captures deployment logs
- Telegram alerts for deployment failures

### Metrics

- Container resource usage (CPU, memory)
- API response times and error rates
- Database connection pool status
- Blackbox AI API response times

## Troubleshooting

### Common Issues

1. **Vault Authentication Failed**
   ```
   Error: permission denied
   ```
   - Check VAULT_ROLE is correct
   - Verify GitHub repository path in Vault role
   - Ensure JWT token is valid

2. **Image Pull Failed**
   ```
   Error: ImagePullBackOff
   ```
   - Check GitHub Container Registry permissions
   - Verify image tags exist
   - Check registry authentication

3. **Pod CrashLoopBackOff**
   ```
   Error: CrashLoopBackOff
   ```
   - Check application logs: `kubectl logs pod-name`
   - Verify secrets are properly injected
   - Check database connectivity

4. **Health Check Failed**
   ```
   Error: Liveness probe failed
   ```
   - Check if application is binding to correct port
   - Verify health endpoints are working
   - Check for application startup errors

### Debug Commands

```bash
# Check deployment status
kubectl get deployments -n mysticstars
kubectl get pods -n mysticstars

# Check pod logs
kubectl logs deployment/mysticstars-api -n mysticstars

# Check CronJobs
kubectl get cronjobs -n mysticstars
kubectl get jobs -n mysticstars

# Check secrets
kubectl get secrets -n mysticstars
kubectl describe secret mysticstars-secrets -n mysticstars

# Check service status
kubectl get services -n mysticstars
kubectl get ingress -n mysticstars

# Debug Vault authentication
vault auth list
vault read auth/github/role/mysticstars-role
```

### Rollback Procedures

**Automatic Rollback**
- Pipeline automatically rolls back on deployment failure
- Kubernetes provides rollback capabilities for deployments

**Manual Rollback**
```bash
# Check deployment history
kubectl rollout history deployment/mysticstars-api -n mysticstars

# Rollback to previous revision
kubectl rollout undo deployment/mysticstars-api -n mysticstars

# Rollback to specific revision
kubectl rollout undo deployment/mysticstars-api --to-revision=2 -n mysticstars
```

## Performance Tuning

### Container Resources

Adjust resource requests and limits in `k8s/api-deployment.yaml`:

```yaml
resources:
  requests:
    cpu: 200m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

### Database Optimization

- Connection pooling configuration
- Query optimization for horoscope generation
- Regular database maintenance

### Caching Strategy

- Redis caching for frequently accessed readings
- CDN for static frontend assets
- Application-level caching for API responses

## Security Considerations

### Network Security

- Use network policies to restrict pod communication
- Implement TLS for all external communications
- Regular security scanning of containers

### Secret Management

- Rotate API keys regularly
- Use short-lived tokens
- Implement Vault audit logging

### Application Security

- Input validation and sanitization
- Rate limiting on API endpoints
- Regular dependency updates

## Maintenance

### Regular Tasks

1. **Weekly**
   - Check for security updates
   - Review deployment logs
   - Monitor resource usage

2. **Monthly**
   - Rotate secrets in Vault
   - Update dependencies
   - Review and optimize CronJob schedules

3. **Quarterly**
   - Full security audit
   - Performance optimization
   - Disaster recovery testing

### Backup Strategy

- Database backups (PostgreSQL)
- Kubernetes configuration backups
- Vault policy and role backups
- GitHub repository backups

## Support

For issues with:

- **GitHub Actions**: Check Actions tab in repository
- **Vault**: Refer to HashiCorp Vault documentation
- **Kubernetes**: Check cluster logs and events
- **Application**: Review application logs and health status

For critical issues, use the Telegram alert system to notify the team immediately.