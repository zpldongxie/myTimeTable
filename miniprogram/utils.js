const { envList } = require('./envList.js')

/** 尚未实现的功能 */
const todo = () => {
  wx.showToast({
    title: '敬请期待。。。',
    icon: 'none'
  })
}

/**
 * 云函数调用封装
 *
 * @param {*} type 云函数type，本项目是约定为数据库名称
 * @param {*} data 请求体数据，本项目中为method和其他数据
 * @return {*}
 */
const callFunction = (type, data) => {
  console.log('type: ', type)
  console.log('data: ', data)
  return wx.cloud.callFunction({
    name: 'quickstartFunctions',
    config: {
      env: envList[0].envId
    },
    data: {
      type,
      data
    }
  })
}

/**
 * 敏感词过滤
 *
 * @param {*} msg 待过滤内容
 * @return {boolean} 过滤结果
 */
const sensitiveWordsFilter = msg => {
  if (!msg) {
    return true
  }
  return callFunction('openApi', {
    method: 'msgSecCheck',
    msg
  })
    .then(function (res) {
      console.log('🚀 ~ file: utils.js:43 ~ sensitiveWordsFilter ~ res:', res)
      return true
    })
    .catch(function (e) {
      console.error(e)
      return false
    })
}

/**
 * rsa加密
 *
 * @param {*} data 待加密内容
 * @return {boolean} 加密结果
 */
const encrypt = data => {
  if (!data) {
    return null
  }
  return callFunction('openApi', {
    method: 'encrypt',
    data
  })
    .then(function (res) {
      console.log('🚀 ~ file: utils.js:72 ~ sensitiveWordsFilter ~ res:', res)
      return res.result
    })
    .catch(function (e) {
      console.error(e)
      return ''
    })
}

/**
 * rsa解密
 *
 * @param {*} data 待解密内容
 * @return {boolean} 解密结果
 */
const decrypt = data => {
  if (!data) {
    return null
  }
  return callFunction('openApi', {
    method: 'decrypt',
    data
  })
    .then(function (res) {
      console.log('🚀 ~ file: utils.js:96 ~ sensitiveWordsFilter ~ res:', res)
      return res.result
    })
    .catch(function (e) {
      console.error(e)
      return null
    })
}

const app = getApp()
/** 全局，获取openId */
const getOpenId = () => {
  return app.globalData.openId
}
/** 全局，设置openId */
const setOpenId = openId => {
  app.globalData.openId = openId
}
/** 全局，获取学校 */
const getCurrentSchool = () => {
  return app.globalData.currentSchool
}
/** 全局，设置学校 */
const setCurrentSchool = info => {
  app.globalData.currentSchool = info
}
/** 全局，获取年级 */
const getCurrentGrade = () => {
  return app.globalData.currentGrade
}
/** 全局，设置年级 */
const setCurrentGrade = info => {
  app.globalData.currentGrade = info
}
/** 全局，获取班级 */
const getCurrentClass = () => {
  return app.globalData.currentClass
}
/** 全局，设置班级 */
const setCurrentClass = info => {
  app.globalData.currentClass = info
}
/** 全局，获取当前用户 */
const getCurrentUser = () => {
  return app.globalData.currentUser
}
/** 全局，设置当前用户 */
const setCurrentUser = info => {
  app.globalData.currentUser = info
}

