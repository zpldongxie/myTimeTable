// pages/msgForCreator/index.js
const { callFunction, analysisRes, getOpenId } = require('../../utils')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isReday: false,
    pageIndex: 1,
    pageSize: 20,
    messageList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this
    const currentOpenId = getOpenId()
    callFunction('msg_creator', {
      method: 'get',
      openId: currentOpenId,
      pageIndex: that.data.pageIndex,
      pageSize: that.data.pageSize
    })
      .then(res => {
        return analysisRes({
          res,
          messageType: 'collection.get',
          defaultValue: []
        })
      })
      .then(res => {
        console.log(res)
        that.setData({
          messageList: res.map(r => ({
            ...r,
            createdAt: `${new Date(r.createdAt).getFullYear()}年${new Date(r.createdAt).getMonth() + 1}月${new Date(
              r.createdAt
            ).getDate()}日 ${new Date(r.createdAt).getHours()}:${new Date(r.createdAt).getMinutes()}`
          }))
        })
      })
  },

  read(e) {
    const that = this
    const _id = e.currentTarget.dataset.id
    callFunction('msg_creator', {
      method: 'read',
      _id
    })
      .then(res => {
        console.log(res)
        return analysisRes({
          res,
          messageType: 'document.update',
          defaultValue: {}
        })
      })
      .then(res => {
        console.log(res)
        const newList = [...that.data.messageList]
        newList.forEach(item => {
          if (item._id === _id) {
            item.read = true
          }
        })
        that.setData({ messageList: newList })
      })
  },

  readAll() {
    const that = this
    const currentOpenId = getOpenId()
    callFunction('msg_creator', {
      method: 'readAll',
      openId: currentOpenId
    })
      .then(res => {
        console.log(res)
        return analysisRes({
          res,
          messageType: 'collection.update',
          defaultValue: {}
        })
      })
      .then(res => {
        console.log(res)
        const newList = [...that.data.messageList]
        newList.forEach(item => {
          item.read = true
        })
        that.setData({ messageList: newList })
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
