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
      return await classDB.where({
        schoolId,
        gradeCode
      }).get();
    }
    case 'create': {
      // 创建
      const {
        name,
        schoolId,
        gradeCode,
        creator
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
          creator
        }
      });
    }
    case 'update': {
      // 修改
      const {
        _id,
        name,
        creator
      } = payload;
      if (!_id) {
        return {
          errCode: 1,
          msg: '未指定_id'
        }
      }
      const info = {};
      if (name) {
        info.name = name;
      }
      if (creator) {
        info.creator = creator;
      }
      return await classDB.where({
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