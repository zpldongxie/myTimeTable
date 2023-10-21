// pages/ziLiao/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    fileList: [
      {
        cover: 'https://gsjj-1301580990.cos.ap-nanjing.myqcloud.com/cover.png',
        url: '/pages/guShiJiangJie/index'
      }
    ], // 文件目录列表
    randomHPClassname: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 随机切换花瓶
    const index = Math.floor(Math.random() * 5) + 1 // 生成一个 0 到 2 的随机整数
    const classname = `hp hp${index}` // 根据随机整数生成 classname
    this.setData({
      randomHPClassname: classname
    })
  },

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
