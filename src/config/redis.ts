import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { Server } from "socket.io";

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

const URL = `redis://${REDIS_HOST}:${REDIS_PORT}`;

export const redis = createClient({
  url: URL,
  password: REDIS_PASSWORD,
});

redis.on("error", err => console.error(`Redi Error: ${err.message}`));

export const setupRedisAdapter = async (io: Server) => {
  const pubClient = redis.duplicate();
  const subClient = redis.duplicate();

  pubClient.on("error", err => console.error(`Redis Pub Error: ${err.message}`));
  subClient.on("error", err => console.error(`Redis Sub Error: ${err.message}`));

  await Promise.all([pubClient.connect(), subClient.connect()]);

  const adapter = createAdapter(pubClient, subClient);

  io.adapter(adapter);
};
