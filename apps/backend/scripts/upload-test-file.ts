/* eslint-disable no-console */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import https from 'https';

// Load environment variables
dotenv.config();

// Use the correct environment variable names
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const CLOUDFLARE_SECRET_ACCESS_KEY =
  process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

// Check if all required environment variables are set
if (
  !CLOUDFLARE_ACCOUNT_ID ||
  !CLOUDFLARE_ACCESS_KEY_ID ||
  !CLOUDFLARE_SECRET_ACCESS_KEY
) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Create a custom HTTPS agent with longer timeout
const httpsAgent = new https.Agent({
  timeout: 30000, // 30 seconds
  keepAlive: true,
});

// Create S3 client for Cloudflare R2 with custom agent
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: CLOUDFLARE_SECRET_ACCESS_KEY,
  },
  requestHandler: {
    httpOptions: {
      agent: httpsAgent,
    },
  },
});

const targetBucket = 'mekane-share';
const fileName = 'test-file.txt';
const fileContent =
  'Hello from Mekane Share! This is a test file uploaded on ' +
  new Date().toISOString();

async function uploadFile() {
  console.log(`Uploading file '${fileName}' to bucket '${targetBucket}'...`);

  try {
    // Create the upload command
    const uploadCommand = new PutObjectCommand({
      Bucket: targetBucket,
      Key: fileName,
      Body: fileContent,
      ContentType: 'text/plain',
      Metadata: {
        'uploaded-by': 'mekane-share-test-script',
        timestamp: new Date().toISOString(),
      },
    });

    // Upload the file
    const response = await s3Client.send(uploadCommand);

    console.log('✅ File uploaded successfully!');
    console.log(`ETag: ${response.ETag}`);
    console.log(
      `Public URL: https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${targetBucket}/${fileName}`
    );

    return response;
  } catch (error) {
    console.error('❌ Error uploading file:');
    console.error(error);
    process.exit(1);
  }
}

// Execute the upload
uploadFile();
