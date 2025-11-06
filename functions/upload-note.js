import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { content, userId, authorName, authorImage, imageData, fileName, contentType } = await context.request.json();

    const s3Client = new S3Client({
      region: context.env.AWS_REGION,
      credentials: {
        accessKeyId: context.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: context.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    let imageUrl = null;

    if (imageData) {
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      const key = `notes/${userId}/${Date.now()}_${fileName}`;

      await s3Client.send(new PutObjectCommand({
        Bucket: context.env.AWS_S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }));

      imageUrl = `https://${context.env.AWS_S3_BUCKET}.s3.${context.env.AWS_REGION}.amazonaws.com/${key}`;
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
      Bucket: context.env.AWS_S3_BUCKET,
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
