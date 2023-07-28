// pages/editSchool/index.js
const {
  callFunction,
  getOpenId,
  setCurrentSchool,
  getCurrentUser
} = require('../../utils.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    openId: '',
    type: '', // 操作类型，创建，修改，删除
    current: {
      id: '',
      name: '',
      address: ''
    }, // 当前学校，修改和删除时有效
    region: [],
    customItem: '全部'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      openId: getOpenId(),
    })
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

  /** 学校名 */
  handleNameInput(e) {
    const inputValue = e.detail.value.trim();
    this.setData({
      current: {
        ...this.data.current,
        name: inputValue
      }
    })
  },

  /** 学校地址 */
  bindRegionChange(e) {
    const inputValue = e.detail.value;
    this.setData({
      current: {
        ...this.data.current,
        address: inputValue.join(','),
      },
      region: inputValue
    })
  },

  /** 创建学校 */
  async createSchool(info) {
    try {
      const res = await callFunction('schools', {
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
      setCurrentSchool({
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
          title: '这个学校信息已经存在，不用再创建了。',
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
    if (!this.data.current.name) {
      wx.showToast({
        title: '请填写学校名称',
        icon: 'none'
      });
      return;
    }
    if (!this.data.current.address) {
      wx.showToast({
        title: '请填写学校地址',
        icon: 'none'
      });
      return;
    }
    wx.showModal({
      title: '提示',
      content: '请确认信息无误',
      complete: (res) => {
        if (res.confirm) {
          const userInfo = getCurrentUser();
          this.createSchool({
            name: this.data.current.name,
            address: this.data.current.address,
            creator: this.data.openId,
            creatorUser: userInfo,
          });
        }
      }
    })
  }
})