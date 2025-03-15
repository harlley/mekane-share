import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
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

console.log('Creating S3 client...');

// First, test basic connectivity to Cloudflare
console.log('Testing basic connectivity to Cloudflare...');
const endpoint = `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;
console.log(`Endpoint: ${endpoint}`);

// Create a custom HTTPS agent with longer timeout
const httpsAgent = new https.Agent({
  timeout: 30000, // 30 seconds
  keepAlive: true,
});

// Create S3 client for Cloudflare R2 with custom agent
const s3Client = new S3Client({
  region: 'auto',
  endpoint,
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

console.log(`Testing access to bucket: ${targetBucket}`);
console.log('Sending request...');

// Add timeout to prevent hanging (longer timeout - 30 seconds)
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => {
    reject(new Error('Request timed out after 30 seconds'));
  }, 30000);
});

// Test bucket access with timeout
Promise.race([
  s3Client.send(new HeadBucketCommand({ Bucket: targetBucket })),
  timeoutPromise,
])
  .then(() => {
    console.log(
      `✅ Success! Bucket '${targetBucket}' exists and is accessible.`
    );
  })
  .catch((error) => {
    console.error('❌ Error:');
    console.error(error.message || error);

    if (error.name === 'TimeoutError' || error.message?.includes('timed out')) {
      console.error('\nThe request timed out. This could be due to:');
      console.error('- Network connectivity issues');
      console.error('- Firewall or proxy blocking the connection');
      console.error('- Cloudflare R2 service being temporarily unavailable');
      console.error('\nTry these troubleshooting steps:');
      console.error('1. Check if you can ping the endpoint');
      console.error('2. Check if there are any Cloudflare service issues');
      console.error('3. Try again later as this might be a temporary issue');
    }
  });
