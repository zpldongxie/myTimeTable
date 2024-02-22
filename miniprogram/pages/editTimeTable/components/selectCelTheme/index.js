// pages/editTimeTable/components/selectCelTheme/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: { // 是否显示
      type: Boolean,
      value: false
    },
    otherData: { // 附带信息
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    themes: [{
      fontColor: '#eee',
      bgColor: '#547095b3',
    },{
      fontColor: '#eee',
      bgColor: '#f58590',
    }, {
      fontColor: '#eee',
      bgColor: '#F59E0B',
    }, {
      fontColor: '#eee',
      bgColor: '#16A34A'
    }, {
      fontColor: '#eee',
      bgColor: '#0EA5E9'
    }, {
      fontColor: '#eee',
      bgColor: '#8B5CF6'
    }, {
      fontColor: '#eee',
      bgColor: '#EC4899'
    }, {
      fontColor: '#eee',
      bgColor: '#A17522'
    }, {
      fontColor: '#eee',
      bgColor: '#7E22CE'
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
      var myEventDetail = {
        data: this.data.currentTheme,
        otherData: this.properties.otherData
      } // detail对象，提供给事件监听函数
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