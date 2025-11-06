#!/bin/bash

echo "🚀 Configuración Automática de AWS para Zenvioo"
echo "================================================"
echo ""

# Verificar si AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI no está instalado"
    echo "Instalando AWS CLI..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
fi

echo "✅ AWS CLI instalado"
echo ""

# Configurar credenciales
echo "📝 Configurando credenciales de AWS..."
echo "Necesito tus credenciales de AWS:"
read -p "AWS Access Key ID: " AWS_KEY
read -sp "AWS Secret Access Key: " AWS_SECRET
echo ""
read -p "Región (default: us-east-1): " AWS_REGION
AWS_REGION=${AWS_REGION:-us-east-1}

aws configure set aws_access_key_id "$AWS_KEY"
aws configure set aws_secret_access_key "$AWS_SECRET"
aws configure set region "$AWS_REGION"
aws configure set output json

echo "✅ Credenciales configuradas"
echo ""

# Crear bucket S3
BUCKET_NAME="zenvioo-storage-$(date +%s)"
echo "📦 Creando bucket S3: $BUCKET_NAME"

aws s3api create-bucket \
    --bucket "$BUCKET_NAME" \
    --region "$AWS_REGION" \
    --acl public-read 2>/dev/null || echo "Bucket ya existe o error"

# Configurar CORS
echo "🔧 Configurando CORS..."
cat > /tmp/cors.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": []
    }
  ]
}
EOF

aws s3api put-bucket-cors \
    --bucket "$BUCKET_NAME" \
    --cors-configuration file:///tmp/cors.json

echo "✅ CORS configurado"
echo ""

# Obtener URL de Amplify
echo "🔍 Buscando tu app de Amplify..."
AMPLIFY_APP=$(aws amplify list-apps --query "apps[0].defaultDomain" --output text 2>/dev/null)

if [ -z "$AMPLIFY_APP" ] || [ "$AMPLIFY_APP" == "None" ]; then
    echo "⚠️  No se encontró app de Amplify automáticamente"
    read -p "Ingresa tu URL de Amplify (ej: main.d123.amplifyapp.com): " AMPLIFY_APP
fi

AMPLIFY_URL="https://$AMPLIFY_APP"
echo "✅ URL de Amplify: $AMPLIFY_URL"
echo ""

# Actualizar config.js
echo "📝 Actualizando config.js..."
cat > config.js << EOF
// Configuración de API
const API_URL = '$AMPLIFY_URL/api';

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_URL };
}
EOF

echo "✅ config.js actualizado"
echo ""

# Configurar variables en Amplify
echo "🔧 Configurando variables de entorno en Amplify..."
AMPLIFY_APP_ID=$(aws amplify list-apps --query "apps[0].appId" --output text 2>/dev/null)

if [ ! -z "$AMPLIFY_APP_ID" ] && [ "$AMPLIFY_APP_ID" != "None" ]; then
    aws amplify update-app \
        --app-id "$AMPLIFY_APP_ID" \
        --environment-variables \
            AWS_S3_BUCKET="$BUCKET_NAME" \
            AWS_REGION="$AWS_REGION" 2>/dev/null
    
    echo "✅ Variables configuradas en Amplify"
else
    echo "⚠️  Configura manualmente en Amplify Console:"
    echo "   AWS_S3_BUCKET = $BUCKET_NAME"
    echo "   AWS_REGION = $AWS_REGION"
fi

echo ""
echo "✅ CONFIGURACIÓN COMPLETA"
echo "=========================="
echo "Bucket S3: $BUCKET_NAME"
echo "Región: $AWS_REGION"
echo "URL API: $AMPLIFY_URL/api"
echo ""
echo "🚀 Ahora haz:"
echo "   git add ."
echo "   git commit -m 'Configurar AWS'"
echo "   git push"
