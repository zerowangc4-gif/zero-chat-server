import { Response, NextFunction, Request } from "express";
import { AppError } from "@/types";
import { catchAsync } from "@/utils";
import { wechatClient } from "@/api/authClient";

export const wechatLogin = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { code } = req.body;

  if (!code) {
    throw new AppError(400, "Missing required parameters: code");
  }

  const APP_ID = "wx49e9dfd49d178ad3";
  const APP_SECRET = "30b7e4b391ab79b1328a4a04696005fd";

  const wxData = await wechatClient.get("/sns/jscode2session", {
    params: {
      appid: APP_ID,
      secret: APP_SECRET,
      js_code: code,
      grant_type: "authorization_code",
    },
  });

  res.status(200).json({
    success: true,
    message: "成功吧",
    data: {
      ...wxData,
    },
  });
});
