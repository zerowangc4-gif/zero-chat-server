import { redis } from "@/config";

// 获取会话序号
export async function getSessionSeqNum(
  clientSessionSeq: string | number,
  toId: string,
  fromId?: string,
) {
  const sessionId = fromId ? [fromId, toId].sort().join("_") : toId;
  const key = `seq:chat:${sessionId}`;

  const clientSeq = parseInt(String(clientSessionSeq).split("_")[0]) || 0;

  const script = `
  local server_raw = redis.call('get', KEYS[1])
  local server_seq = 0
  if server_raw then
      server_seq = tonumber(server_raw) or 0
  end

  local client_seq = tonumber(ARGV[1]) or 0

  local final_seq = math.max(server_seq, client_seq) + 1

  redis.call('set', KEYS[1], final_seq)
  return final_seq
`;

  const result = await redis.eval(script, {
    keys: [key],
    arguments: [clientSeq.toString()],
  });

  return Number(result);
}

// 获取自己收到信息序号
export async function getSyncUserMsgSeqNum(userId: string) {
  const key = `seq:user:sync:${userId}`;
  return await redis.incr(key);
}
// 获取自己群信息序号
export async function getSyncGroupMsgSeqNum(userId: string) {
  const key = `seq:group:sync:${userId}`;
  return await redis.incr(key);
}
// 获取最新群序列号
export async function getLastGroupSeqNum(userId: string) {
  const key = `seq:user:last:group:${userId}`;
  return await redis.incr(key);
}

// 发信息的时候使用脚本分发到个人的群私人收件箱
export const DISTRIBUTE_LUA = `
local msg = ARGV[1]
local score = tonumber(ARGV[2])
local ttl = tonumber(ARGV[3])
for i, key in ipairs(KEYS) do
    -- 写入有序集合
    redis.call('ZADD', key, score, msg)
    -- 限制长度，保留最新的 1000 条
    redis.call('ZREMRANGEBYRANK', key, 0, -1001)
    -- 设置过期时间
    redis.call('EXPIRE', key, ttl)
end
return #KEYS
`;
