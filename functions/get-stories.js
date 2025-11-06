import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

export async function onRequest(context) {
  try {
    const url = new URL(context.request.url);
    const userId = url.searchParams.get('userId');

    const s3Client = new S3Client({
      region: context.env.AWS_REGION,
      credentials: {
        accessKeyId: context.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: context.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const prefix = userId ? `stories/${userId}/` : 'stories/';
    
    const listCommand = new ListObjectsV2Command({
      Bucket: context.env.AWS_S3_BUCKET,
      Prefix: prefix,
    });

    const listResponse = await s3Client.send(listCommand);
    const stories = [];

    if (listResponse.Contents) {
      for (const item of listResponse.Contents) {
        if (item.Key.endsWith('.json')) {
          const getCommand = new GetObjectCommand({
            Bucket: context.env.AWS_S3_BUCKET,
            Key: item.Key,
          });
          const response = await s3Client.send(getCommand);
          const body = await response.Body.transformToString();
          stories.push(JSON.parse(body));
        }
      }
    }

    return new Response(JSON.stringify({ stories }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
