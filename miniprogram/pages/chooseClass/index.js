const {
  callFunction,
  debounceAsync,
  getGrades,
  setCurrentSchool,
  setCurrentGrade,
  setCurrentClass,
  getOpenId,
  getSchools,
  getClasses
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
    this.debouncedFindSchool = debounceAsync(getSchools, 500);
    getGrades().then(function (gradeList) {
      that.setData({
        gradeList,
        grades: gradeList.map(g => g.name),
        showIntoButton: false,
      })
    })
  },

  jumpPage(e) {
    // 创建班级必需先选好学校和年级
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
    // 进入课表时保存记录，下次用户可直接从首页进行跳转
    if (e.currentTarget.dataset.page === 'timeTable') {
      this.createUserRecord();
    }
    let url = `/pages/${e.currentTarget.dataset.page}/index`
    if (e.currentTarget.dataset.params) {
      url += `?${e.currentTarget.dataset.params}`
    }
    wx.navigateTo({
      url
    });
  },

  /** 记录用户选择，异步处理，若失败，最多下次进来还要选班级，不影响正常使用 */
  async createUserRecord() {
    const currentSchool = this.data.selectedSchool || {};
    const currentGrade = this.data.selectedGrade || {};
    const currentClass = this.data.selectedClass || {};
    const info = {
      schoolId: currentSchool._id,
      gradeCode: currentGrade.code,
      className: currentClass.name,
      openId: getOpenId()
    };
    if (!info.schoolId || !info.gradeCode || !info.className || !info.openId) {
      console.warn('用户信息不完整: ', info);
      return;
    }

    try {
      const res = await callFunction('users', {
        method: 'upsert',
        ...info,
      });
      if (res.errMsg !== 'cloud.callFunction:ok') {
        console.warn('云函数调用异常。');
        console.warn(res.errMsg);
        return;
      }
      if (res.result.errCode || (res.result.errMsg !== 'collection.add:ok' && res.result.errMsg !== 'document.update:ok')) {
        console.warn('数据库操作异常。');
        console.warn(res.result);
        return;
      }
      return res.result;
    } catch (e) {
      // 判断异常类型
      if (e.errMsg && e.errMsg.includes('-502001')) {
        // 处理唯一索引约束的异常
        console.warn('插入记录失败，已存在重复数据');
      } else {
        // 处理其他异常
        console.warn('插入记录失败：', e);
      }
    }
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
    getClasses({
      schoolId: this.data.selectedSchool._id,
      gradeCode: this.data.selectedGrade?.code
    }).then((value) => {
      that.setData({
        classList: value,
        classes: value.map(v => v.name),
        showIntoButton: false
      })
    })
  },

  /** 选择班级 */
  handleClassChange(e) {
    const selectedClassIndex = e.detail.value; // 获取选中的年级索引
    const selectedClass = this.data.classList.find(g => g.name === this.data.classes[selectedClassIndex]) || null;
    setCurrentClass(selectedClass);
    this.setData({
      selectedClass,
      selectedClassIndex,
      showIntoButton: true
    });
  }
})