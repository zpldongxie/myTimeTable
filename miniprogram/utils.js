const {
  envList
} = require('./envList.js');

/** 云函数调用封装 */
const callFunction = (type, data) => {
  console.log('type: ', type);
  console.log('data: ', data);
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

const app = getApp();
/** 全局，获取openId */
const getOpenId = () => {
  return app.globalData.openId;
}
/** 全局，设置openId */
const setOpenId = (openId) => {
  app.globalData.openId = openId;
}
/** 全局，获取学校 */
const getCurrentSchool = () => {
  return app.globalData.currentSchool;
}
/** 全局，设置学校 */
const setCurrentSchool = (info) => {
  app.globalData.currentSchool = info;
}
/** 全局，获取年级 */
const getCurrentGrade = () => {
  return app.globalData.currentGrade;
}
/** 全局，设置年级 */
const setCurrentGrade = (info) => {
  app.globalData.currentGrade = info;
}
/** 全局，获取班级 */
const getCurrentClass = () => {
  return app.globalData.currentClass;
}
/** 全局，设置班级 */
const setCurrentClass = (info) => {
  app.globalData.currentClass = info;
}

/** 防抖方法封装 */
const debounceAsync = function (func, wait) {
  let timer = null;
  return function () {
    const args = Array.prototype.slice.call(arguments);
    clearTimeout(timer);
    return new Promise((resolve, reject) => {
      timer = setTimeout(async () => {
        try {
          const result = await func.apply(this, args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, wait);
    });
  };
}

/** 查询所有年级 */
const getGrades = async () => {
  return callFunction('grades', {
    method: 'get',
  }).then(function (res) {
    console.log('res: ', res)
    if (res.errMsg !== "cloud.callFunction:ok") {
      console.error(res.errMsg);
      return [];
    }
    if (res.result?.errMsg !== 'collection.get:ok') {
      console.error(res.result);
      return [];
    }
    return res.result.data;
  }).catch(function (e) {
    console.error(e)
    return [];
  });
}

module.exports = {
  /** 云函数调用封装 */
  callFunction,
  /** 防抖方法封装 */
  debounceAsync,
  /** 查询所有年级 */
  getGrades,
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
}