/**
 * Serverless entry point for Vercel.
 *
 * Vercel compiles this file on the fly (esbuild), which does NOT emit the
 * decorator metadata NestJS relies on for dependency injection. So instead of
 * bootstrapping from TypeScript sources, we require the *compiled* output that
 * `npm run build` mirrors into `api/dist/` (see scripts/copy-dist.mjs), and
 * reuse a single Express instance across invocations.
 *
 * The require is static and at module scope so Vercel's dependency tracer can
 * follow it, and it is wrapped so a packaging problem answers with a readable
 * reason instead of an opaque FUNCTION_INVOCATION_FAILED.
 */
let bootstrap = null;
let bootstrapError = null;

try {
  bootstrap = require('./dist/bootstrap.js');
} catch (error) {
  bootstrapError = error;
  console.error('[api] could not load the compiled NestJS bundle', error);
}

let appPromise = null;

const init = () => bootstrap.createExpressApp();

module.exports = async function handler(req, res) {
  if (bootstrapError) {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.setHeader('cache-control', 'no-store');
    res.end(
      JSON.stringify({
        error: 'api_bootstrap_failed',
        reason: String(bootstrapError.message || bootstrapError).split('\n')[0].slice(0, 300),
      }),
    );
    return;
  }

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
    const reason = String((error && error.message) || error || 'unknown').split('\n')[0].slice(0, 300);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.setHeader('cache-control', 'no-store');
    res.end(JSON.stringify({ error: 'api_bootstrap_failed', reason }));
  }
};
