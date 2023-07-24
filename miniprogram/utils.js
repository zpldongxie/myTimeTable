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
  }
}