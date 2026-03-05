import { Server } from "socket.io";
import { SocketType, Message } from "./types";
import { getSessionSeqNum, saveOfflineMessage, getUserOnlineValue } from "./messageService";
import { sendMessage, sendReadReport } from "./emitter";
import { EVENT } from "./events";

import { MESSAGE_STATUS } from "@/constants";

export function listener(io: Server, socket: SocketType) {
  // 接收新的私人消息，然后转发给好友
  socket.on(EVENT.chat.chatMessage, async (data: Message, ack) => {
    const { toId, content, id, type } = data;
    const fromId = socket.userId as string;
    const sessionSeqNum = await getSessionSeqNum(fromId, toId);

    const message: Message = {
      id: id,
      fromId: fromId,
      toId: toId,
      sessionSeqNum: sessionSeqNum,
      content: content,
      timestamp: Date.now(),
      type: type,
      status: MESSAGE_STATUS.SENT_TO_SERVER,
    };

    try {
      await saveOfflineMessage(toId, message);

      const onlineValue = await getUserOnlineValue(toId);

      if (!onlineValue) {
        return ack(message);
      }

      await sendMessage(io, toId, message, ack);
    } catch (error: unknown) {
      ack(message);
    }
  });

  // 接受用户已读回执，更新状态后转发好友
  socket.on(EVENT.chat.readReport, async data => {
    const { fromId, lastSessionSeqNum } = data;
    await sendReadReport(io, socket, fromId, lastSessionSeqNum);
  });
}
