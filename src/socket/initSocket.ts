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
    pingInterval: 10000,
    pingTimeout: 10000,
  });

  return io;
};
