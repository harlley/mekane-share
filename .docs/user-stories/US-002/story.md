# User Stories - Mekane Share Extension

## US-002: Screenshot Upload and Storage

**As a** extension user  
**I want** my screenshots to be automatically stored  
**So that** I can easily share image URLs

### Acceptance Criteria:
1. API should accept PNG image uploads via POST `/upload`
2. Images should be stored in Cloudflare R2
3. Each image should receive a unique ID
4. API should return a public URL for image viewing

### User Flow:
1. Backend receives a POST request with the image
2. Validates the received file (PNG format)
3. Generates a unique ID for the image
4. Stores the image in R2
5. Returns the public URL where the image can be viewed

### Technical Notes:
- Endpoint: POST `/upload` with multipart/form-data
- Response format: `{ url: string }`
- Use Cloudflare R2 for storage
- Basic format and size validation
- Essential error logging
- Success metric: Upload completed in less than 2 seconds
