#!/usr/bin/env node

/**
 * Module dependencies.
 */
// config should be imported before importing any other file
import config from '../config/config';

import app from '../app';
import * as http from 'http';
// import https from 'https';
import * as mongoose from 'mongoose';

// // make bluebird default Promise
// Promise = require('bluebird'); // eslint-disable-line no-global-assign

// // plugin bluebird promise in mongoose
// mongoose.Promise = Promise;

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(config.port);

// connect to mongo db
const mongoUri = config.mongo.hostDefault;
const instance = new mongoose.Mongoose();
instance.createConnection(mongoUri, { server: { socketOptions: { keepAlive: 5 } } });
instance.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${mongoUri}`);
}).on('connected', () => {
  console.log('Mongodb connected');
});

// print mongoose logs in dev env
if (process.env.MONGOOSE_DEBUG) {
  mongoose.set('debug', (collectionName: any, method: any, query: any, doc: any) => {
    // debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);


// var options = {
//   key: fs.readFileSync('/etc/letsencrypt/live/gdjzj.hzsdgames.com/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/gdjzj.hzsdgames.com/fullchain.pem')
// };
// var sslServer = https.createServer(options, app);
// sslServer.listen(`8084`);
// sslServer.on('error', onError);
// sslServer.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string) {
  const portNumber = parseInt(val, 10);

  if (isNaN(portNumber)) {
    // named pipe
    return val;
  }

  if (portNumber >= 0) {
    // port number
    return portNumber;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: any) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}
