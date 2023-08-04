// pages/timeTable/index.js
const {
  analysisRes,
  getCurrentClass,
  callFunction,
  getOpenId,
  getTimetable
} = require("../../utils");

Page({
  data: {
    days: ['星期一', '星期二', '星期三', '星期四', '星期五'],
    currentClass: null,
    isReday: false, // 是否完成数据请求
    schedule: [], // 作息数据
    timetable: null, // 课表数据
    isCreator: false, // 是否为创建者
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  },

  onShow() {
    const that = this;
    const currentOpenId = getOpenId();
    const currentClass = getCurrentClass();
    console.log('currentClass: ', currentClass);
    this.setData({
      currentClass,
    })
    getTimetable({classId: currentClass._id}).then(res => {
      const {
        schedules,
        timeTable
      } = res || {
        schedules: null,
        timeTable: null,
      };
      console.log(timeTable);
      that.setData({
        isReday: true,
        schedule: schedules?.data,
        timetable: timeTable?.data,
        isCreator: schedules?.creator === currentOpenId
      })
    });
  },

  /** 分享好友 */
  onShare() {
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