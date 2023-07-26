const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 作息时间
exports.main = async (event, context) => {
  const {
    method,
    ...payload
  } = event.data || {};

  const scheduleDB = db.collection('schedules');

  switch (method) {
    case 'get':
      // 根据班级id查找
      const {
        classId
      } = payload;
      return await scheduleDB.where({
        classId
      }).get();
      
      break;
  
    default:
      break;
  }
};