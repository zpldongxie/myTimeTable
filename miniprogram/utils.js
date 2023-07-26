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
};

/** 按名称模糊搜索学校 */
const getSchools = async (name) => {
  if (!name) {
    return [];
  }
  return callFunction('schools', {
    method: 'filter',
    name,
  }).then(function (res) {
    if (res.errMsg !== "cloud.callFunction:ok") {
      console.error(res.errMsg);
      return [];
    }
    if (res.result.errCode || res.result.errMsg !== 'collection.get:ok') {
      console.error(res.result);
      return [];
    }
    return res.result.data;
  }).catch(function (e) {
    console.error(e)
    return [];
  });
};

/** 根据_id查找单个学校 */
const getSchoolById = async (_id) => {
  if (!_id) {
    console.warn('参数缺少_id');
    return null;
  }
  return callFunction('schools', {
    method: 'getById',
    _id,
  }).then(function (res) {
    if (res.errMsg !== "cloud.callFunction:ok") {
      console.error(res.errMsg);
      return null;
    }
    if (res.result.errCode || res.result.errMsg !== 'document.get:ok') {
      console.error(res.result);
      return null;
    }
    return res.result.data;
  }).catch(function (e) {
    console.error(e)
    return null;
  });
};

/** 查询所有年级 */
const getGrades = async () => {
  return callFunction('grades', {
    method: 'get',
  }).then(function (res) {
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

/** 按code查询单个年级 */
const getGradeByCode = async (code) => {
  if (!code) {
    console.error('参数缺少code');
    return [];
  }
  const grades = await getGrades();
  return grades.find(g => g.code === code) || null
};

/** 按学校和年级查找班级列表 */
const getClasses = async ({
  schoolId,
  gradeCode
}) => {
  if (!schoolId) {
    console.error('参数缺少schoolId');
    return [];
  }
  if (!gradeCode) {
    console.error('参数缺少gradeCode');
    return [];
  }
  return callFunction('classes', {
    method: 'get',
    schoolId,
    gradeCode,
  }).then(function (res) {
    if (res.errMsg !== "cloud.callFunction:ok") {
      console.error(res.errMsg);
      return [];
    }
    if (res.result.errCode || res.result.errMsg !== 'collection.get:ok') {
      console.error(res.result);
      return [];
    }
    return res.result.data;
  }).catch(function (e) {
    console.error(e)
    return [];
  });
};

/** 按条件查找单个班级 */
const getClass = async ({
  schoolId,
  gradeCode,
  name
}) => {
  if (!schoolId) {
    console.error('参数缺少schoolId');
    return null;
  }
  if (!gradeCode) {
    console.error('参数缺少gradeCode');
    return null;
  }
  if (!name) {
    console.error('参数缺少班级name');
    return null;
  }
  return callFunction('classes', {
    method: 'get',
    schoolId,
    gradeCode,
    name,
  }).then(function (res) {
    if (res.errMsg !== "cloud.callFunction:ok") {
      console.error(res.errMsg);
      return null;
    }
    if (res.result.errCode || res.result.errMsg !== 'collection.get:ok') {
      console.error(res.result);
      return null;
    }
    return res.result.data.length ? res.result.data[0] : null;
  }).catch(function (e) {
    console.error(e)
    return null;
  });
};

module.exports = {
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
  getSchools,
  getSchoolById,
  getGrades,
  getGradeByCode,
  getClasses,
  getClass,
}