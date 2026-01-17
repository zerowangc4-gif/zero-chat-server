import { createClient } from "redis";

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

const URL = `redis://${REDIS_HOST}:${REDIS_PORT}`;

export const redis = createClient({
  url: URL,
  password: REDIS_PASSWORD,
});

export default redis;
