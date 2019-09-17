const app = require('./app');
require('dotenv').config()
if (!process.env.API_PORT) {
  // eslint-disable-next-line no-console
  console.error('env file port number not existing');
  process.exit();
}
console.log('Listening on ' + process.env.API_PORT);
app.default.listen(process.env.API_PORT);
