// pages/timeTable/index.js
const {
  analysisRes,
  getCurrentSchool,
  getCurrentGrade,
  getCurrentClass,
  callFunction
} = require("../../utils");

Page({
  data: {
    currentSchool: null,
    currentGrade: null,
    currentClass: null,
    isReday: false, // 是否完成数据请求
    schedule: null, // 作息数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this;
    this.setData({
      currentSchool: getCurrentSchool(),
      currentGrade: getCurrentGrade(),
      currentClass: getCurrentClass(),
    })
    callFunction('schedules', {
      method: 'get',
      classId: this.data.currentClass._id
    }).then(res => {
      return analysisRes({
        res,
        messageType: 'collection.get',
        defaultValue: []
      });
    }).then(res => {
      that.setData({
        isReday: true,
      })
      if (res.length) {
        that.setData({
          schedule: res[0]
        })
        // TODO: 渲染课表
      }
    })
  },

  /** 分享好友 */
  onShare () {
    console.log('onShare start');
    // 显示分享菜单供用户选择
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage']
    });
  },
  // 设置要分享的小程序信息
  onShareAppMessage: function () {
    return {
      title: '快来创建班级课表吧',
      path: '/pages/index/index', // 小程序路径，可以带参数
      imageUrl: 'cloud://cloud1-8ggb0v441269ef28.636c-cloud1-8ggb0v441269ef28-1319420876/code.png',
    }
  },

  jumpPage(e) {
    let url = `/pages/${e.currentTarget.dataset.page}/index`
    if (e.currentTarget.dataset.params) {
      url += `?${e.currentTarget.dataset.params}`
    }
    wx.navigateTo({
      url
    });
  },
});