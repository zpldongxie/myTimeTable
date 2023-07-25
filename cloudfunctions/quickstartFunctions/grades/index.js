const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 年级管理
exports.main = async (event, context) => {
  const {
    method
  } = event.data || {};

  const schoolDB = db.collection('grades');

  switch (method) {
    case 'get': {
      return await schoolDB.get();
    }
    default:
      return {
        errCode: 1,
          msg: '未指定正确的操作类型',
      };
  }
};