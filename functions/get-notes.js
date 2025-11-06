import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

export async function getNotes(request, env) {
  try {
    const s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const listCommand = new ListObjectsV2Command({
      Bucket: env.AWS_S3_BUCKET,
      Prefix: 'notes/',
    });

    const listResponse = await s3Client.send(listCommand);
    const notes = [];

    if (listResponse.Contents) {
      for (const item of listResponse.Contents.slice(0, 50)) {
        if (item.Key.endsWith('.json')) {
          const getCommand = new GetObjectCommand({
            Bucket: env.AWS_S3_BUCKET,
            Key: item.Key,
          });
          const response = await s3Client.send(getCommand);
          const body = await response.Body.transformToString();
          notes.push(JSON.parse(body));
        }
      }
    }

    notes.sort((a, b) => b.timestamp - a.timestamp);

    return new Response(JSON.stringify({ notes }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
