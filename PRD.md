## Product Requirements Document: Mekane Share - Chrome Extension

### 1. Introduction

#### 1.1. Project Overview
Mekane Share is a lightweight Chrome extension that simplifies screenshot capture and instant sharing via public URLs. With the option for self-hosting, the project offers control and security, catering to businesses and users who prioritize privacy.

#### 1.2. Problem Statement
Sharing screenshots is complex, involving multiple steps. Mekane Share aims to streamline this process, offering flexibility with default or self-hosting.

#### 1.3. Project Vision
To create an intuitive extension that speeds up screenshot sharing, allowing users to choose between default hosting (Cloudflare Workers) or their own servers without sacrificing control or privacy.

#### 1.4. Goals
- **Primary:** Develop an extension that captures screens and generates URLs within 2 seconds, with hosting options.
- **Secondary:** Achieve 1,000 weekly active users within the first 3 months.
- **Tertiary:** Maintain an average user rating of 4.5 stars on the Chrome Web Store.

#### 1.5. Target Audience
- Developers sharing code.
- Designers sharing mockups.
- Educators sharing visual materials.
- Users who need to share captures quickly.
- Businesses needing control over shared data.

#### 1.6. Key Differentiators
- Self-hosting capability for control and security.
- Option to use default server (Cloudflare Workers) for ease of use.
- Flexible server configuration from the extension.

#### 1.7. Competitive Analysis
Mekane Share enters a market with established screenshot and sharing tools. Below is an analysis of key competitors, their strengths, weaknesses, and how Mekane Share stands apart.

- **Awesome Screenshot:**
  - **Description:** A popular Chrome extension for screen capture and annotation, offering full-page, selected area, and editing tools.
  - **Strengths:** Rich feature set (e.g., annotations, blur tools), intuitive interface.
  - **Weaknesses:** Relies on external servers with no self-hosting option; free version limits storage and features (e.g., 30-second video cap).
  - **Mekane Share Edge:** Faster URL generation (target: 2 seconds vs. Awesome’s 3–5 seconds based on user reports), self-hosting option.

- **Loom:**
  - **Description:** A platform focused on screen recording and video sharing for asynchronous communication.
  - **Strengths:** Simple video sharing, integrations (e.g., Slack), user-friendly.
  - **Weaknesses:** Video-centric (less focus on static screenshots), no self-hosting, free tier caps recordings at 5 minutes.
  - **Mekane Share Edge:** Static screenshot focus, self-hosting for privacy, no recording length limits.

- **Monosnap:**
  - **Description:** A capture and annotation tool with cloud storage and desktop app support.
  - **Strengths:** Robust annotations (e.g., shapes, text), cloud upload options.
  - **Weaknesses:** Requires desktop app for full functionality, no self-hosting, cloud reliance.
  - **Mekane Share Edge:** Browser-only simplicity, self-hosting, faster sharing without app install.

- **Mekane Share’s Differentiation:**
  - Self-hosting for control and security.
  - Emphasis on speed (capture-to-URL in 2 seconds).
  - Dual hosting options (default Cloudflare Workers or custom servers).

*Note:* See Section 2.4 for a detailed functionality comparison table.

---

### 2. Features and Functionality

#### 2.1. Core Features
- Full or selected area screenshot capture.
- Instant URL generation.
- Automatic clipboard copy.
- Server configuration (default or self-hosting).
- Lightweight annotations (arrows, text).

#### 2.2. Detailed Feature Descriptions
- **Screenshot Capture:**
  - Options: Full page or user-selected area.
  - Priority: Must-have for MVP (v1).
- **URL Generation:**
  - Generates unique, shareable URLs hosted via Cloudflare Workers (default) or user’s server (self-hosted).
  - Target: Completed within 2 seconds of capture.
  - Priority: Must-have for MVP (v1).
- **Clipboard Copy:**
  - Automatically copies the generated URL to the clipboard.
  - Priority: Must-have for MVP (v1).
- **Server Configuration:**
  - Users choose between default server (Cloudflare Workers) or custom server URL.
  - Custom URL entry with validation (e.g., checks for HTTPS, valid domain).
  - Connection test to ensure server responsiveness (e.g., <500ms ping).
  - Priority: Default server must-have for MVP (v1); self-hosting nice-to-have for post-launch (v1.1).
- **Image Storage:**
  - Default: Cloudflare Workers with 1-week retention for the free plan (v1).
  - Self-hosted: User’s server, configurable retention.
- **Lightweight Annotations:**
  - Basic tools (e.g., arrows, text) for quick edits post-capture.
  - Priority: Must-have for MVP (v1).

**User Workflow:**
1. Click the Mekane Share extension icon in Chrome.
2. Select capture mode (full page or area) via a dropdown or overlay.
3. Capture the screen; option to add arrows or text appears in a minimal overlay.
4. Choose hosting (default or custom, pre-set in a simple settings panel).
5. URL generates in <2 seconds, auto-copies to clipboard, and shows a confirmation (e.g., “Copied: [URL]”).
6. If custom server fails (e.g., timeout), fallback to default with a warning.

