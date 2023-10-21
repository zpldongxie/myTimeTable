const cloud = require('wx-server-sdk')
const NodeRSA = require('node-rsa')

const publicKey =
  '-----BEGIN PUBLIC KEY-----MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAMshKUYpIewWLODvYfJNHn6oCcsEtvA4F1cweK5anOXMRHzD3pI65S+8nq3QPac9ESvog90UJvsUtLpbMtI68gMCAwEAAQ==-----END PUBLIC KEY-----'
const privateKey =
  '-----BEGIN PRIVATE KEY-----MIIBVQIBADANBgkqhkiG9w0BAQEFAASCAT8wggE7AgEAAkEAyyEpRikh7BYs4O9h8k0efqgJywS28DgXVzB4rlqc5cxEfMPekjrlL7yerdA9pz0RK+iD3RQm+xS0ulsy0jryAwIDAQABAkEAnKmRvKPinsOnjz/wycCCwWp2SxbyxKhuD/e5S7dlBLE6kfJPsOhov+BmVJn0fGlDdbAHuRZqhfAa7wwt2rli8QIhAPSAwmAr7Awqh3xCG1n8OlS5TQGMeEeLWpaXTjD3r667AiEA1K5c9zwAUy05RsK34yJk6vU7J4Hxv5O8CbW3btft6VkCIQDgszhvc84R/D/ZVVOXpjLhTA5WHwcnEQ2mmdT1MZvWIwIgS6OnlJZWVz6iPDRMSg+VbKrC2w4v+D6Ghb2G+3j4OCECIFTV3SYu/djwZWEEdCvyGNvpoilBUFQmdpQLDkvH7VmG-----END PRIVATE KEY-----'

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 第三方开放接口
exports.main = async (event, context) => {
  const { method, ...payload } = event.data || {}
  const { content } = payload

  switch (method) {
    // 检查敏感词
    case 'msgSecCheck':
      try {
        const result = await cloud.openapi.security.msgSecCheck({
          content
        })

        return result
      } catch (error) {
        console.error(error)
        return {
          errCode: -1,
          errMsg: '敏感词检测失败'
        }
      }
    // rsa加密
    case 'encrypt': {
      const { data } = payload
      const nodersa = new NodeRSA(publicKey)
      const encrypted = nodersa.encrypt(data, 'base64')
      return encrypted
    }
    // rsa解密
    case 'decrypt': {
      const { data } = payload
      const nodersa = new NodeRSA(privateKey)
      const decrypted = nodersa.decrypt(data, 'utf8')
      return decrypted
    }
    default:
      return {
        errCode: 1,
        msg: '未指定正确的操作类型'
      }
  }
}
