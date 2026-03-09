import axios from "axios";

export const wechatClient = axios.create({
  baseURL: "https://api.weixin.qq.com",
  timeout: 10000,
});

wechatClient.interceptors.response.use(
  response => {
    const data = response.data;
    if (data.errcode && data.errcode !== 0) {
      return Promise.reject(new Error(`${data.errmsg} (code:${data.errcode})`));
    }
    return data;
  },
  error => Promise.reject(error),
);
