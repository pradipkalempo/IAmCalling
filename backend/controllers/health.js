// Health check endpoint for monitoring
export default function healthCheckRoute(app) {
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development'
        });
    });

    app.get('/api/health', (req, res) => {
        res.status(200).json({
            status: 'healthy',
            service: 'iamcalling-api',
            timestamp: new Date().toISOString()
        });
    });
}
