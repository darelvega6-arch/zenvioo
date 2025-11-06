const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const s3 = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    const list = await s3.send(new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: 'notes/'
    }));

    const notes = [];
    if (list.Contents) {
      for (const item of list.Contents.slice(0, 50)) {
        if (item.Key.endsWith('.json')) {
          const obj = await s3.send(new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: item.Key
          }));
          const text = await obj.Body.transformToString();
          notes.push(JSON.parse(text));
        }
      }
    }

    notes.sort((a, b) => b.timestamp - a.timestamp);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ notes })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
