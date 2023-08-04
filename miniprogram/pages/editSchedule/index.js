const {
  getCurrentUser,
  callFunction,
  getCurrentClass,
  getOpenId,
  getTimetable,
  upsertTimetable,
} = require("../../utils");

// pages/editSchedule/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentData: [], // 显示的作息时间表
    timeTable: null, // 课表信息
    createInfo: {
      name: '', // 名称
      hasCourse: true, // 是否排课
      selectedIndex: 0, // 辅助字段，记录下拉框选择索引
    }, // 创建组件中的内容
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this;
    const classId = getCurrentClass()?._id
    if (classId) {
      getTimetable({
        classId
      }).then(res => {
        const {
          schedules,
          timeTable
        } = res || {
          schedules: null,
          timeTable: null,
        };
        that.setData({
          currentData: schedules?.data || [],
          timeTable: timeTable?.dataset || null
        })
      });
    } else {
      wx.showToast({
        title: '请先选择班级',
        icon: 'none'
      });
      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/chooseClass/index`,
        });
      }, 1000);
    }
  },

  /** 输入名称 */
  handleInput(e) {
    const inputValue = e.detail.value.trim(); // 获取输入框的值并去除首尾空格
    this.setData({
      createInfo: {
        ...this.data.createInfo,
        name: inputValue
      }
    });
  },

  /** 选择是否排课 */
  handleChange(e) {
    const index = e.detail.value;
    const courses = [true, false];
    this.setData({
      createInfo: {
        ...this.data.createInfo,
        hasCourse: courses[index],
        selectedIndex: index,
      }
    });
  },

  /** 点击创建 */
  handleCreate() {
    if (!this.data.createInfo.name) {
      wx.showToast({
        title: '请填写作息名称',
        icon: 'none'
      });
      return;
    }
    const data = this.data.currentData;
    data.push([this.data.createInfo.name, this.data.createInfo.hasCourse]);
    if (this.data.createInfo.hasCourse) {
      // 若是排课的节次，需要给课表做对应的结构初始化
      const {
        timeTable
      } = this.data;
      timeTable[this.data.createInfo.name] = [{}, {}, {}, {}, {}];
      upsertTimetable(timeTable)
    }
    this.setData({
      currentData: data,
      createInfo: {
        ...this.data.createInfo,
        name: ''
      }
    });
    this.upsertSchedule();
  },

  /** 点击删除 */
  async handleDel(e) {
    const {
      index
    } = e.target.dataset;
    const currentData = this.data.currentData;
    const cutData = currentData.splice(index, 1);
    this.setData({
      currentData
    });
    wx.showLoading();
    const {
      timeTable
    } = this.data;
    if (cutData[0][1] && timeTable) {
      delete timeTable[cutData[0][0]];
      upsertTimetable(timeTable)
    }
    await this.upsertSchedule();
    wx.hideLoading();
  },

  /** 显示示例 */
  shwoEg() {
    wx.previewImage({
      current: 'cloud://cloud1-8ggb0v441269ef28.636c-cloud1-8ggb0v441269ef28-1319420876/schedule_eg.jpg',
      urls: ['cloud://cloud1-8ggb0v441269ef28.636c-cloud1-8ggb0v441269ef28-1319420876/schedule_eg.jpg'],
    });
  },

  /** 创建或更新记录 */
  async upsertSchedule() {
    const info = {
      classId: getCurrentClass()?._id,
      data: this.data.currentData,
      creator: getOpenId(),
      creatorUser: getCurrentUser(),
    };
    try {
      const res = await callFunction('schedules', {
        method: 'upsert',
        ...info,
      });
      if (res.errMsg !== 'cloud.callFunction:ok') {
        console.error('云函数调用异常。');
        console.error(res.errMsg);
        wx.showToast({
          title: '好像没有保存成功，请过一会再试试',
          icon: 'none'
        })
        return;
      }
      if (res.result.errCode || (res.result.errMsg !== 'collection.add:ok' && res.result.errMsg !== 'document.update:ok')) {
        console.error('数据库操作异常。');
        console.error(res.result);
        wx.showToast({
          title: '好像没有保存成功，请过一会再试试',
          icon: 'none'
        })
        return;
      }
    } catch (e) {
      console.error('保存失败：', e);
    }
  },

  jumpToEditTimeTable() {
    wx.navigateTo({
      url: '/pages/editTimeTable/index',
    })
  }
})