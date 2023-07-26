// pages/editClass/index.js
const {
  callFunction,
  getCurrentSchool,
  getCurrentGrade,
  setCurrentClass,
  getOpenId
} = require('../../utils.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: null,
    currentSchool: null,
    currentGrade: null,
    name: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const openId = getOpenId();
    const currentSchool = getCurrentSchool();
    const currentGrade = getCurrentGrade();
    this.setData({
      openId,
      currentSchool,
      currentGrade,
    });
    switch (options.type) {
      case 'update':
        this.setData({
          type: '修改'
        })
        break;
      case 'del':
        this.setData({
          type: '删除'
        })

        break;
      case 'create':
        this.setData({
          type: '创建'
        })

      default:
        break;
    }
  },

  handleNameInput(e) {
    const inputValue = e.detail.value.trim();
    this.setData({
      name: inputValue
    })
  },

  /** 创建班级 */
  async createClass(info) {
    try {
      const res = await callFunction('classes', {
        method: 'create',
        ...info,
      });
      if (res.errMsg !== 'cloud.callFunction:ok') {
        console.error('云函数调用异常。');
        console.error(res.errMsg);
        wx.showToast({
          title: '好像没有创建成功，请过一会再试试',
          icon: 'none'
        })
        return;
      }
      if (res.result.errCode || res.result.errMsg !== 'collection.add:ok') {
        console.error('数据库操作异常。');
        console.error(res.result);
        wx.showToast({
          title: '好像没有创建成功，请过一会再试试',
          icon: 'none'
        })
        return;
      }
      wx.showToast({
        title: '创建成功',
        icon: 'success',
        duration: 1000
      })
      setTimeout(function () {
        wx.navigateBack();
      }, 1000);
      setCurrentClass({
        ...info,
        _id: res.result._id
      });
      return res.result._id;
    } catch (e) {
      // 判断异常类型
      if (e.errMsg && e.errMsg.includes('-502001')) {
        // 处理唯一索引约束的异常
        console.warn('插入记录失败，已存在重复数据');
        wx.showToast({
          title: '这个班级已经存在，不用再创建了。',
          icon: 'none'
        })
      } else {
        // 处理其他异常
        console.error('插入记录失败：', e);
      }
    }
  },

  /** 提交 */
  handleSubmit() {
    // 进行表单验证
    if (!this.data.name) {
      wx.showToast({
        title: '名称不能为空',
        icon: 'none'
      });
      return;
    }
    wx.showModal({
      title: '提示',
      content: '请确认信息无误',
      complete: (res) => {
        if (res.confirm) {
          this.createClass({
            name: this.data.name,
            schoolId: this.data.currentSchool._id,
            gradeCode: this.data.currentGrade.code,
            creator: this.data.openId,
          });
        }
      }
    })
  }
})