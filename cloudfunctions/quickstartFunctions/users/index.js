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
      if (!openId) {
        return {
          errCode: 1,
          msg: '缺少openId'
        }
      }
      return await userDB.where({
        openId
      }).get();
    case 'upsert': {
      // 插入或更新
      const {
        schoolId,
        gradeCode,
        className,
        openId
      } = payload;
      if (!schoolId || !gradeCode || !className || !openId) {
        return {
          errCode: 1,
          msg: '参数不完整，无法保存。',
        };
      }
      const info = {
        schoolId,
        gradeCode,
        className,
        openId
      };
      return await userDB.where(info).get().then(res => {
        if (res.data.length) {
          // update
          return userDB.doc(res.data[0]._id).update({
            data: {
              ...info,
              updatedAt: new Date()
            }
          });
        } else {
          // create
          return userDB.add({
            data: {
              ...info,
              createdAt: new Date()
            }
          });
        }
      });
    }
    default:
      return {
        errCode: 1,
          msg: '未指定正确的操作类型',
      };
  }
};