// 腾讯云存储相关操作
const COS = require('./libs/cos-wx-sdk-v5.js')
const { encrypt, decrypt } = require('./utils.js')

const getCOS = async () => {
  const app = getApp()
  if (app.globalData.cos_tencent) return app.globalData.cos_tencent
  const prams = await decrypt(
    'DY/oX7stMRyy8gfnexyVeei5smTMOV67VvrcwAGHiA1lchlXoknc87v+y+cnVXhQAelySI6LuS6jDb0YfVSuFGqdMSOpktTeUPNXBLkaH6je+X9wmIbOLf61Pc4+FGtbk4glM9VDmljBps2/ENTUg4MGOIKiEEYO1Q59+vfFuVQLcXWkkFrM6r/vG30BzChyvKfX6/wKDoX4//V4qAbMA1omUl1buUYc0uhdBU5hAAzmmk+OwGuL905700k4PJ08cRB0qd6EGMuqWJQqCNUN9SRLb6z8wpdps2hXsWq/STgtV/1lxYh2NL5h9uw2Kzhw82QbXfL+dv6FzXy3XOYsg79imRmvTk4ZeIZyMLstkzFD1TIJEL9B2O2bzdJOpDikvTzcTUhWnkEZ2fxiBsglVVsnlC0zHTGLK6t3fq5f3t1FKcacMtmGBH9BOrK8yX1uT64fwEpbI4IjC9+Y9NwB7vgwfHXAG9ec6x11qW4tkpCzI4PeUFS6j9HLO7AANeXV'
  )
  if (!prams) return null
  app.globalData.cos_tencent = new COS(JSON.parse(prams))
  return app.globalData.cos_tencent
}

/**
 * 查询文件列表
 * @param {string} Bucket 存储桶
 * @param {string} Region 地区代码
 * @param {string} Prefix 路径前缀
 */
const getList = async (Bucket, Region, Prefix) => {
  const cos = await getCOS()
  if (!cos) {
    return []
  }
  return new Promise((resolve, reject) => {
    cos.getBucket(
      {
        Bucket,
        Region,
        Prefix // 这里传入列出的文件前缀
      },
      function (err, data) {
        console.log(err || data)
        if (err) {
          reject(err)
        }
        resolve(data.Contents)
      }
    )
  })
}

module.exports = {
  getCOS,
  getList
}
