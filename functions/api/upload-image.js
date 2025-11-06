import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { imageData, fileName, userId, contentType, imageType } = await context.request.json();

    const s3Client = new S3Client({
      region: context.env.AWS_REGION,
      credentials: {
        accessKeyId: context.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: context.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const key = `${imageType}/${userId}/${Date.now()}_${fileName}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: context.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));

    const imageUrl = `https://${context.env.AWS_S3_BUCKET}.s3.${context.env.AWS_REGION}.amazonaws.com/${key}`;

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