*Note:* The UI includes a minimal settings panel for server selection and basic preferences.

#### 2.3. User Stories
- "As a developer, I want to share code quickly."
- "As a designer, I want instant visual feedback with simple annotations."
- "As a business IT admin, I want to configure a self-hosted server so my team’s screenshots stay internal."

#### 2.4. Functionality Comparison
| Feature                | Mekane Share       | Awesome Screenshot | Loom          | Monosnap      |
|-----------------------|--------------------|--------------------|---------------|---------------|
| Capture Speed         | <2 seconds         | 3–5 seconds        | 5–10 seconds  | 3–5 seconds   |
| Full/Area Capture     | Yes                | Yes                | Yes           | Yes           |
| Annotations           | Yes (arrows, text) | Yes                | No            | Yes           |
| URL Sharing           | Yes                | Yes                | Yes           | Yes           |
| Self-Hosting          | Yes                | No                 | No            | No            |
| Default Hosting       | Cloudflare Workers | Proprietary Cloud  | Loom Servers  | Monosnap Cloud|
| Free Tier Limits      | 1-week retention   | Storage/Features   | 5-min Videos  | Storage       |

*Note:* Mekane Share balances speed, hosting flexibility, and lightweight annotations for v1.

---

### 3. Technical Requirements

#### 3.1. Programming Languages and Technologies
- **Frontend (Extension):** JavaScript, HTML/CSS using Chrome Extension APIs.
- **Backend (Default Hosting):** Cloudflare Workers with JavaScript for image processing and URL generation; uses Cloudflare R2 for storage (zero-cost in free tier).
- **Backend (Self-Hosting):** Node.js server (v16+ recommended) with RESTful API endpoints:
  - `POST /upload` – Accepts image data, returns URL.
  - `GET /health` – Checks server status for connection tests.
- **Image Handling:** Libraries like `sharp` (Node.js) for compression/processing.

**Self-Hosting Setup:**
- Users deploy a Node.js server (sample provided in GitHub repo).
- Minimum: 512MB RAM, 1GB storage, HTTPS enabled.

**Free Tier Constraints:**
- Default hosting leverages Cloudflare Workers free tier (100,000 requests/day) and R2 free tier (10GB storage, 1M reads/month) to ensure zero cost for Mekane Share’s free plan.

#### 3.2. Platform Compatibility
- Chrome (desktop).
- Cloudflare Workers.

#### 3.3. Dependencies
- Chrome Extension APIs.
- Cloudflare Workers APIs.
- Image manipulation libraries (e.g., `sharp`).

#### 3.4. Performance Requirements
- Capture and URL generation within 2 seconds.
- Minimal browser resource impact.

#### 3.5. Security Considerations
- **HTTPS:** Mandatory for all communications (default and self-hosted).
- **URL Validation:** Prevents injection attacks (e.g., rejects malformed URLs, enforces HTTPS).
- **Self-Hosting Safeguards:**
  - Default security headers (e.g., Content-Security-Policy) in sample server code.
  - Rate limiting (e.g., 100 uploads/hour per IP) to prevent abuse.
  - Documentation includes best practices (e.g., firewall setup, SSL certs).
  - Extension warns users if a self-hosted server lacks HTTPS, displaying a “Security Risk” alert.
- **Default Hosting:** Cloudflare Workers handles DDoS protection and encryption.

#### 3.6. Coding Standards and Guidelines
- Google Chrome guidelines.
- Clean, documented code.

#### 3.7. Testing Strategy
- Unit tests (JavaScript).
- Integration tests (extension and backend).
- User acceptance testing.

#### 3.8. Competitive Technical Considerations
- Analyze competitors’ technologies.
- Identify opportunities to improve and differentiate.

---

### 4. Open Source Considerations

#### 4.1. Licensing
- MIT License.

#### 4.2. Contribution Guidelines
- Clear instructions on GitHub.
- Use of issues and pull requests.

#### 4.3. Community Management
- Active response to feedback.
- Encouragement of participation (e.g., monthly contributor calls, badges for top contributors).

#### 4.4. Documentation
- Detailed README.
- Backend documentation for deployment.
- Guide for configuring the extension for self-hosting (including Docker sample).

#### 4.5. Community and Competitors
- Analyze how competitors interact with their communities.
- Define strategies to build an active community around Mekane Share (e.g., showcase user contributions, host feedback sessions).

---

### 5. Success Metrics
- **Active Users:** 1,000 weekly active users (users capturing at least 1 screenshot/week) within 3 months.
- **Chrome Web Store Ratings:** Average 4.5 stars after 100+ reviews.
- **GitHub Engagement:** 100 stars, 20 forks within 6 months.
- **Community Contributions:** 5 pull requests from external contributors in 6 months.
- **Performance:** 95% of captures generate URLs in <2 seconds (measured via logs).
- **Support Requests:** Fewer than 50 requests/month, tracked via GitHub Issues.

---

### 6. Image Hosting
- **Default:** Cloudflare Workers with R2 storage (1-week retention in v1 free plan).
- **Self-Hosted:** User’s server, configurable retention.

---
