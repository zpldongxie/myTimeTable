const { setCurrentUser, getCurrentUser } = require('../../utils');

// components/getUserInfoBtn/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    text: {
      type: String,
      value: '获取用户信息',
    }, // 按钮文本
    tips: {
      type: String,
      value: '我们想知道是谁在为大家做贡献',
    }, // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写，不超过30个字符
    failTips: {
      type: String,
      value: '必须获得授权才能进行下一步操作',
    }, // 被拒绝授权后，提示什么信息
    className: String,
    force: {
      type: Boolean,
      value: false,
    }, // 是否强制获取用户信息不显示提示
    type: {
      type: String,
      value: 'default',
    },
    size: {
      type: String,
      value: 'default',
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    canIUseGetUserProfile: false,
    hasUserInfo: false,
  },

  lifetimes: {
    attached() {
      if (wx.getUserProfile) {
        this.setData({
          canIUseGetUserProfile: true,
        });
      }
      if (getCurrentUser()) {
        this.setData({
          hasUserInfo: true,
        });
      }
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getUserProfile: function (e) {
      const that = this;
      console.log('that.properties.tips: ', that.properties.tips);
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
      // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: that.properties.tips, // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: function (res) {
          // 放到全局用户信息中
          setCurrentUser(res.userInfo);
          // 调用传入的回调方法
          that.triggerEvent('callback');
        },
        fail: function (e) {
          console.warn('用户拒绝授权', e);
          wx.showToast({
            title: that.properties.failTips,
            icon: 'none',
          });
        },
      });
    },
    getUserInfo: function (e) {
      // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
      if (e.detail.userInfo) {
        // 放到全局用户信息中
        setCurrentUser(e.detail.userInfo);
        // 调用传入的回调方法
        this.triggerEvent('callback');
      }
    },
    doCallback: function () {
      // 已经存在用户信息时，直接调用传入的回调方法
      this.triggerEvent('callback');
    },
  },
});
