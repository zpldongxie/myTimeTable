const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 背景图配置
exports.main = async (event, context) => {
  const {
    method,
    ...payload
  } = event.data || {};

  const bgImgsDB = db.collection('bgImgs');

  switch (method) {
    case 'get': {
      // 根据班级id查找
      const {
        classId
      } = payload;
      if (!classId) {
        return {
          errCode: 1,
          msg: '缺少班级Id'
        }
      }
      const queryInfo = {
        classId
      }
      return await bgImgsDB.where(queryInfo).get();
    }
    case 'create': {
      // 创建
      const {
        classId,
        url,
        fileID
      } = payload;
      if (!classId) {
        return {
          errCode: 1,
          msg: '班级ID'
        }
      }
      if (!url) {
        return {
          errCode: 1,
          msg: '链接信息'
        }
      }
      if (!fileID) {
        return {
          errCode: 1,
          msg: 'fileID'
        }
      }
      return await bgImgsDB.add({
        data: {
          classId,
          url,
          fileID,
          createdAt: new Date()
        }
      });
    }
    case 'update': {
      // 修改
      const {
        classId,
        url,
        fileID,
      } = payload;
      if (!classId) {
        return {
          errCode: 1,
          msg: '班级ID'
        }
      }
      if (!url) {
        return {
          errCode: 1,
          msg: '链接信息'
        }
      }
      if (!fileID) {
        return {
          errCode: 1,
          msg: 'fileID'
        }
      }
      const info = {
        url,
        fileID,
        updatedAt: new Date()
      };
      // await cloud.deleteFile({
      //   fileList: [originalData.fileID],
      // })
      return await bgImgsDB.where({
          classId
        })
        .update({
          data: info,
        });
    }
    case 'upsert': {
      // 插入或更新
      const {
        classId,
        url,
        fileID
      } = payload;
      if (!classId || !url || !fileID) {
        return {
          errCode: 1,
          msg: '参数不完整，无法保存。',
        };
      }
      const info = {
        classId,
        url,
        fileID
      };
      const res = await bgImgsDB.where({
        classId
      }).get()

      if (res.data.length) {
        // update
        const {
          _id,
          ...originalData
        } = res.data[0];
        await cloud.deleteFile({
          fileList: [originalData.fileID],
        })
        const mergedData = Object.assign({}, originalData, {
          url,
          fileID
        }, {
          updatedAt: new Date()
        });
        return bgImgsDB.doc(res.data[0]._id).set({
          data: mergedData
        });
      } else {
        // create
        return bgImgsDB.add({
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
      // await cloud.deleteFile({
      //   fileList: [originalData.fileID],
      // })
      return await bgImgsDB.doc(_id).remove();
    }
    default:
      return {
        errCode: 1,
          msg: '未指定正确的操作类型',
      };
  }
};