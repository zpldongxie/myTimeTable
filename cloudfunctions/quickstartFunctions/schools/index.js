const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 学校管理
exports.main = async (event, context) => {
  const {
    method,
    ...payload
  } = event.data || {};

  const schoolDB = db.collection('schools');

  switch (method) {
    case 'getById': {
      // 按ID查询
      const {
        _id
      } = payload;
      return await schoolDB.doc(_id).get();
    }
    case 'get': {
      // 按名称查询
      const {
        name
      } = payload;
      return await schoolDB.where({
        name
      }).get();
    }
    case 'filter': {
      const {
        name
      } = payload;
      const regExp = db.RegExp({
        regexp: name,
        options: 'i', // i表示不区分大小写
      });
      return await schoolDB.where({
        name: regExp,
      }).get();
    }
    case 'create': {
      // 创建
      const {
        name,
        address,
        creator,
        creatorUser,
      } = payload;
      if (!name) {
        return {
          errCode: 1,
          msg: '缺少名称'
        }
      }
      if (!address) {
        return {
          errCode: 1,
          msg: '缺少地址'
        }
      }
      if (!creator) {
        return {
          errCode: 1,
          msg: '缺少创建者信息'
        }
      }
      return await schoolDB.add({
        data: {
          name,
          address,
          creator,
          creatorUser,
          createdAt: new Date()
        }
      });
    }
    case 'update': {
      // 修改
      const {
        _id,
        name,
        address,
        creator,
        creatorUser,
      } = payload;
      if (!_id) {
        return {
          errCode: 1,
          msg: '未指定_id'
        }
      }
      const info = {
        updatedAt: new Date()
      };
      if (name) {
        info.name = name;
      }
      if (address) {
        info.address = address;
      }
      if (creator) {
        info.creator = creator;
        info.creatorUser = creatorUser;
      }
      return await schoolDB.where({
          _id
        })
        .update({
          data: info,
        });
    }
    default:
      return {
        errCode: 1,
          msg: '未指定正确的操作类型',
      };
  }
};