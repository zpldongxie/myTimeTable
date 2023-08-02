const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 班级管理
exports.main = async (event, context) => {
  const {
    method,
    ...payload
  } = event.data || {};

  const classDB = db.collection('classes');

  switch (method) {
    case 'get': {
      // 按学校和年级查询
      const {
        schoolId,
        gradeCode,
        name
      } = payload;
      if (!schoolId) {
        return {
          errCode: 1,
          msg: '缺少学校Id'
        }
      }
      if (!gradeCode) {
        return {
          errCode: 1,
          msg: '缺少年级Code'
        }
      }
      const queryInfo = {
        schoolId,
        gradeCode
      }
      if (name) {
        queryInfo.name = name;
      }
      return await classDB.where(queryInfo).get();
    }
    case 'create': {
      // 创建
      const {
        name,
        schoolId,
        gradeCode,
        creator,
        creatorUser,
      } = payload;
      if (!name) {
        return {
          errCode: 1,
          msg: '缺少名称'
        }
      }
      if (!schoolId) {
        return {
          errCode: 1,
          msg: '缺少学校Id'
        }
      }
      if (!gradeCode) {
        return {
          errCode: 1,
          msg: '缺少年级Code'
        }
      }
      if (!creator) {
        return {
          errCode: 1,
          msg: '缺少创建者信息'
        }
      }
      return await classDB.add({
        data: {
          name,
          schoolId,
          gradeCode,
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
      if (creator) {
        info.creator = creator;
        info.creatorUser = creatorUser;
      }
      return await classDB.where({
          _id
        })
        .update({
          data: info,
        });
    }
    case 'del': {
      // TODO 待实现，需要处理级联
    }
    default:
      return {
        errCode: 1,
          msg: '未指定正确的操作类型',
      };
  }
};