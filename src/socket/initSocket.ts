import { Server } from "socket.io";
import http from "http";

export let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS || "*",
    },
    transports: ["websocket"],
    maxHttpBufferSize: 1e6,
  });

  return io;
};
