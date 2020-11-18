const http = require('http');
const app = require('../src/app');
const debugLog = require('../src/config').debugLog;
const port = process.env.PORT || '3001';
const { setupDB } = require('./_test-setup');
setupDB({ debug: false });

app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => debugLog(`Test server listening on port ${port}`));

module.exports = server;