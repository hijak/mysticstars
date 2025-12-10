#!/bin/bash

set -e

echo "🚀 Deploying MysticStars to Kubernetes..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Check if we're connected to a cluster
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Not connected to a Kubernetes cluster"
    exit 1
fi

echo "✅ Connected to Kubernetes cluster"

# Apply configurations in order
echo "📝 Creating namespace..."
kubectl apply -f namespace.yaml

echo "🔧 Creating ConfigMap..."
kubectl apply -f configmap.yaml

echo "🔐 Creating Secret (make sure to update with your actual Blackbox API key)..."
kubectl apply -f secret.yaml


#docker build -t jcowey/mysticstars-api:latest -f backend/Dockerfile backend/
#docker build -t jcowey/mysticstars-cronjob:latest -f backend/Dockerfile.cronjob backend/
#docker push jcowey/mysticstars-api:latest
#docker push jcowey/mysticstars-cronjob:latest

#echo "🍃 Deploying MongoDB..."
#kubectl apply -f mongodb.yaml
#
#echo "⏳ Waiting for MongoDB to be ready..."
#kubectl wait --for=condition=available --timeout=300s deployment/mongodb -n mysticstars

echo "🌐 Deploying API service..."
kubectl apply -f api-deployment.yaml

echo "⏳ Waiting for API to be ready..."
kubectl wait --for=condition=available --timeout=180s deployment/mysticstars-api -n mysticstars

echo "⏰ Creating CronJobs..."
kubectl apply -f cronjobs.yaml

#echo "🔗 Creating Ingress..."
#kubectl apply -f ingress.yaml

echo "📊 Deployment Status:"
echo "===================="
kubectl get all -n mysticstars

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Update the secret with your actual Blackbox AI API key:"
echo "   kubectl patch secret mysticstars-secrets -n mysticstars -p='{\"data\":{\"BLACKBOX_API_KEY\":\"<base64-encoded-key>\"}}'"
echo ""
echo "2. Build and push your Docker images:"
echo "   docker build -t jcowey/mysticstars-api:latest -f backend/Dockerfile backend/"
echo "   docker build -t jcowey/mysticstars-cronjob:latest -f backend/Dockerfile.cronjob backend/"
echo "   docker push jcowey/mysticstars-api:latest"
echo "   docker push jcowey/mysticstars-cronjob:latest"
echo ""
echo "3. Update the image names in the YAML files with your registry"
echo ""
echo "4. Check the logs:"
echo "   kubectl logs -f deployment/mysticstars-api -n mysticstars"
echo ""
echo "5. Test the API:"
echo "   kubectl port-forward service/mysticstars-api 3000:3000 -n mysticstars"
echo "   curl http://localhost:3000/api/health"
echo ""
echo "6. Generate initial readings manually (optional):"
echo "   kubectl create job --from=cronjob/daily-readings-generator manual-daily-$(date +%s) -n mysticstars"
