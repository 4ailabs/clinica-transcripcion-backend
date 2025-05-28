// api/health.js
module.exports = (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: 'Vercel Serverless'
    });
};