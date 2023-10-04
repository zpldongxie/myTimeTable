const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 第三方开放接口
exports.main = async (event, context) => {
  const { method, ...payload } = event.data || {}
  const { content } = payload;

  switch (method) {
    case 'msgSecCheck':
      try {
        const result = await cloud.openapi.security.msgSecCheck({
          content
        });
        
        return result;
      } catch (error) {
        console.error(error);
        return {
          errCode: -1,
          errMsg: '敏感词检测失败'
        };
      }  
    default:
      return {
        errCode: 1,
        msg: '未指定正确的操作类型'
      }
  }
};
