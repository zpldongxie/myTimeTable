const {
  callFunction,
  setOpenId,
  setCurrentSchool,
  setCurrentGrade,
  getSchoolById,
  getGradeByCode,
  getClass,
  setCurrentClass
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
    const that = this;
    callFunction('getOpenId').then((resp) => {
      if (resp.errMsg !== "cloud.callFunction:ok") {
        wx.showToast({
          title: '登录信息异常，请稍后打开重试',
          icon: 'none'
        });
        return null
      }
      setOpenId(resp.result.openid);
      this.setData({
        openId: resp.result.openid
      });
      return callFunction('users', {
        method: 'get',
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
      if (resp.result.data.length) {
        // 有用户登录记录
        const userInfo = resp.result.data[0];
        getSchoolById(userInfo.schoolId).then(res => {
          if (res) {
            // 保存当前学校信息
            setCurrentSchool(res);
            return {};
          }
          return {
            errCode: 1,
            errMsg: '您上次进入的学校已被删除，请重新选择或创建学校和班级。'
          };
        }).then(res => {
          if (res.errCode) {
            return res;
          }
          // 查年级
          return getGradeByCode(userInfo.gradeCode);
        }).then(res => {
          if (res.errCode) {
            return res;
          }
          if (res) {
            // 保存当前年级信息
            setCurrentGrade(res);
            return {};
          }
          return {
            errCode: 1,
            errMsg: null,
          };
        }).then(res => {
          if (res.errCode) {
            return res;
          }
          // 查班级
          return getClass({
            schoolId: userInfo.schoolId,
            gradeCode: userInfo.gradeCode,
            name: userInfo.className
          });
        }).then(res => {
          if (res.errCode) {
            return res;
          }
          if (res) {
            // 保存当前班级信息
            setCurrentClass(res);
            return {};
          }
          return {
            errCode: 1,
            errMsg: '您上次进入的班级已被删除，请重新选择或创建班级。',
          };
        }).then(res => {
          if (res.errCode) {
            return that.gotoChoosePage(res.errMsg);
          }
          if (res) {
            return that.gotoTimeTablePage();
          }
          that.gotoChoosePage();
        })
      } else {
        // 无用户登录记录
        that.gotoChoosePage();
      }
    }).catch((e) => {
      console.error(e);
      wx.showToast({
        title: '系统错误，请联系管理员',
        icon: 'none'
      });
    });
  },

  /** 跳转到班级选择页 */
  gotoChoosePage(msg) {
    if (msg) {
      wx.showToast({
        title: msg,
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateTo({
          url: `/pages/chooseClass/index?openId=${this.data.openId}`,
        });
      }, 2000);
    } else {
      wx.navigateTo({
        url: `/pages/chooseClass/index?openId=${this.data.openId}`,
      });
    }
  },

  /** 跳转到课表页 */
  gotoTimeTablePage() {
    wx.navigateTo({
      url: `/pages/timeTable/index`,
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