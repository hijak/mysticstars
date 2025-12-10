# MysticStars Kubernetes Deployment

## Overview

This directory contains Kubernetes manifests for deploying MysticStars horoscope application with **Blackbox AI / DeepSeek** integration.

## Prerequisites

- Kubernetes cluster (v1.20+)
- kubectl installed and configured
- Docker for building images
- Blackbox AI API key from your subscription

## Quick Start

### 1. Set up your API key

First, encode your Blackbox AI API key to base64:

```bash
echo -n "your-blackbox-api-key-here" | base64
```

Then update the secret in `secret.yaml`:

```yaml
data:
  BLACKBOX_API_KEY: "your-base64-encoded-key-here"
```

### 2. Deploy to Kubernetes

```bash
# Make the deploy script executable (if needed)
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

### 3. Update API key after deployment (alternative method)

```bash
kubectl patch secret mysticstars-secrets -n mysticstars \
  -p='{"data":{"BLACKBOX_API_KEY":"your-base64-encoded-key"}}'
```

## Architecture

### Components

- **API Service** (`api-deployment.yaml`): Main API server for horoscope readings
- **CronJobs** (`cronjobs.yaml`): Automated reading generation
  - Daily readings: Every day at 1:00 AM UTC
  - Weekly readings: Every Sunday at 2:00 AM UTC  
  - Monthly readings: 1st of each month at 3:00 AM UTC
  - Yearly readings: January 1st at 4:00 AM UTC
- **PostgreSQL Database**: Stores generated readings
- **ConfigMap** (`configmap.yaml`): Configuration settings
- **Secret** (`secret.yaml`): API keys and sensitive data

### Environment Variables

#### From ConfigMap:
- `NODE_ENV`: Production environment
- `PORT`: API server port (3000)
- `POSTGRES_URI`: Database connection string
- `API_BASE_URL`: Internal API URL for cronjobs
- `FRONTEND_URL`: Frontend application URL
- `BLACKBOX_MODEL`: AI model to use (blackboxai/deepseek/deepseek-chat:free)

#### From Secret:
- `BLACKBOX_API_KEY`: Your Blackbox AI API key

## Monitoring

### Check deployment status:
```bash
kubectl get all -n mysticstars
```

### View API logs:
```bash
kubectl logs -f deployment/mysticstars-api -n mysticstars
```

### View cronjob logs:
```bash
kubectl logs -f job/daily-readings-generator-<job-id> -n mysticstars
```

### Test API health:
```bash
# Port forward to local machine
kubectl port-forward service/mysticstars-api 3000:3000 -n mysticstars

# Test in another terminal
curl http://localhost:3000/api/health
```

## Manual Operations

### Generate readings manually:
```bash
# Create a manual job from the daily cronjob
kubectl create job --from=cronjob/daily-readings-generator manual-daily-$(date +%s) -n mysticstars

# Check job status
kubectl get jobs -n mysticstars
```

### Scale API replicas:
```bash
kubectl scale deployment mysticstars-api --replicas=3 -n mysticstars
```

## Troubleshooting

### Common Issues

1. **API Key Invalid**: Verify your Blackbox AI API key is correct and properly base64 encoded
2. **Database Connection**: Check PostgreSQL service is running and connection string is correct
3. **Image Pull Errors**: Ensure Docker images are built and pushed to accessible registry

### Debug Commands

```bash
# Check pod status
kubectl describe pod <pod-name> -n mysticstars

# Check events
kubectl get events -n mysticstars --sort-by='.firstTimestamp'

# Check secrets
kubectl get secret mysticstars-secrets -n mysticstars -o yaml

# Check configmap
kubectl get configmap mysticstars-config -n mysticstars -o yaml
```

## Configuration Updates

### Update AI Model

To change the AI model, update the ConfigMap:

```bash
kubectl patch configmap mysticstars-config -n mysticstars \
  -p='{"data":{"BLACKBOX_MODEL":"blackboxai/deepseek/deepseek-chat:free"}}'

# Restart API pods to pick up the change
kubectl rollout restart deployment/mysticstars-api -n mysticstars
```

### Update Frontend URL

```bash
kubectl patch configmap mysticstars-config -n mysticstars \
  -p='{"data":{"FRONTEND_URL":"https://your-new-domain.com"}}'
```

## Security Notes

- API keys are stored in Kubernetes secrets (encrypted at rest)
- Pods run as non-root user (UID 1001)
- Read-only root filesystem disabled for application files
- No privilege escalation allowed
- Network policies can be added for additional security

## Cost Optimization

The deployment uses:
- **Blackbox AI free tier**: Cost-effective AI model access
- **Resource limits**: Prevents resource overconsumption
- **Horizontal Pod Autoscaling**: Can be configured for automatic scaling
- **CronJob history limits**: Prevents log buildup

## Migration from Gemini

This deployment has been updated from Google Gemini to Blackbox AI:
- Old: `GEMINI_API_KEY` → New: `BLACKBOX_API_KEY`
- Old: `GEMINI_MODEL` → New: `BLACKBOX_MODEL`
- Model: `blackboxai/deepseek/deepseek-chat:free`
- API format: OpenAI-compatible (easier to migrate in future)

## Support

For issues with:
- **Kubernetes deployment**: Check this README and Kubernetes documentation
- **Blackbox AI**: Check your Blackbox.ai subscription and API documentation
- **Application bugs**: Check application logs and code repository