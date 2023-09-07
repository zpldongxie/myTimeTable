const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const MAX_LIMIT = 100

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
      // 先取出集合记录总数
      const countResult = await timetableDB.where({
        classId
      }).count()
      const total = countResult.total
      // 计算需分几次取
      const batchTimes = Math.ceil(total / 100)
      // 承载所有读操作的 promise 的数组
      const tasks = []
      for (let i = 0; i < batchTimes; i++) {
        const promise = timetableDB.where({
          classId
        }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
        tasks.push(promise)
      }
      // 等待所有
      return (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
          data: acc.data.concat(cur.data),
          errMsg: acc.errMsg,
        }
      })
      // return await timetableDB.where({
      //   classId
      // }).get();
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