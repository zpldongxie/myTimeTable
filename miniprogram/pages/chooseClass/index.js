const {
  callFunction,
  debounceAsync
} = require('../../utils.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    filteredSchools: [], // 模糊搜索后的学校列表
    showSchoolDropdown: false, // 是否显示下拉框
    scrollIntoView: "", // 滚动到指定位置
    selectedSchool: {}, // 选中的学校
    showGrade: false, // 是否显示年级选择
    grades: [], // 所有年级
    selectedGrade: "", // 选中的年级
    selectedGradeIndex: 0 // 选中的年级索引
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 对学校查询做防抖处理
    this.debouncedFindSchool = debounceAsync(this.filterSchool, 500);
    this.setData({
      openId: options.openId,
      grades: ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级", "七年级", "八年级", "九年级"],
    })
  },

  jumpPage(e) {
    let url = `/pages/${e.currentTarget.dataset.page}/index?openId=${this.data.openId}`
    if (e.currentTarget.dataset.params) {
      url += `&${e.currentTarget.dataset.params}`
    }
    wx.navigateTo({
      url
    });
  },

  /** 按学校名称模糊查找 */
  async filterSchool(name) {
    if (!name) {
      return [];
    }
    return callFunction('schools', {
      method: 'filter',
      name,
    }).then(function(res) {
      if (res.errMsg !== "cloud.callFunction:ok") {
        console.error(res.errMsg);
        return [];
      }
      if (res.result.errMsg !== 'collection.get:ok') {
        console.error(res.result.errMsg);
        return [];
      }
      return res.result.data;
    }).catch(function(e) {
      console.error(e)
      return [];
    });
  },

  /** 学校名称输入 */
  handleInput(e) {
    const inputValue = e.detail.value.trim(); // 获取输入框的值并去除首尾空格
    this.debouncedFindSchool(inputValue).then(result => {
      this.setData({
        filteredSchools: result,
        showSchoolDropdown: inputValue !== "", // 输入框有值时显示下拉框
        scrollIntoView: "", // 清空滚动位置
        showGrade: false,
      });
    }).catch(error => {
      console.error(error); // 处理异步函数的错误
      this.setData({
        filteredSchools: [],
        showSchoolDropdown: inputValue !== "", // 输入框有值时显示下拉框
        scrollIntoView: "", // 清空滚动位置
        showGrade: false,
      });
    });
  },

  /** 选择学校 */
  handleSelect(e) {
    console.log(e);
    const selectedSchool = e.currentTarget.dataset.school; // 获取选中的学校
    console.log("选中的学校：" + selectedSchool._id);
    this.setData({
      filteredSchools: [],
      showSchoolDropdown: false, // 隐藏下拉框
      scrollIntoView: "", // 清空滚动位置
      selectedSchool,
      showGrade: true,
    });
  },

  /** 选择年级 */
  handleGradeChange(e) {
    const selectedGradeIndex = e.detail.value; // 获取选中的年级索引
    this.setData({
      selectedGradeIndex: selectedGradeIndex // 更新选中的年级索引
    });
    // TODO: 处理选中年级的逻辑
    console.log("选中的年级：" + this.data.grades[selectedGradeIndex]);
  }
})