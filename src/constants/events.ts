export const EVENT = {
  SYSTEM: {
    CONNECT: "connect",
    DISCONNECT: "disconnect",
    CONNECT_ERROR: "connect_error",
    HEARTBEAT: "client_heartbeat",
    FORCE_LOGOUT: "force_logout",
  },

  CHAT: {
    SEND_MESSAGE: "send_message",
    NEW_MESSAGE: "new_message",
    READ_REPORT: "read_report",
    READ_UPDATE: "message_read_update",
  },
} as const;
