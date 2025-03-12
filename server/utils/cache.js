const redis = require("redis");

// Create and configure a Redis client instance
const client = redis.createClient({
  socket: {
    host: "localhost", // update as needed
    port: 6379,        // default Redis port
  },
  // password: 'your_redis_password', // Uncomment if your Redis server requires authentication
});

client.on("error", (err) => {
  console.error("Redis error: ", err);
});

// Connect the client (for node-redis v4, this returns a promise)
client.connect();

module.exports = { client };
