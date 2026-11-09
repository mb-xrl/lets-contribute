/**
 * Serverless entry point for Vercel.
 *
 * Vercel compiles this file on the fly (esbuild), which does NOT emit the
 * decorator metadata NestJS relies on for dependency injection. So instead of
 * bootstrapping from TypeScript sources, we require the *compiled* output in
 * `dist/` (`npm run build` runs during the Vercel build step) and reuse a
 * single Express instance across invocations.
 *
 * The require is kept at module scope on purpose: Vercel's dependency tracer
 * follows static `require` calls to decide which files ship with the function.
 * `npm run build` copies dist/ to api/dist/ so this path stays inside the
 * packaged function directory.
 */
const { createExpressApp } = require('./dist/bootstrap.js');

let appPromise = null;

const init = () => createExpressApp();

module.exports = async function handler(req, res) {
  if (!appPromise) {
    appPromise = Promise.resolve()
      .then(init)
      .catch((error) => {
        appPromise = null;
        throw error;
      });
  }

  try {
    const app = await appPromise;
    app(req, res);
  } catch (error) {
    console.error('[api] failed to bootstrap NestJS', error);
    // Surface a short reason so a deployment can be diagnosed without log
    // access. Full stack traces stay in the platform logs.
    const reason = String((error && error.message) || error || 'unknown').split('\n')[0].slice(0, 300);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.setHeader('cache-control', 'no-store');
    res.end(JSON.stringify({ error: 'api_bootstrap_failed', reason }));
  }
};
