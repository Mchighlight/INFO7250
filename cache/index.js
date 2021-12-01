
const config = require('../config');
const redis = require('redis')

exports.connect = () => {
    const client = redis.createClient({
        port: config.REDIS_PORT,
    });
    
    client.on('connect', function () {
        console.log("Connected to Cache!")
    });
    
    client.on('error', function (err) {
        console.error(err)
    });

    return client;
}
