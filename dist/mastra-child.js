process.env.PORT = process.env.PORT || '4111';
// @ts-ignore - dynamic import of Mastra build output
import('../.mastra/output/index.mjs')
    .then(() => {
    if (process.send) {
        process.send({ type: 'ready' });
    }
    console.log('Mastra server started on port', process.env.PORT);
})
    .catch((err) => {
    console.error('Mastra import error:', err);
    if (process.send) {
        process.send({ type: 'ready' });
    }
});
export {};
