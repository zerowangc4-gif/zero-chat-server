import express from "express";
import cors from "cors";
import { errorHandler } from "@/middlewares";
import rootRouter from "@/routes";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", rootRouter);

app.use(errorHandler);

export default app;
