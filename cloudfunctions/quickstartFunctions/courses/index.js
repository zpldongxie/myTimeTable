const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 班级课程
exports.main = async (event, context) => {
  const {
    method,
    ...payload
  } = event.data || {};

  const courseDB = db.collection('courses');

  switch (method) {
    case 'get':
      // 根据班级id查找
      const {
        classId
      } = payload;
      if (!classId) {
        return {
          errCode: 1,
          msg: '缺少参数classId。',
        };
      }
      return await courseDB.where({
        classId
      }).orderBy("createdAt", "asc").get();
    case 'create': {
      // 插入
      const {
        classId,
        name,
        style,
      } = payload;
      if (!classId || !name || !style) {
        return {
          errCode: 1,
          msg: '参数不完整，无法保存。',
        };
      }
      const info = {
        classId,
        name,
        style,
      };
      return courseDB.add({
        data: {
          ...info,
          createdAt: new Date()
        }
      });
    }
    case 'update': {
      // 更新
      const {
        _id,
        name,
        style,
      } = payload;
      if (!_id || (!name && !style)) {
        return {
          errCode: 1,
          msg: '参数不完整，无法保存。',
        };
      }
      const info = {
        updatedAt: new Date()
      };
      if (name) {
        info.name = name;
      }
      if (style) {
        info.style = style;
      }
      return await courseDB.doc(_id).update({
        data: info
      });;
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
      return await courseDB.doc(_id).remove();
    }

    case 'delAll': {
      // 按classId批量删除
      const {
        classId
      } = payload;
      if (!classId) {
        return {
          errCode: 1,
          msg: '缺少classId'
        }
      }
      return await courseDB.where({
        classId
      }).remove();
    }

    default:
      return {
        errCode: 1,
          msg: '未指定正确的操作类型',
      };
  }
};