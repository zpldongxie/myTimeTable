const {
  envList
} = require('./envList.js');

module.exports = {
  /** 云函数调用封装 */
  callFunction: (type, data) => {
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
  },
  /** 防抖方法封装 */
  debounceAsync: function (func, wait) {
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
  },
}