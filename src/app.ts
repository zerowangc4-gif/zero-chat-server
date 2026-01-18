import express from "express";
import cors from "cors";
import { errorHandler } from "@/middlewares";
import rootRouter from "@/routes";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", rootRouter);

app.all("*", (req, res) => {
  res.status(404).json({
    code: 404,
    message: `不能发现: ${req.originalUrl}`,
  });
});

app.use(errorHandler);

export default app;
