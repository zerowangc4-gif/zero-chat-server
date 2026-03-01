export const MESSAGE_STATUS = {
  PENDING: "pending",
  SENT_TO_SERVER: "sent_to_server",
  DELIVERED: "delivered",
  READ: "read",
  FAILED: "failed",
} as const;

export const MESSAGE_TYPE = {
  TEXT: "text",
  IMAGE: "image",
  FILE: "file",
  VOICE: "voice",
  VIDEO: "video",
} as const;

export type MessageStatus = (typeof MESSAGE_STATUS)[keyof typeof MESSAGE_STATUS];

export type MessageType = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];
