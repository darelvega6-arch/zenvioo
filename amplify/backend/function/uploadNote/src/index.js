const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body);
    const { content, userId, authorName, authorImage } = body;

    const noteData = {
      noteId: `note_${Date.now()}_${userId}`,
      content, userId, authorName, authorImage,
      timestamp: Date.now(),
      likes: 0
    };

    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `notes/${noteData.noteId}.json`,
      Body: JSON.stringify(noteData),
      ContentType: 'application/json'
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, note: noteData })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
