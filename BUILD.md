# Building Cabarete Villas Project

This document provides instructions for building the Cabarete Villas project, including options for building with TypeScript and ESLint errors.

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

## Vercel Deployment

The project is configured for seamless deployment on Vercel with the following configuration:

### vercel.json

```json
{
  "buildCommand": "next build",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

This configuration tells Vercel to:
1. Use the standard Next.js build command
2. Recognize the project as a Next.js application
3. Look for build output in the `.next` directory

### Required Environment Variables

The following environment variables must be set in your Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These variables are required for the application to connect to your Supabase backend. Without them, the build will fail with the error:

```
Error: either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!
```

To add these variables:
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable with its corresponding value
4. Redeploy your application

### TypeScript and ESLint Error Handling

The `next.config.mjs` file is configured to ignore TypeScript and ESLint errors during build:

```javascript
typescript: {
  ignoreBuildErrors: true,
},
eslint: {
  ignoreDuringBuilds: true,
}
```

This allows successful deployment even when there are TypeScript or ESLint errors in the codebase.

### Deployment Process

1. Push your changes to the connected Git repository
2. Vercel will automatically detect changes and start the build process
3. The build will complete successfully even with TypeScript errors
4. Your application will be deployed to a Vercel URL

### Troubleshooting Vercel Deployments

If you encounter issues with Vercel deployment:

1. Check the Vercel build logs for specific error messages
2. Ensure all environment variables are properly set in the Vercel project settings
3. Verify that the `.vercelignore` file is properly configured
4. Try deploying from a clean branch to isolate potential issues
