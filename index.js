const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const config = require('./config');


async function runServer() {
    // api router
    server.use('/api', require('./routes/plans'));
        
  
    const PORT = parseInt(process.env.PORT, 10) || 3001;
    server.listen(PORT, (err) => {
      if (err) console.error(err);
      console.log('Server ready on port:', PORT);
    })
}
  
runServer();