const { createClient } = require("redis");

const EXPIRATION_TIME = 60 * 60 * 24;

// create and connect to client 
const client = createClient();

client.on("error", (err) => console.log("Redis Client Error", err));

const connectRedis = async () => {
    try {
        await client.connect();
        console.log("Redis connected");
    } catch (error) {
        console.log("Redis connection error", error);
    }
};

module.exports = { client, connectRedis, EXPIRATION_TIME };
