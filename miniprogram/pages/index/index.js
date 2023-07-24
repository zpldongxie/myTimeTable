const {
  callFunction
} = require('../../utils.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    callFunction('getOpenId').then((resp) => {
      if (resp.errMsg !== "cloud.callFunction:ok") {
        wx.showToast({
          title: '登录信息异常，请稍后打开重试',
          icon: 'none'
        });
        return null
      }
      this.setData({
        openId: resp.result.openid
      });
      return callFunction('users', {
        type: 'get',
        openId: this.data.openId,
      })
    }).then((resp) => {
      if (resp.errMsg !== "cloud.callFunction:ok") {
        wx.showToast({
          title: '数据库异常，请稍后打开重试',
          icon: 'none'
        });
        return null
      }
      if (resp.result) {
        // 有用户登录记录
        // wx.navigateTo({
        //   url: `/pages/${e.currentTarget.dataset.page}/index?envId=${this.data.selectedEnv.envId}`,
        // });
        wx.showToast({
          title: '老用户，直接进入课表',
        })
      } else {
        // 无用户登录记录
        wx.navigateTo({
          url: `/pages/chooseClass/index?openId=${this.data.openId}`,
        });
      }
    }).catch((e) => {
      console.error(e);
      wx.showToast({
        title: '系统错误，请联系管理员',
        icon: 'none'
      });
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})