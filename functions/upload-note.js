import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function uploadNote(request, env) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { content, userId, authorName, authorImage, imageData, fileName, contentType } = await request.json();

    const s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });

    let imageUrl = null;

    if (imageData) {
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      const key = `notes/${userId}/${Date.now()}_${fileName}`;

      await s3Client.send(new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }));

      imageUrl = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
    }

    const noteData = {
      noteId: `note_${Date.now()}_${userId}`,
      content,
      userId,
      authorName,
      authorImage,
      imageUrl,
      timestamp: Date.now(),
      likes: 0
    };

    const noteKey = `notes/${noteData.noteId}.json`;
    await s3Client.send(new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: noteKey,
      Body: JSON.stringify(noteData),
      ContentType: 'application/json',
    }));

    return new Response(JSON.stringify({ success: true, note: noteData }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
