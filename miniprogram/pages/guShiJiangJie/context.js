// pages/guShiJiangJie/context.js
const { getList } = require('../../utils-tencent.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const Bucket = 'gsjj-1301580990'
    const Region = 'ap-nanjing'
    const res = await getList(Bucket, Region, options.key)
    const currentList = Array.from(res || [])
      .filter(item => item.Size !== '0')
      .filter(item => item.Key.includes('.mp3'))
      .map(item => ({
        ...item,
        url: `https://${Bucket}.cos.${Region}.myqcloud.com/${item.Key}`,
        Key: item.Key.replace(options.key + '/', '').replace('.mp3', '')
      }))
    console.log('currentList: ', currentList)
    this.setData({
      title: options.title,
      list: currentList
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
