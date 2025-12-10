#!/bin/bash

set -e

echo "🔄 Rebuilding and Redeploying MysticStars with Blackbox AI..."

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Build Docker images with new tag to force update
echo "🏗️  Building Docker images..."
echo "📦 Building API image..."
docker build -t jcowey/mysticstars-api:blackbox-$(date +%s) -f backend/Dockerfile backend/

echo "📦 Building CronJob image..."
docker build -t jcowey/mysticstars-cronjob:blackbox-$(date +%s) -f backend/Dockerfile.cronjob backend/

# Also update latest tags
docker build -t jcowey/mysticstars-api:latest -f backend/Dockerfile backend/
docker build -t jcowey/mysticstars-cronjob:latest -f backend/Dockerfile.cronjob backend/

echo "🚀 Pushing images to registry..."
docker push jcowey/mysticstars-api:latest
docker push jcowey/mysticstars-cronjob:latest

echo "🔄 Restarting Kubernetes deployments..."
cd k8s

# Update the secret with your new Blackbox API key if needed
echo "⚠️  Make sure you've updated the BLACKBOX_API_KEY in secret.yaml!"

# Apply updated manifests
echo "📝 Applying updated ConfigMap..."
kubectl apply -f configmap.yaml

echo "🔐 Applying updated Secret..."
kubectl apply -f secret.yaml

echo "🔄 Restarting API deployment..."
kubectl rollout restart deployment/mysticstars-api -n mysticstars

echo "⏳ Waiting for API deployment to be ready..."
kubectl rollout status deployment/mysticstars-api -n mysticstars --timeout=300s

echo "🔄 Updating CronJobs..."
kubectl apply -f cronjobs.yaml

echo "📊 Checking deployment status..."
kubectl get all -n mysticstars

echo ""
echo "🎉 Rebuild and redeploy completed!"
echo ""
echo "🧪 Test the new setup:"
echo "1. Check API health:"
echo "   kubectl port-forward service/mysticstars-api 3000:3000 -n mysticstars"
echo "   curl http://localhost:3000/api/health"
echo ""
echo "2. Test Blackbox AI integration:"
echo "   kubectl exec -it deployment/mysticstars-api -n mysticstars -- node test-blackbox.js"
echo ""
echo "3. Run a manual reading generation:"
echo "   kubectl create job --from=cronjob/daily-readings-generator manual-test-$(date +%s) -n mysticstars"
echo "   kubectl logs -f job/manual-test-<job-id> -n mysticstars"
echo ""
echo "📋 If you see any issues:"
echo "   kubectl logs -f deployment/mysticstars-api -n mysticstars"