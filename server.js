//server.js
const http = require('http');
const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();                   

const PORT = process.env.PORT || 9000; 
const HOST = process.env.HOST || '0.0.0.0';

const server = http.createServer(app);

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
