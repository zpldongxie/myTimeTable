// components/dualContainer/index.js
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    topHeight: 50,
    bottomHeight: 50,
    startY: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTouchStart: function (e) {
      this.setData({
        startY: e.touches[0].clientY
      });
    },
    onTouchEnd: function (e) {
      const {
        startY
      } = this.data;
      const {
        clientY
      } = e.changedTouches[0];
      const diffY = clientY - startY;
      const windowHeight = wx.getSystemInfoSync().windowHeight;
      if (diffY < 0) {
        // 上滑操作
        console.log('上滑操作');
        if (this.data.dividerY !== 0 && this.data.topHeight === 80) {
          this.setData({
            topHeight: 50,
            bottomHeight: 50,
            dividerY: 0
          });
        } else {
          this.setData({
            topHeight: 20,
            bottomHeight: 80,
            dividerY: windowHeight * 0.2 - windowHeight * 0.5
          });
        }
      } else {
        console.log('下滑操作');
        if (this.data.dividerY !== 0 && this.data.topHeight === 20) {
          this.setData({
            topHeight: 50,
            bottomHeight: 50,
            dividerY: 0
          });
        } else {
          this.setData({
            topHeight: 80,
            bottomHeight: 20,
            dividerY: windowHeight * 0.8 - windowHeight * 0.5
          });
        }
      }
    },
  }
})