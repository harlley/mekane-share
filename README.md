# Mekane Share

A browser extension for capturing, annotating, and sharing screenshots with ease.

## Project Status

**Version: 0.0.1-alpha (In Development)**

This project is an experimental learning initiative to explore AI-assisted software development using professional practices and standards. I'm using this project to learn how to develop software with the assistance of AI agents while maintaining professional development workflows, code quality, and project management.

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

Contributions are welcome! This is an experimental project focused on learning AI-assisted development, so feel free to join in and experiment with me.

Please check the CONTRIBUTING.md file for guidelines.

## AI-Assisted Professional Development

This project serves as a case study for AI-assisted professional software development. I'm documenting my experience using AI tools and agents to help with:

- Code generation and refactoring
- Problem-solving and debugging
- Documentation creation
- Project organization
- Professional workflows and best practices
- Code quality and testing
- CI/CD implementation
- Project management

The goal is to demonstrate how AI assistance can be integrated into professional software development processes while maintaining high standards of quality, maintainability, and scalability.

Feel free to explore the codebase and see how AI assistance has shaped its development while adhering to professional standards.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [WXT](https://wxt.dev/) - Web Extension Framework
- [Hono](https://hono.dev/) - Fast, Lightweight, Web Standards 
