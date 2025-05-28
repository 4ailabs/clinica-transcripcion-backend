// api/index.js
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    try {
        const htmlPath = path.join(__dirname, '..', 'appconectada.html');
        const html = fs.readFileSync(htmlPath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(html);
    } catch (error) {
        console.error('Error serving HTML:', error);
        res.status(500).json({ error: 'Error loading application' });
    }
};