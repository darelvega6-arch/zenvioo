const { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({ 
  region: process.env.AWS_REGION || 'us-east-1'
});

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path;
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    if (path === '/api/upload-note' && event.httpMethod === 'POST') {
      const { content, userId, authorName, authorImage, imageData, fileName, contentType } = body;
      let imageUrl = null;

      if (imageData) {
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const key = `notes/${userId}/${Date.now()}_${fileName}`;

        await s3Client.send(new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }));

        imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      }

      const noteData = {
        noteId: `note_${Date.now()}_${userId}`,
        content, userId, authorName, authorImage, imageUrl,
        timestamp: Date.now(),
        likes: 0
      };

      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `notes/${noteData.noteId}.json`,
        Body: JSON.stringify(noteData),
        ContentType: 'application/json',
      }));

      return { statusCode: 200, headers, body: JSON.stringify({ success: true, note: noteData }) };
    }

    if (path === '/api/get-notes') {
      const list = await s3Client.send(new ListObjectsV2Command({
        Bucket: process.env.AWS_S3_BUCKET,
        Prefix: 'notes/',
      }));

      const notes = [];
      if (list.Contents) {
        for (const item of list.Contents.slice(0, 50)) {
          if (item.Key.endsWith('.json')) {
            const obj = await s3Client.send(new GetObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET,
              Key: item.Key,
            }));
            const text = await obj.Body.transformToString();
            notes.push(JSON.parse(text));
          }
        }
      }

      notes.sort((a, b) => b.timestamp - a.timestamp);
      return { statusCode: 200, headers, body: JSON.stringify({ notes }) };
    }

    if (path === '/api/upload-image' && event.httpMethod === 'POST') {
      const { imageData, fileName, userId, contentType, imageType } = body;
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const key = `${imageType}/${userId}/${Date.now()}_${fileName}`;

      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }));

      const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      return { statusCode: 200, headers, body: JSON.stringify({ imageUrl }) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };

  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
