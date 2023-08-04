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
        dataset,
      } = payload;
      if (!classId || !dataset) {
        return {
          errCode: 1,
          msg: '参数不完整，无法保存。',
        };
      }
      const info = {
        classId,
        dataset,
      };
      const res = await timetableDB.where({
        classId
      }).get()

      if (res.data.length) {
        // update
        const {
          _id,
          ...originalData
        } = res.data[0];
        const mergedData = Object.assign({}, originalData, info, {
          updatedAt: new Date()
        });
        return timetableDB.doc(res.data[0]._id).set({
          data: mergedData
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