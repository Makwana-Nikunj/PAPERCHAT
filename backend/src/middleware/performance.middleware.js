// Performance monitoring middleware
// Logs slow requests (>1s) and adds X-Response-Time header

const performanceMiddleware = (req, res, next) => {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1_000_000;

        // Log slow requests (>1 second)
        if (durationMs > 1000) {
            console.warn(`⚠️ Slow request: ${req.method} ${req.originalUrl} — ${durationMs.toFixed(0)}ms`);
        }
    });

    next();
};

export default performanceMiddleware;
