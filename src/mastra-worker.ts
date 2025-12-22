import { parentPort } from 'worker_threads';

process.env.PORT = '4111';

import('../.mastra/output/index.mjs')
  .then(() => parentPort?.postMessage({ type: 'ready' }))
  .catch(() => parentPort?.postMessage({ type: 'ready' }));
