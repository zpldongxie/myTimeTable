// pages/fuZhuang/index.js
const { getCurrentClass, getCurrentUser, callFunction, analysisRes, getOpenId } = require('../../utils')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    days: ['星期一', '星期二', '星期三', '星期四', '星期五'],
    data: [],
    currentClass: null,
    isCreator: false, // 是否为创建者
    isReday: false // 是否完成数据请求
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this
    const currentOpenId = getOpenId()
    const currentClass = getCurrentClass()
    this.setData({
      currentClass,
      isCreator: currentClass?.creator === currentOpenId
    })
    callFunction('fu_zhuang', { method: 'get', classId: currentClass._id })
      .then(res => {
        return analysisRes({
          res,
          messageType: 'collection.get',
          defaultValue: []
        })
      })
      .then(res => {
        that.setData({ isReday: true })
        if (res?.length) {
          that.setData({ data: res })
        }
      })
  },

  /** 提醒管理员维护着装信息 */
  callAdmin() {
    const currentUser = getCurrentUser()
    callFunction('msg_creator', {
      method: 'create',
      openId: this.data.currentClass?.creator,
      msg: (currentUser?.nickName || '未知用户') + '提醒你【维护着装信息】',
      sender: currentUser
    }).then(res => {
      console.log(res)
    })
    wx.showToast({
      title: '留言成功'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {}
})
