// pages/fuZhuang/index.js
const {
  getCurrentClass,
  getCurrentUser,
  callFunction,
  analysisRes,
  getOpenId,
  getCurrentGrade
} = require('../../utils')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    days: ['星期一', '星期二', '星期三', '星期四', '星期五'],
    data: [],
    currentIndex: new Date().getDay() - 1,
    currentGrade: null,
    currentClass: null,
    isCreator: false, // 是否为创建者
    isReday: false, // 是否完成数据请求
    hasValue: false, // 是否已经配置内容，用于普通用户显示控制
    lastUpdateTime: null, // 最后更新时间
    // 拾色器
    rgb: 'rgb(0,154,97)', //初始值
    pick: false,
    choose: {} // 当前正在操作的颜色
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this
    const currentOpenId = getOpenId()
    const currentGrade = getCurrentGrade()
    const currentClass = getCurrentClass()
    this.setData({
      currentGrade,
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
        let lastUpdateTime = that.data.lastUpdateTime
        res.forEach(r => {
          const { createdAt = '0', updatedAt = '0' } = r
          const maxTime = new Date(createdAt) > new Date(updatedAt) ? createdAt : updatedAt
          if (!lastUpdateTime || new Date(maxTime) > new Date(lastUpdateTime)) {
            lastUpdateTime = maxTime
          }
        })
        lastUpdateTime =
          lastUpdateTime && lastUpdateTime !== '0'
            ? `${new Date(lastUpdateTime).getFullYear()}年${new Date(lastUpdateTime).getMonth() + 1}月${new Date(
                lastUpdateTime
              ).getDate()}日 ${new Date(lastUpdateTime).getHours()}:${new Date(lastUpdateTime).getMinutes()}`
            : ''
        that.setData({
          isReday: true,
          hasValue: !!res.length,
          lastUpdateTime,
          data: that.data.days.map(d => {
            const current = res.find(r => r.day === d)
            return {
              day: d,
              src_wt: that.getWTImg(current?.color_wt || '#999'),
              src_sy: that.getSYImg(current?.color_sy || '#999'),
              src_xy: that.getXYImg(current?.color_xy || '#999')
            }
          })
        })
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

  /** 设置激活index */
  handleChange: function (e) {
    this.setData({
      currentIndex: e.detail.current
    })
  },

  /** 动态获取外套svg */
  getWTImg: function (color = '#11CD6E') {
    const svgXml = `<svg t="1696477365169" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18976" width="200" height="200"><path d="M341.32992 870.4h341.34016v51.2H341.32992zM648.52992 102.4L512 238.94016 375.47008 102.4zM486.4 285.73696V819.2H307.2V528.09728l-83.27168 152.64768L102.4 614.4l204.8-375.45984h68.27008V174.7968zM716.8 238.94016h-68.27008V174.7968L537.6 285.73696v89.73312h110.92992v51.2H537.6V819.2H716.8V528.09728l83.27168 152.64768L921.6 614.4z" fill="${color}" p-id="18977"></path></svg>`
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgXml)}`
  },

  /** 动态获取上衣svg */
  getSYImg: function (color = '#11CD6E') {
    const svgXml = `<svg t="1696428431726" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18654" width="200" height="200"><path d="M341.32992 802.14016h341.34016v51.2H341.32992zM716.8 170.67008h-95.52896L512 279.93088l-109.27104-109.2608H307.2L102.4 546.14016l121.52832 66.32448L307.2 459.83744v291.10272h409.6V459.83744l83.27168 152.6272L921.6 546.14016z" fill="${color}" p-id="18655"></path></svg>`
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgXml)}`
  },

  /** 动态获取下衣svg */
  getXYImg: function (color = '#11CD6E') {
    const svgXml = `<svg t="1696428470543" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18814" width="200" height="200"><path d="M238.92992 102.4h546.14016v85.32992H238.92992zM648.52992 392.52992v-51.2h136.54016v-102.4H238.92992v102.4h136.54016v51.2H238.92992V921.6H409.6l85.32992-443.72992h34.14016L614.4 921.6h170.67008V392.52992z" fill="${color}" p-id="18815"></path></svg>`
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgXml)}`
  },

  // 显示取色器
  toPick: function (e) {
    const { day, type } = e.currentTarget.dataset
    this.setData({
      choose: { day, type },
      pick: true
    })
  },

  // 隐藏取色器
  closePick: function () {
    this.setData({
      pick: false
    })
  },

  //取色结果回调
  pickColor(e) {
    const that = this
    const rgb = e.detail.color
    const { day, type } = this.data.choose
    // 入库
    callFunction('fu_zhuang', {
      method: 'upsert',
      classId: this.data.currentClass._id,
      day,
      data: { ['color_' + type]: rgb }
    })
      .then(res => {
        return analysisRes({
          res,
          messageType: 'upsert',
          defaultValue: {}
        })
      })
      .then(res => {
        console.log('res: ', res)
        that.setData({
          data: [...that.data.data].map(item => {
            if (item.day === day) {
              switch (type) {
                case 'wt':
                  item.src_wt = that.getWTImg(rgb)
                  break
                case 'sy':
                  item.src_sy = that.getSYImg(rgb)
                  break
                case 'xy':
                  item.src_xy = that.getXYImg(rgb)
                  break
                default:
                  break
              }
            }
            return item
          }),
          lastUpdateTime: `${new Date().getFullYear()}年${
            new Date().getMonth() + 1
          }月${new Date().getDate()}日 ${new Date().getHours()}:${new Date().getMinutes()}`
        })
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
