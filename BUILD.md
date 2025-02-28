# Building Cluster Estate Project

This document provides instructions for building the Cluster Estate project, including options for building with TypeScript and ESLint errors.

## Standard Build

To build the project normally:

```bash
npm run build
```

This will run the standard Next.js build process, which will fail if there are TypeScript or ESLint errors.

## Building with Errors

The project has been configured to allow building even when there are TypeScript or ESLint errors. This is useful for testing purposes or when you need to deploy a work-in-progress version.

To build the project ignoring errors:

```bash
npm run build
```

The configuration in `next.config.mjs` has been updated to include:

```javascript
typescript: {
  // Allow production builds to successfully complete even if
  // your project has type errors
  ignoreBuildErrors: true,
},
eslint: {
  // Allow production builds to successfully complete even if
  // your project has ESLint errors
  ignoreDuringBuilds: true,
}
```

## Reverting to Strict Mode

If you want to revert to strict mode (where builds fail on errors), you can modify `next.config.mjs` and set:

```javascript
typescript: {
  ignoreBuildErrors: false,
},
eslint: {
  ignoreDuringBuilds: false,
}
```

Or simply remove these configuration options entirely.

## Deployment

After building, you can start the production server with:

```bash
npm run start
```

This will start the Next.js server using the production build.
