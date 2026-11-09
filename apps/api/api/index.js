/**
 * Serverless entry point for Vercel.
 *
 * Vercel compiles this file on the fly (esbuild), which does NOT emit the
 * decorator metadata NestJS relies on for dependency injection. So instead of
 * bootstrapping from TypeScript sources, we lazily require the *compiled*
 * output in `dist/` (`npm run build` runs during the Vercel build step) and
 * reuse a single Express instance across invocations.
 */
const init = async () => {
  const { createExpressApp } = require('../dist/bootstrap.js');
  return createExpressApp();
};

let appPromise = null;

module.exports = async function handler(req, res) {
  if (!appPromise) {
    appPromise = init().catch((error) => {
      appPromise = null;
      throw error;
    });
  }

  try {
    const app = await appPromise;
    app(req, res);
  } catch (error) {
    console.error('[api] failed to bootstrap NestJS', error);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'api_bootstrap_failed' }));
  }
};
