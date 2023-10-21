// 腾讯云存储相关操作
const COS = require('./libs/cos-wx-sdk-v5.js')

const getCOS = async () => {
  const app = getApp()
  if (app.globalData.cos_tencent) return app.globalData.cos_tencent
  app.globalData.cos_tencent = new COS({
    SecretId: 'AKIDOjsnW5VlspcEhz6Wq14vfFTcenqlYChB',
    SecretKey: 'UwJaht5CD7xiIj0A81iGi3GLI8uiU6Zr',
    SimpleUploadMethod: 'putObject' // 强烈建议，高级上传、批量上传内部对小文件做简单上传时使用putObject,sdk版本至少需要v1.3.0
  })
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
