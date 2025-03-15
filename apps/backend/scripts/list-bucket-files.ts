import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
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

async function listFiles() {
  console.log(`Listing files in bucket '${targetBucket}'...`);

  try {
    // Create the list command
    const listCommand = new ListObjectsV2Command({
      Bucket: targetBucket,
    });

    // List the files
    const response = await s3Client.send(listCommand);

    if (response.Contents && response.Contents.length > 0) {
      console.log(
        `\n✅ Found ${response.Contents.length} files in the bucket:`
      );

      response.Contents.forEach((item, index) => {
        console.log(
          `${index + 1}. ${item.Key} (${formatBytes(item.Size || 0)}, Last Modified: ${item.LastModified})`
        );
      });
    } else {
      console.log('No files found in the bucket.');
    }

    return response;
  } catch (error) {
    console.error('❌ Error listing files:');
    console.error(error);
    process.exit(1);
  }
}

// Helper function to format bytes
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Execute the listing
listFiles();
