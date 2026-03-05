import { Server } from "socket.io";
import { getUserRoomId } from "./messageService";
import { EVENT } from "./events";
import { Message, SocketType } from "./types";

// 转发个人聊天信息
export function sendMessage(
  io: Server,
  toId: string,
  message: Message,
  ack: (message: Message) => void,
) {
  return new Promise((_resolve, reject) => {
    const userRoomId = getUserRoomId(toId);
    io.to(userRoomId)
      .timeout(2000)
      .emit(EVENT.chat.chatMessage, message, async (err: unknown, res: Message[]) => {
        if (err) {
          reject(message);
        } else {
          ack(res[0] || message);
        }
      });
  });
}

// 转发已读回执
export async function sendReadReport(
  io: Server,
  socket: SocketType,
  toId: string,
  lastSessionSeqNum: number,
) {
  const userRoomId = getUserRoomId(toId);

  io.to(userRoomId).emit(EVENT.chat.readReport, {
    chatId: socket.userId,
    lastSessionSeqNum: lastSessionSeqNum,
  });
}

// 更新同步过的离线私人信息的最大序号
export async function updateSyncUserChatMessageNum(socket: SocketType, score: number) {
  socket.emit(EVENT.chat.updateSyncUserChatMessageNum, score);
}
