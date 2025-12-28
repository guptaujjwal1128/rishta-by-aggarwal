# Rishta By Aggarwal

A modern matrimonial web application built with React, TypeScript, and Vite.

## Features

- ⚡ Fast development with Vite HMR
- 🎯 React Compiler enabled for optimized performance
- 📱 Responsive design with Material-UI components
- 🔒 Type-safe with TypeScript
- 🧹 Production-grade ESLint configuration
- ✨ Auto-formatting with Prettier

## Prerequisites

- Node.js 20+
- npm or yarn

## Installation

```bash
npm install
```

## Available Scripts

### Development Server

Start the development server with hot module replacement:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Create an optimized production build:

```bash
npm run build
```

### Preview

Preview the production build locally:

```bash
npm run preview
```

### Linting

Check code quality with ESLint:

```bash
npm run lint
```

Fix linting errors automatically:

```bash
npm run lint:fix
```

### Formatting

Format code with Prettier:

```bash
npm run format
```

Check formatting without changes:

```bash
npm run format:check
```

### Testing

Run tests:

```bash
npm run test
```

Watch mode for tests:

```bash
npm run test:watch
```

## Project Structure

```
src/
├── App.tsx           # Main application component
├── App.css           # Application styles
├── main.tsx          # Entry point
├── index.css         # Global styles
└── assets/           # Static assets

public/
└── favicon.svg       # Application favicon
```

## Configuration Files

- `vite.config.ts` - Vite configuration with React and compiler plugins
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - Production-grade ESLint rules
- `package.json` - Project dependencies and scripts

## Technologies

- **React 19** - Modern UI framework with latest features
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material-UI** - Component library
- **ESLint** - Code quality
- **Prettier** - Code formatter
- **React Compiler** - Performance optimization

## Development Guidelines

- Follow TypeScript best practices
- Run lint before committing: `npm run lint -- --fix`
- Format code: `npm run format`
- Use meaningful commit messages

## License

See LICENSE file for details.

## Author

Ujjwal Gupta (guptaujjwal1128)
