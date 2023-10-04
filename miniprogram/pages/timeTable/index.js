// pages/timeTable/index.js
const { analysisRes, getCurrentClass, callFunction, getOpenId, getTimetable, todo } = require('../../utils')

Page({
  data: {
    days: ['星期一', '星期二', '星期三', '星期四', '星期五'],
    currentClass: null,
    isReday: false, // 是否完成数据请求
    schedule: null, // 作息数据
    timetable: null, // 课表数据
    isCreator: false, // 是否为创建者
    unread: 0 // 未读消息数，只针对创建者
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},

  onShow() {
    const that = this
    const currentOpenId = getOpenId()
    const currentClass = getCurrentClass()
    if (!currentOpenId || !currentClass) {
      return
    }
    this.setData({
      currentClass,
      isCreator: currentClass?.creator === currentOpenId
    })
    getTimetable({
      classId: currentClass._id
    }).then(res => {
      const { schedules, timeTable } = res || {
        schedules: null,
        timeTable: null
      }
      that.setData({
        isReday: true,
        schedule: schedules?.data,
        timetable: timeTable?.dataset
      })
    })
    if (currentClass?.creator === currentOpenId) {
      callFunction('msg_creator', { method: 'getUnread', openId: currentOpenId })
        .then(res => {
          return analysisRes({
            res,
            messageType: 'collection.count',
            defaultValue: 0
          })
        })
        .then(res => {
          that.setData({ unread: res })
        })
    }
  },

  /** 分享好友 */
  onShare() {
    console.log('onShare start')
    // 显示分享菜单供用户选择
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage']
    })
  },
  // 设置要分享的小程序信息
  onShareAppMessage: function () {
    return {
      title: '这个课表很好用，快来为咱们班创建课表吧',
      path: '/pages/index/index', // 小程序路径，可以带参数
      imageUrl: 'cloud://cloud1-8ggb0v441269ef28.636c-cloud1-8ggb0v441269ef28-1319420876/code.png'
    }
  },

  doEdit() {
    const itemList = ['改作息']
    if (!!this.data.timetable) {
      itemList.push('改课表')
      itemList.push('改背景图')
    }
    wx.showActionSheet({
      itemList,
      success: function (res) {
        if (!res.cancel) {
          const index = res.tapIndex
          switch (index) {
            case 0:
              wx.navigateTo({
                url: '/pages/editSchedule/index'
              })
              break
            case 1:
              wx.navigateTo({
                url: '/pages/editTimeTable/index'
              })
              break

            default:
              todo()
              break
          }
        }
      }
    })
  },

  jumpPage(e) {
    let url = `/pages/${e.currentTarget.dataset.page}/index`
    if (e.currentTarget.dataset.params) {
      url += `?${e.currentTarget.dataset.params}`
    }
    wx.navigateTo({
      url
    })
  },

  // 点赞
  doDZ() {
    todo()
  },

  // 打赏
  doDS() {
    todo()
  },

  // 问题反馈
  doFK() {
    todo()
  },

  // 转让管理
  doZR() {
    todo()
  }
})
