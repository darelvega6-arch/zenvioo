# Configuración AWS Amplify - Zenvioo

## Variables de Entorno Requeridas

En AWS Amplify Console > Environment variables:

```
AWS_S3_BUCKET = zenvioo-storage
AWS_REGION = us-east-1
```

## Permisos IAM

El rol de Amplify necesita:
- AmazonS3FullAccess

## URL del API

Actualiza config.js con tu URL de Amplify:
```javascript
const API_URL = 'https://main.xxxxx.amplifyapp.com/api';
```

## Comandos Git para Deploy

```bash
git add .
git commit -m "Configurar AWS S3"
git push
```

Amplify redesplegará automáticamente.
