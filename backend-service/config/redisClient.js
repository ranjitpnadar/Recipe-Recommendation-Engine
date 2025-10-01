const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err)=>{
    console.error('Redis Client Error:', err);
})

async function connectRedis(){
    if(!redisClient.isOpen){
        await redisClient.connect();
    }
}
connectRedis();

module.exports = redisClient;