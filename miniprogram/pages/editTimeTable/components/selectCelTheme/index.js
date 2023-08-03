// pages/editTimeTable/components/selectCelTheme/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    themes: [{
      fontColor: '#eee',
      bgColor: '#547095b3',
    }, {
      fontColor: '#eee',
      bgColor: '#4590d0',
    }, {
      fontColor: '#eee',
      bgColor: '#ce0800'
    }, {
      fontColor: '#eee',
      bgColor: '#949f00'
    }, {
      fontColor: '#eee',
      bgColor: '#09bb07'
    }, {
      fontColor: '#eee',
      bgColor: '#f7ad00'
    }, {
      fontColor: '#eee',
      bgColor: '#b6664f'
    }, {
      fontColor: '#eee',
      bgColor: '#981b78'
    }, {
      fontColor: '#eee',
      bgColor: '#f45c00'
    }], // 课表单元格样式 
    index: 0,
    currentTheme: {
      fontColor: '#eee',
      bgColor: '#547095b3',
    },
    bottom: '-100vh', // 控制显示位置
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSelectChange: function (e) {
      const index = e.detail.value[0];
      this.setData({
        index: [index],
        currentTheme: this.data.themes[index]
      });
    },
    onOk: function () {
      var myEventDetail = this.data.currentTheme // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('onOk', myEventDetail, myEventOption)
    },
    onCancel: function () {
      this.triggerEvent('onCancel', {}, {})
    },
    onBackCon: function (e) {
      if (e.target.dataset.class === "backCon") {
        this.triggerEvent('onCancel', {}, {})
      }
    }
  },
  observers: {
    'show': function (show) {
      const that = this;
      // 监听显示隐藏属性，设置动画显示效果
      if (show) {
        setTimeout(() => {
          that.setData({
            bottom: '0'
          })
        }, 0);
      } else {
        this.setData({
          bottom: '-100vh'
        })
      }
    }
  }
})