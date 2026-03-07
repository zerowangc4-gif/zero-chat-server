import { redis } from "@/config";

// 获取私聊信息会话序号
export async function getSessionSeqNum(
  fromId: string,
  toId: string,
  clientSessionSeq: string | number,
) {
  const sessionId = [fromId, toId].sort().join("_");
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

// 获取自己收到私聊信息序号
export async function getSyncUserMsgSeqNum(userId: string) {
  const key = `seq:user:sync:${userId}`;
  return await redis.incr(key);
}
