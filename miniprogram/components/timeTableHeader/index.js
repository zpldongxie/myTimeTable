// components/timeTableHeader/index.js
const {
  getCurrentSchool,
  getCurrentGrade,
  getCurrentClass,
} = require("../../utils");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type: {
      type: String,
      value: '课程表'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentSchool: null,
    currentGrade: null,
    currentClass: null,
  },

  lifetimes: {
    attached() {
      this.setData({
        currentSchool: getCurrentSchool(),
        currentGrade: getCurrentGrade(),
        currentClass: getCurrentClass(),
      })
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})