/** 防抖方法封装 */
const debounceAsync = function (func, wait) {
  let timer = null
  return function () {
    const args = Array.prototype.slice.call(arguments)
    clearTimeout(timer)
    return new Promise((resolve, reject) => {
      timer = setTimeout(async () => {
        try {
          const result = await func.apply(this, args)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, wait)
    })
  }
}

/**
 * 分析云函数调用结果
 * @param {Object} res 云函数调用结果
 * @param {string} messageType 数据库信息类型，例如列表查询为collection.get，按id查询为document.get，创建为collection.add，更新为document.update
 * @param {any} defaultValue 默认值
 * @returns {any} 返回分析后的数据
 */
const analysisRes = ({ res, messageType, defaultValue }) => {
  if (res.errMsg !== 'cloud.callFunction:ok') {
    console.warn('云函数调用异常。')
    console.error(res.errMsg)
    return defaultValue
  }
  let messageTypeNotSame = messageType && res.result.errMsg !== messageType + ':ok'
  if (messageType === 'upsert') {
    messageTypeNotSame =
      messageType &&
      res.result.errMsg !== 'collection.add:ok' &&
      res.result.errMsg !== 'document.update:ok' &&
      res.result.errMsg !== 'document.set:ok'
  }

  // messageType为数据库信息类型，例如列表查询为collection.get，按id查询为document.get，创建为collection.add，更新为document.update
  if (res.result.errCode || messageTypeNotSame) {
    console.warn('数据库操作异常。')
    console.error(res.result)
    return defaultValue
  }
  if (typeof res.result.data !== 'undefined') {
    return res.result.data
  }
  if (typeof res.result.total !== 'undefined') {
    return res.result.total
  }
  if (typeof res.result._id !== 'undefined') {
    return res.result._id
  }
  return res.result.stats
}

/** 按名称模糊搜索学校 */
const getSchools = async name => {
  if (!name) {
    return []
  }
  return callFunction('schools', {
    method: 'filter',
    name
  })
    .then(function (res) {
      return analysisRes({
        res,
        messageType: 'collection.get',
        defaultValue: []
      })
    })
    .catch(function (e) {
      console.error(e)
      return []
    })
}

/** 根据_id查找单个学校 */
const getSchoolById = async _id => {
  if (!_id) {
    console.warn('参数缺少_id')
    return null
  }
  return callFunction('schools', {
    method: 'getById',
    _id
  })
    .then(function (res) {
      return analysisRes({
        res,
        messageType: 'document.get',
        defaultValue: null
      })
    })
    .catch(function (e) {
      console.error(e)
      return null
    })
}

/** 查询所有年级 */
const getGrades = async () => {
  return callFunction('grades', {
    method: 'get'
  })
    .then(function (res) {
      return analysisRes({
        res,
        messageType: 'collection.get',
        defaultValue: []
      })
    })
    .catch(function (e) {
      console.error(e)
      return []
    })
}

/** 按code查询单个年级 */
const getGradeByCode = async code => {
  if (!code) {
    console.error('参数缺少code')
    return []
  }
  const grades = await getGrades()
  return grades.find(g => g.code === code) || null
}

/** 按学校和年级查找班级列表 */
const getClasses = async ({ schoolId, gradeCode }) => {
  if (!schoolId) {
    console.error('参数缺少schoolId')
    return []
  }
  if (!gradeCode) {
    console.error('参数缺少gradeCode')
    return []
  }
  return callFunction('classes', {
    method: 'get',
    schoolId,
    gradeCode
  })
    .then(function (res) {
      return analysisRes({
        res,
        messageType: 'collection.get',
        defaultValue: []
      })
    })
    .catch(function (e) {
      console.error(e)
      return []
    })
}

/** 按条件查找单个班级 */
const getClass = async ({ schoolId, gradeCode, name }) => {
  if (!schoolId) {
    console.error('参数缺少schoolId')
    return null
  }
  if (!gradeCode) {
    console.error('参数缺少gradeCode')
    return null
  }
  if (!name) {
    console.error('参数缺少班级name')
    return null
  }
  return callFunction('classes', {
    method: 'get',
    schoolId,
    gradeCode,
    name
  })
    .then(function (res) {
      return analysisRes({
        res,
        messageType: 'collection.get',
        defaultValue: []
      })
    })
    .then(res => {
      if (res.length) {
        return res[0]
      }
      return null
    })
    .catch(function (e) {
      console.error(e)
      return null
    })
}

/** 按班级ID查课表 */
const getTimetable = async ({ classId }) => {
  const returnData = {
    schedules: null,
    timeTable: null
  }
  if (!classId) {
    console.error('参数缺少classId')
    return returnData
  }
  return callFunction('schedules', {
    method: 'get',
    classId
  })
    .then(res => {
      return analysisRes({
        res,
        messageType: 'collection.get',
        defaultValue: []
      })
    })
    .then(res => {
      if (res.length) {
        // 保存作息时间
        returnData.schedules = res[0]
        return callFunction('timetables', {
          method: 'get',
          classId
        }).then(res => {
          return analysisRes({
            res,
            messageType: 'collection.get',
            defaultValue: []
          })
        })
      }
      return []
    })
    .then(res => {
      if (res.length) {
        // 保存课表
        returnData.timeTable = res[0]
      }
      return returnData
    })
}

/** 保存或更新课表 */
const upsertTimetable = async timetableData => {
  const classId = getCurrentClass()?._id
  const info = {
    classId,
    dataset: timetableData
  }
  try {
    const res = await callFunction('timetables', {
      method: 'upsert',
      ...info
    })
    if (res.errMsg !== 'cloud.callFunction:ok') {
      console.error('云函数调用异常。')
      console.error(res.errMsg)
      wx.showToast({
        title: '课表好像没有保存成功，请过一会再试试',
        icon: 'none'
      })
      return false
    }
    if (
      res.result.errCode ||
      (res.result.errMsg !== 'collection.add:ok' &&
        res.result.errMsg !== 'document.update:ok' &&
        res.result.errMsg !== 'document.set:ok')
    ) {
      console.error('数据库操作异常。')
      console.error(res.result)
      wx.showToast({
        title: '课表好像没有保存成功，请过一会再试试',
        icon: 'none'
      })
      return false
    }
    return true
  } catch (e) {
    console.error('保存失败：', e)
    wx.showToast({
      title: '课表好像没有保存成功，请过一会再试试',
      icon: 'none'
    })
    return false
  }
}

/** 按班级ID查所有课程 */
const getCourses = async ({ classId }) => {
  if (!classId) {
    console.error('参数缺少classId')
    return null
  }
  return callFunction('courses', {
    method: 'get',
    classId
  }).then(res => {
    return analysisRes({
      res,
      messageType: 'collection.get',
      defaultValue: []
    })
  })
}

module.exports = {
  todo,
  sensitiveWordsFilter,
  encrypt,
  decrypt,
  /** 云函数调用封装 */
  callFunction,
  /** 防抖方法封装 */
  debounceAsync,
  /** 全局，获取openId */
  getOpenId,
  /** 全局，设置openId */
  setOpenId,
  /** 全局，获取学校 */
  getCurrentSchool,
  /** 全局，设置学校 */
  setCurrentSchool,
  /** 全局，获取年级 */
  getCurrentGrade,
  /** 全局，设置年级 */
  setCurrentGrade,
  /** 全局，获取班级 */
  getCurrentClass,
  /** 全局，设置班级 */
  setCurrentClass,
  /** 全局，获取当前用户 */
  getCurrentUser,
  /** 全局，设置当前用户 */
  setCurrentUser,
  analysisRes,
  getSchools,
  getSchoolById,
  getGrades,
  getGradeByCode,
  getClasses,
  getClass,
  getTimetable,
  upsertTimetable,
  getCourses
}
