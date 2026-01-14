import { createClient } from "redis";

const HOST = process.env.REDIS_HOST;
const PORT = process.env.REDIS_PORT;
const PASSWORD = process.env.REDIS_PASSWORD;
const URL = `redis://${HOST}:${PORT}`;

export const redis = createClient({
  url: URL,
  password: PASSWORD,
});

export default redis;
