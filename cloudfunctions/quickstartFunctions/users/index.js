const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 用户管理
exports.main = async (event, context) => {
  const {
    method,
    ...payload
  } = event.data || {};

  const userDB = db.collection('users');

  switch (method) {
    case 'get':
      // 按openId查询
      const {
        openId
      } = payload;
      return await userDB.where({
        openId
      }).get();

    default:
      break;
  }
  // 返回数据库查询结果
  return null;
};