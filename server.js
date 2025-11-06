const express = require('express');
const cors = require('cors');
const { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.post('/api/upload-image', async (req, res) => {
  try {
    const { imageData, fileName, userId, contentType, imageType } = req.body;
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
    res.json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/upload-note', async (req, res) => {
  try {
    const { content, userId, authorName, authorImage, imageData, fileName, contentType } = req.body;
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
      Bucket: process.env.AWS_S3_BUCKET,
      Key: noteKey,
      Body: JSON.stringify(noteData),
      ContentType: 'application/json',
    }));

    res.json({ success: true, note: noteData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/get-notes', async (req, res) => {
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: 'notes/',
    });

    const listResponse = await s3Client.send(listCommand);
    const notes = [];

    if (listResponse.Contents) {
      for (const item of listResponse.Contents.slice(0, 50)) {
        if (item.Key.endsWith('.json')) {
          const getCommand = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: item.Key,
          });
          const response = await s3Client.send(getCommand);
          const body = await response.Body.transformToString();
          notes.push(JSON.parse(body));
        }
      }
    }

    notes.sort((a, b) => b.timestamp - a.timestamp);
    res.json({ notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/get-stories', async (req, res) => {
  try {
    const userId = req.query.userId;
    const prefix = userId ? `stories/${userId}/` : 'stories/';
    
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: prefix,
    });

    const listResponse = await s3Client.send(listCommand);
    const stories = [];

    if (listResponse.Contents) {
      for (const item of listResponse.Contents) {
        if (item.Key.endsWith('.json')) {
          const getCommand = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: item.Key,
          });
          const response = await s3Client.send(getCommand);
          const body = await response.Body.transformToString();
          stories.push(JSON.parse(body));
        }
      }
    }

    res.json({ stories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/like-note', async (req, res) => {
  res.json({ success: true, likes: 1 });
});

app.post('/delete-note', async (req, res) => {
  res.json({ success: true });
});

app.post('/manage-following', async (req, res) => {
  res.json({ success: true });
});

app.post('/manage-notifications', async (req, res) => {
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}

module.exports = app;
