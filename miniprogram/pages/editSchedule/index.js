const {
  getCurrentUser,
  callFunction,
  getCurrentClass,
  getOpenId,
  getTimetable,
  upsertTimetable,
  getBG
} = require('../../utils')

// pages/editSchedule/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    dataList: [], // 显示的作息时间表
    editData: [], // 当前正在编辑的作自信
    timeTable: null, // 课表信息
    createInfo: {
      name: '', // 名称
      hasCourse: true, // 是否排课
      selectedIndex: 0 // 辅助字段，记录下拉框选择索引
    }, // 创建组件中的内容
    bgImg: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this
    const classId = getCurrentClass()?._id
    if (classId) {
      getTimetable({
        classId
      }).then(res => {
        const { schedules, timeTable } = res || {
          schedules: null,
          timeTable: null
        }
        that.setData({
          bgImg: getBG(),
          dataList: schedules?.data || [],
          timeTable: timeTable?.dataset || null
        })
      })
    } else {
      wx.showToast({
        title: '请先选择班级',
        icon: 'none'
      })
      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/chooseClass/index`
        })
      }, 1000)
    }
  },

  /** 编辑名称 */
  handleInputEditData(e) {
    const { editData } = this.data
    const inputValue = e.detail.value.trim() // 获取输入框的值并去除首尾空格
    editData[0] = inputValue
    this.setData({
      editData
    })
  },

  /** 编辑是否排课 */
  handleChangeEditData(e) {
    const { editData } = this.data
    const index = e.detail.value
    const courses = [true, false]
    editData[1] = courses[index]
    this.setData({
      editData
    })
  },

  /** 提交修改 */
  handleEditOk() {
    const { dataList, editData } = this.data
    if (editData[1]) {
      // 若是排课的节次，需要给课表做对应的结构初始化
      const { timeTable } = this.data
      const newTimeTable = timeTable || {}
      const oldName = dataList[editData[2]][0]
      const newName = editData[0]
      console.log('oldName: ', oldName)
      console.log('newName: ', newName)
      if (oldName === newName) {
        newTimeTable[newName] = newTimeTable[newName] || [{}, {}, {}, {}, {}]
      } else {
        newTimeTable[newName] = newTimeTable[oldName] || newTimeTable[newName] || [{}, {}, {}, {}, {}]
        delete newTimeTable[oldName]
      }
      upsertTimetable(newTimeTable)
      this.setData({
        timeTable: newTimeTable
      })
    }
    dataList[editData[2]] = [editData[0] || dataList[editData[2]][0], editData[1]]
    this.setData({
      dataList,
      editData: []
    })
    this.upsertSchedule()
  },

  /** 取消修改 */
  handleEditCancel() {
    this.setData({ editData: [] })
  },

  /** 输入名称 */
  handleInput(e) {
    const inputValue = e.detail.value.trim() // 获取输入框的值并去除首尾空格
    this.setData({
      createInfo: {
        ...this.data.createInfo,
        name: inputValue
      }
    })
  },

  /** 选择是否排课 */
  handleChange(e) {
    const index = e.detail.value
    const courses = [true, false]
    this.setData({
      createInfo: {
        ...this.data.createInfo,
        hasCourse: courses[index],
        selectedIndex: index
      }
    })
  },

  /** 点击创建 */
  handleCreate() {
    if (!this.data.createInfo.name) {
      wx.showToast({
        title: '请填写作息名称',
        icon: 'none'
      })
      return
    }
    const data = this.data.dataList
    data.push([this.data.createInfo.name, this.data.createInfo.hasCourse])
    if (this.data.createInfo.hasCourse) {
      // 若是排课的节次，需要给课表做对应的结构初始化
      const { timeTable } = this.data
      const newTimeTable = timeTable || {}
      newTimeTable[this.data.createInfo.name] = [{}, {}, {}, {}, {}]
      upsertTimetable(newTimeTable)
      this.setData({
        timeTable: newTimeTable
      })
    }
    this.setData({
      dataList: data,
      createInfo: {
        ...this.data.createInfo,
        name: ''
      }
    })
    this.upsertSchedule()
  },

  /** 点击上移 */
  async handUp(index) {
    const { dataList } = this.data
    if (index != 0) {
      const temp = dataList[index - 1]
      dataList[index - 1] = dataList[index]
      dataList[index] = temp
      this.setData({
        dataList,
        editIndex: null
      })
      wx.showLoading()
      await this.upsertSchedule()
      wx.hideLoading()
    }
  },

  /** 点击下移 */
  async handDown(index) {
    const { dataList } = this.data
    if (index != 0) {
      const temp = dataList[index + 1]
      dataList[index + 1] = dataList[index]
      dataList[index] = temp
      this.setData({
        dataList,
        editIndex: null
      })
      wx.showLoading()
      await this.upsertSchedule()
      wx.hideLoading()
    }
  },

  /** 点击删除 */
  async handleDel(index) {
    const { dataList } = this.data
    const cutData = dataList.splice(index, 1)
    this.setData({
      dataList,
      editIndex: null
    })
    wx.showLoading()
    const { timeTable } = this.data
    if (cutData[0][1] && timeTable) {
      delete timeTable[cutData[0][0]]
      upsertTimetable(timeTable)
    }
    await this.upsertSchedule()
    wx.hideLoading()
  },

  /** 操作下拉框 */
  optionChange(e) {
    const optionIndex = e.target.dataset.index
    const optionValue = e.detail.value
    switch (optionValue) {
      case '0':
        console.log('上移第' + optionIndex + '条')
        this.handUp(optionIndex)
        break
      case '1':
        console.log('下移第' + optionIndex + '条')
        this.handDown(optionIndex)
        break
      case '2': {
        console.log('插入第' + optionIndex + '条')
        const { dataList } = this.data
        dataList.splice(optionIndex, 0, ['未命名', false])
        this.setData({ editData: ['未命名', false, optionIndex], dataList })
        break
      }
      case '3': {
        console.log('修改第' + optionIndex + '条')
        const { dataList } = this.data
        this.setData({ editData: [dataList[optionIndex][0], dataList[optionIndex][1], optionIndex] })
        break
      }
      case '4':
        console.log('删除第' + optionIndex + '条')
        this.handleDel(optionIndex)
        break

      default:
        break
    }
  },

  /** 显示示例 */
  shwoEg() {
    wx.previewImage({
      current: 'cloud://cloud1-8ggb0v441269ef28.636c-cloud1-8ggb0v441269ef28-1319420876/schedule_eg.jpg',
      urls: ['cloud://cloud1-8ggb0v441269ef28.636c-cloud1-8ggb0v441269ef28-1319420876/schedule_eg.jpg']
    })
  },

  /** 创建或更新记录 */
  async upsertSchedule() {
    const info = {
      classId: getCurrentClass()?._id,
      data: this.data.dataList,
      creator: getOpenId(),
      creatorUser: getCurrentUser()
    }
    try {
      const res = await callFunction('schedules', {
        method: 'upsert',
        ...info
      })
      if (res.errMsg !== 'cloud.callFunction:ok') {
        console.error('云函数调用异常。')
        console.error(res.errMsg)
        wx.showToast({
          title: '好像没有保存成功，请过一会再试试',
          icon: 'none'
        })
        return
      }
      if (
        res.result.errCode ||
        (res.result.errMsg !== 'collection.add:ok' && res.result.errMsg !== 'document.update:ok')
      ) {
        console.error('数据库操作异常。')
        console.error(res.result)
        wx.showToast({
          title: '好像没有保存成功，请过一会再试试',
          icon: 'none'
        })
        return
      }
    } catch (e) {
      console.error('保存失败：', e)
    }
  },

  jumpToEditTimeTable() {
    wx.navigateTo({
      url: '/pages/editTimeTable/index'
    })
  }
})
