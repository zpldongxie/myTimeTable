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

  const timetableDB = db.collection('timetables');

  switch (method) {
    case 'get':
      // 根据班级id查找
      const {
        classId
      } = payload;
      return await timetableDB.where({
        classId
      }).get();
    case 'upsert': {
      // 插入或更新
      const {
        classId,
        data,
      } = payload;
      if (!classId || !data) {
        return {
          errCode: 1,
          msg: '参数不完整，无法保存。',
        };
      }
      const info = {
        classId,
        data,
      };
      return await timetableDB.where({classId}).get().then(res => {
        if (res.data.length) {
          // update
          return timetableDB.doc(res.data[0]._id).update({
            data: {
              ...info,
              updatedAt: new Date()
            }
          });
        } else {
          // create
          return timetableDB.add({
            data: {
              ...info,
              createdAt: new Date()
            }
          });
        }
      });
    }
    case 'del': {
      // 按_id删除
      const {
        _id
      } = payload;
      if (!_id) {
        return {
          errCode: 1,
          msg: '缺少_id'
        }
      }
      return await timetableDB.doc(_id).remove();
    }

    default:
      return {
        errCode: 1,
          msg: '未指定正确的操作类型',
      };
  }
};