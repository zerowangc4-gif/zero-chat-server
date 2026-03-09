import { Response, NextFunction } from "express";
import https from "https";
import { AppError, AuthRequest } from "@/types";
import { catchAsync } from "@/utils";

export const wechatLogin = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { code } = req.body;

    if (!code) {
      throw new AppError(400, "Missing required parameters: code");
    }

    // 🔴【硬编码区域】请在这里填入你的真实信息
    const APP_ID = "wx49e9dfd49d178ad3";
    const APP_SECRET = "30b7e4b391ab79b1328a4a04696005fd";

    // 1. 构造微信接口 URL
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${APP_ID}&secret=${APP_SECRET}&js_code=${code}&grant_type=authorization_code`;

    // 2. 请求微信服务器
    const wxData: any = await new Promise((resolve, reject) => {
      https
        .get(url, response => {
          let data = "";
          response.on("data", chunk => (data += chunk));
          response.on("end", () => {
            try {
              const json = JSON.parse(data);
              if (json.errcode) {
                reject(new AppError(400, `微信接口错误: ${json.errmsg} (code:${json.errcode})`));
              } else {
                resolve(json);
              }
            } catch (e) {
              reject(new AppError(500, "解析微信响应失败"));
            }
          });
        })
        .on("error", err => reject(err));
    });

    const { openid, session_key, unionid } = wxData;

    if (!openid) {
      throw new AppError(500, "未能从微信获取 openid");
    }

    console.log(`✅ [微信登录成功] OpenID: ${openid}`);

    // ---------------------------------------------------------
    // 🧠 业务逻辑模拟区 (后续接数据库时修改这里)
    // ---------------------------------------------------------

    // 假设：这里去查数据库，判断用户是否存在
    // const user = await db.user.findUnique({ where: { openid } });
    // const isNewUser = !user;

    // 暂时硬编码模拟：假设每次都是老用户，或者你可以手动改这个变量测试
    const isNewUser = false;

    // 生成 Token (暂时用 mock，后续换成 jwt.sign)
    const token = `mock_jwt_token_${openid}_${Date.now()}`;

    // 构建返回给前端的用户信息对象
    // 注意：微信 jscode2session 不直接返回昵称和头像，那些需要前端用 button 获取或后端再调其他接口
    // 这里主要返回核心身份标识
    const userInfo = {
      openid: openid,
      unionid: unionid || null,
      // 如果有数据库，这里可以填入数据库里存的 nickname 和 avatar
      nickname: "微信用户",
      avatar: "",
      isNewUser: isNewUser,
    };

    // ---------------------------------------------------------

    res.status(200).json({
      success: true,
      message: isNewUser ? "注册并登录成功" : "登录成功",
      data: {
        token: token, // ✅ 核心：前端存这个
        userInfo: userInfo, // ✅ 核心：前端用来渲染界面
        // 调试用：开发环境可以返回，生产环境建议去掉 session_key
        // debug_session_key: session_key
      },
    });
  },
);
