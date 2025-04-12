# Mekane Share

A browser extension for capturing, annotating, and sharing screenshots with ease.

## Demo

https://github.com/harlley/mekane-share/assets/docs/mekane-share.mp4?raw=true

## Project Status

**Version: 0.0.2-alpha (In Development)**

This project is an experimental learning initiative to explore AI-driven software development using professional practices and standards. I'm using this project to learn how to develop software with AI-driven approaches while maintaining professional development workflows, code quality, and project management.

## Project Overview

Mekane Share is a monorepo project consisting of:

- **Chrome Extension**: React-based UI for capturing and annotating screenshots
- **Backend Service**: Node.js/Hono API for handling uploads and storage
- **Shared Utilities**: Common code used across the project

## Getting Started

### Prerequisites

- Node.js v23.6.0 or higher
- npm v11.0.0 or higher

### Installation

1. Clone the repository
   ```
   git clone https://github.com/harlley/mekane-share.git
   cd mekane-share
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Copy the environment file and configure it
   ```
   cp .env.example .env
   ```

4. Start the development server
   ```
   npm run dev
   ```

## Project Structure

```
mekane-share/
├── apps/
│   ├── extension/  # Chrome extension (React/WXT/TypeScript)
│   └── backend/    # Backend service (TypeScript/Hono)
├── packages/
│   └── shared/     # Shared utilities and types
```

## Environment Configuration

The project uses environment variables for configuration. Copy `.env.example` to `.env` at the root of the project and update the values:

```
# Server URL used for extension API calls and host permissions
WXT_SERVER_URL=https://your-production-server.com

# Backend settings for Cloudflare Worker
PUBLIC_URL=https://your-production-server.com

# Cloudflare credentials for R2 storage
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
```

These variables are used to:
- Configure server URLs in the extension
- Set up API endpoints for screenshot uploads
- Connect to Cloudflare R2 for storage
- Avoid hardcoding sensitive information in the codebase

You can create different environment files for various environments:
- `.env.development` - for local development
- `.env.production` - for production builds

## Development

### Extension Development

```
npm run dev --filter=extension
```

### Backend Development

```
npm run dev --filter=backend
```

### Building for Production

```
npm run build
```

## Contributing

Contributions are welcome! This is an experimental project focused on learning AI-driven development, so feel free to join in and experiment with me.

Please check the CONTRIBUTING.md file for guidelines.

## AI-Driven Professional Development

This project serves as a case study for AI-driven professional software development. I'm documenting my experience using AI tools and agents to help with:

- Code generation and refactoring
- Problem-solving and debugging
- Documentation creation
- Project organization
- Professional workflows and best practices
- Code quality and testing
- CI/CD implementation
- Project management

The goal is to demonstrate how AI-driven approaches can be integrated into professional software development processes while maintaining high standards of quality, maintainability, and scalability.

Feel free to explore the codebase and see how AI-driven development has shaped its evolution while adhering to professional standards.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [WXT](https://wxt.dev/) - Web Extension Framework
- [Hono](https://hono.dev/) - Fast, Lightweight, Web Standards
