const {
  callFunction,
  debounceAsync,
  getGrades,
  setCurrentSchool,
  setCurrentGrade,
  setCurrentClass
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
    gradeList: [], // 所有年级
    selectedGrade: null, // 选中的年级
    grades: [], // 所有年级，下拉框数据
    selectedGradeIndex: -1, // 选中的年级索引
    classList: [], // 所有班级
    selectedClass: null, // 选中的班级
    classes: [], // 所有班级，下拉框数据
    selectedClassIndex: -1, // 选中的班级索引
    showIntoButton: false, // 显示跳转课表页按钮
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this;
    // 对学校查询做防抖处理
    this.debouncedFindSchool = debounceAsync(this.filterSchool, 500);
    getGrades().then(function (gradeList) {
      that.setData({
        gradeList,
        grades: gradeList.map(g => g.name),
        showIntoButton: false,
      })
    })
  },

  jumpPage(e) {
    if (e.currentTarget.dataset.page === 'editClass') {
      if (!this.data.selectedSchool._id || !this.data.selectedGrade) {
        wx.showToast({
          title: '请先选择学校和年级，否则我不知道该把班级加到哪里。',
          icon: 'none',
          duration: 3000
        })
        return;
      }
    }
    let url = `/pages/${e.currentTarget.dataset.page}/index`
    if (e.currentTarget.dataset.params) {
      url += `?${e.currentTarget.dataset.params}`
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

  /** 按学校和年级查找班级列表 */
  async getClasses() {
    if (!this.data.selectedSchool._id) {
      console.error('没有学校_id');
      return [];
    }
    if (!this.data.selectedGrade) {
      console.error('没有年级Code');
      return [];
    }
    return callFunction('classes', {
      method: 'get',
      schoolId: this.data.selectedSchool._id,
      gradeCode: this.data.selectedGrade.code,
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
    const that = this;
    const inputValue = e.detail.value.trim(); // 获取输入框的值并去除首尾空格
    this.debouncedFindSchool(inputValue).then(result => {
      that.setData({
        filteredSchools: result,
        showSchoolDropdown: inputValue !== "", // 输入框有值时显示下拉框
        scrollIntoView: "", // 清空滚动位置
        selectedGrade: null,
        selectedGradeIndex: -1,
        selectedClass: null,
        selectedClassIndex: -1,
        showIntoButton: false
      });
    }).catch(error => {
      console.error(error); // 处理异步函数的错误
      that.setData({
        filteredSchools: [],
        showSchoolDropdown: inputValue !== "", // 输入框有值时显示下拉框
        scrollIntoView: "", // 清空滚动位置
        selectedGrade: null,
        selectedGradeIndex: -1,
        selectedClass: null,
        selectedClassIndex: -1,
        showIntoButton: false
      });
    });
  },

  /** 选择学校 */
  handleSelect(e) {
    const selectedSchool = e.currentTarget.dataset.school; // 获取选中的学校
    setCurrentSchool(selectedSchool);
    console.log("选中的学校：" + selectedSchool._id);
    this.setData({
      filteredSchools: [],
      showSchoolDropdown: false, // 隐藏下拉框
      scrollIntoView: "", // 清空滚动位置
      selectedSchool,
      selectedGrade: null,
      selectedGradeIndex: -1,
      selectedClass: null,
      selectedClassIndex: -1,
      showIntoButton: false
    });
  },

  /** 选择年级 */
  handleGradeChange(e) {
    const that = this;
    const selectedGradeIndex = e.detail.value; // 获取选中的年级索引
    const selectedGrade = this.data.gradeList.find(g => g.name === this.data.grades[selectedGradeIndex]) || null;
    setCurrentGrade(selectedGrade);
    this.setData({
      selectedGrade,
      selectedGradeIndex, // 更新选中的年级索引
      selectedClass: null,
      selectedClassIndex: -1,
      showIntoButton: false
    });
    this.getClasses().then((value) => {
      console.log('value: ', value);
      that.setData({
        classList: value,
        classes: value.map(v => v.name),
        showIntoButton: false
      })
    })
  },

  /** 选择班级 */
  handleClassChange(e) {
    const that = this;
    const selectedClassIndex = e.detail.value; // 获取选中的年级索引
    const selectedClass = this.data.classList.find(g => g.name === this.data.grades[selectedClassIndex]) || null;
    setCurrentClass(selectedClass);
    this.setData({
      selectedClass: selectedClass,
      selectedClassIndex,
      showIntoButton: true
    });
  }
})