const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 班级管理员消息
exports.main = async (event, context) => {
  const { method, ...payload } = event.data || {}

  const msgDB = db.collection('msg_creator')

  switch (method) {
    case 'get':
      // 根据openId查找
      const { openId, pageSize = 20, pageIndex = 1 } = payload
      if (!openId) {
        return {
          errCode: 1,
          msg: '参数不完整，无法查询。'
        }
      }
      return await msgDB
        .where({
          openId
        })
        .orderBy('createdAt', 'desc')
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
        .get()
    case 'getUnread': {
      // 根据openId查找是否有未读
      const { openId } = payload
      if (!openId) {
        return {
          errCode: 1,
          msg: '参数不完整，无法查询。'
        }
      }
      return await msgDB
        .where({
          openId,
          read: false
        })
        .count()
    }
    case 'create': {
      // 插入或更新
      const { openId, msg, sender } = payload
      if (!openId || !msg || !sender) {
        return {
          errCode: 1,
          msg: '参数不完整，无法保存。'
        }
      }
      const info = {
        openId,
        msg,
        sender,
        read: false
      }
      return await msgDB.add({
        data: {
          ...info,
          createdAt: new Date()
        }
      })
    }
    case 'read': {
      const { _id } = payload
      if (!_id) {
        return {
          errCode: 1,
          msg: '参数不完整，无法更新。'
        }
      }
      return await msgDB.doc(_id).update({ data: { read: true } })
    }
    case 'readAll': {
      const { openId } = payload
      if (!openId) {
        return {
          errCode: 1,
          msg: '参数不完整，无法更新。'
        }
      }
      return await msgDB.where({ openId }).update({ data: { read: true } })
    }
    case 'del': {
      // 按_id删除
      const { _id } = payload
      if (!_id) {
        return {
          errCode: 1,
          msg: '缺少_id'
        }
      }
      return await msgDB.doc(_id).remove()
    }

    default:
      return {
        errCode: 1,
        msg: '未指定正确的操作类型'
      }
  }
}
