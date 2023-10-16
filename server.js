const http = require('http');
const port = 8000;
const express = require('express');

const path = require('path');
const app = express();
//app.use('/', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

const server = http.createServer(app);
server.listen(port);console.debug('Server listening on port ' + port);