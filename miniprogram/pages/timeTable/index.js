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
    console.log('===', this.data.currentClass);
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
  }
});