const {
  getCurrentClass,
  getTimetable,
  upsertTimetable,
  getCourses,
  callFunction,
  analysisRes,
  debounceAsync
} = require('../../utils')

// pages/editTimeTable/index.js
Page({
  data: {
    days: ['星期一', '星期二', '星期三', '星期四', '星期五'],
    schedule: [], // 作息时间信息
    timetable: null, // 课表信息
    courses: [], // 课程信息，时刻与数据库保持同步
    currentCourse: null, // 正在排课的课程
    editCourse: {}, // 正在编辑的课程，同一时间只能有一个
    newCourse: {
      // 新增课程信息
      name: '',
      style: {
        fontColor: '#fff',
        bgColor: '#547095b3'
      }
    },
    shwoSelectTheme: false
  },

  onLoad() {
    const that = this
    // 对保存课表做防抖处理
    this.debouncedUpsertTimetable = debounceAsync(upsertTimetable, 500)

    const classId = getCurrentClass()?._id
    if (classId) {
      // 读取作息时间和课表
      getTimetable({
        classId
      }).then(res => {
        const { schedules, timeTable } = res || {
          schedules: null,
          timeTable: null
        }
        const data = {
          schedule: schedules?.data || [],
          timetable: timeTable?.dataset || null
        }
        if (schedules && !timeTable) {
          // 有作息时间，没有课表时，进行结构初始化
          const timetable = {}
          schedules.data
            .filter(s => s[1])
            .forEach(s => {
              timetable[s[0]] = [1, 2, 3, 4, 5].map(i => ({
                name: '-',
                style: {
                  fontColor: '#475569',
                  bgColor: 'rgba(225, 222, 255, 0.6)'
                }
              }))
            })
          data.timetable = timetable
        }
        that.setData(data)
      })
      // 读取课程
      getCourses({
        classId
      }).then(courses => {
        that.setData({
          courses
        })
        console.log('courses: ', courses)
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

  /** 更新当前编辑的课程 */
  updateEditCourse(_id) {
    const { courses } = this.data
    const course = courses.find(c => c._id === _id)
    this.setData({ editCourse: course || {} })
    return course || {}
  },

  /** 选择课程准备排课 */
  handleSelectCourse(e) {
    const _id = e.target.dataset.id
    const { currentCourse } = this.data
    if (_id === currentCourse?._id) {
      this.setData({
        currentCourse: null
      })
    } else {
      const course = this.data.courses.find(c => c._id === _id)
      this.setData({
        currentCourse: course
      })
    }
  },

  /** 设置课表 */
  setTimetable(e) {
    const { key, index } = e.currentTarget.dataset
    const { timetable, currentCourse } = this.data
    if (!currentCourse) {
      return
    }
    if (
      timetable[key][index].name === currentCourse.name &&
      timetable[key][index].style.fontColor === currentCourse.style.fontColor &&
      timetable[key][index].style.bgColor === currentCourse.style.bgColor
    ) {
      // 撤销排课信息
      timetable[key][index] = {
        name: '-',
        style: {
          fontColor: '#475569',
          bgColor: 'rgba(225, 222, 255, 0.6)'
        }
      }
    } else {
      timetable[key][index] = {
        ...currentCourse
      }
    }
    this.setData({
      timetable
    })
    this.debouncedUpsertTimetable(timetable)
  },

  /** 点击选择主题 */
  handleThemeClick(e) {
    const _id = e.target.dataset.id
    const { editCourse } = this.data
    if (_id) {
      if (editCourse._id != _id) {
        this.updateEditCourse(_id)
      }
      this.setData({
        shwoSelectTheme: true
      })
    } else {
      this.setData({
        shwoSelectTheme: true,
        editCourse: {}
      })
    }
  },

  /** 确定选择主题 */
  selectThemeOk(e) {
    const _id = e.detail.otherData
    console.log('_id: ', _id)
    const style = e.detail.data
    if (_id) {
      // update
      const { editCourse } = this.data
      let newEditCourse = editCourse
      if (editCourse._id != _id) {
        const course = this.updateEditCourse(_id)
        newEditCourse = { ...course }
      }
      // 更新编辑记录，若与原数据相同则置空
      if (style.bgColor === newEditCourse.style.bgColor && style.fontColor === newEditCourse.style.fontColor) {
        newEditCourse.style = null
      } else {
        newEditCourse.style = style
      }
      if (!newEditCourse.name && !newEditCourse.style) {
        this.setData({
          shwoSelectTheme: false,
          editCourse: {}
        })
      } else if (this.data.currentCourse && this.data.currentCourse._id === _id) {
        this.setData({
          shwoSelectTheme: false,
          currentCourse: null,
          editCourse: newEditCourse
        })
      } else {
        this.setData({
          shwoSelectTheme: false,
          editCourse: newEditCourse
        })
      }
    } else {
      this.setData({
        shwoSelectTheme: false,
        newCourse: {
          ...this.data.newCourse,
          style: e.detail.data
        }
      })
    }
  },

  /** 取消选择主题 */
  selectThemeCancel(e) {
    const { editCourse } = this.data
    if (!editCourse.name && !editCourse.style) {
      this.setData({ editCourse: {} })
    }
    this.setData({
      shwoSelectTheme: false
    })
  },

  /** 输入课程名称 */
  handleCourseName(e) {
    const inputValue = e.detail.value.trim() // 获取输入框的值并去除首尾空格
    const _id = e.target.dataset.id
    if (_id) {
      // update
      const { editCourse } = this.data
      let newEditCourse = editCourse
      if (editCourse._id != _id) {
        const course = this.updateEditCourse(_id)
        newEditCourse = { ...course }
      }
      // 更新编辑记录，若与原数据相同则置空
      newEditCourse.name = inputValue === newEditCourse.name ? null : inputValue
      if (!newEditCourse.name && !newEditCourse.style) {
        this.setData({
          shwoSelectTheme: false,
          editCourse: {}
        })
      } else if (this.data.currentCourse && this.data.currentCourse._id === _id) {
        this.setData({
          shwoSelectTheme: false,
          currentCourse: null,
          editCourse: newEditCourse
        })
      } else {
        this.setData({
          shwoSelectTheme: false,
          editCourse: newEditCourse
        })
      }
    } else {
      // create
      this.setData({
        newCourse: {
          ...this.data.newCourse,
          name: inputValue
        }
      })
    }
  },

  /** 点击新增课程 */
  async handleAddCourse() {
    if (!this.data.newCourse.name) {
      wx.showToast({
        title: '请填写课程名称',
        icon: 'none'
      })
      return
    }
    const _id = await this.createCourse(this.data.newCourse.name, this.data.newCourse.style)
    if (_id) {
      const courses = this.data.courses
      courses.push({
        ...this.data.newCourse,
        _id
      })
      this.setData({
        courses,
        newCourse: {
          name: '',
          style: {
            fontColor: '#fff',
            bgColor: '#547095b3'
          }
        }
      })
    }
  },

  /** 点击修改课程 */
  async handleEditCourse(e) {
    const _id = e.target.dataset.id
    const { editCourse } = this.data
    if (!editCourse || editCourse._id != _id) {
      return
    }
    const res = await this.updateCourse(_id, editCourse.name, editCourse.style)
    if (res) {
      const { courses } = this.data
      for (let i = 0; i < courses.length; i++) {
        const course = courses[i]
        if (course._id === _id) {
          this.uploadLocalTimetable(_id, editCourse.name, editCourse.style)
          course.name = editCourse.name || course.name
          course.style = editCourse.style || course.style
          break
        }
      }
      this.setData({ courses, editCourse: {} })
    }
  },

  /** 点击删除课程 */
  async handleDelCourse(e) {
    if (this.data.editCourse._id === e.target.dataset.id) {
      // 取消编辑
      this.setData({
        editCourse: {}
      })
    } else {
      wx.showModal({
        title: '确定删除吗',
        content: '',
        complete: async res => {
          if (res.confirm) {
            wx.showLoading()
            const res = await this.delCourse(e.target.dataset.id)
            if (res) {
              const courses = this.data.courses.filter(c => c._id !== e.target.dataset.id)
              this.setData({
                courses
              })
              // 同步删除课表相关信息
              this.uploadLocalTimetable(e.target.dataset.id)
            }
            if (this.data.currentCourse && this.data.currentCourse._id === e.target.dataset.id) {
              // 取消活动状态
              this.setData({
                currentCourse: null
              })
            }
            wx.hideLoading()
          }
        }
      })
    }
  },

  /** 按课程_id批量更新课表 */
  uploadLocalTimetable(_id, name, style) {
    const { timetable } = this.data
    if (!timetable) {
      return
    }
    Object.keys(timetable).forEach(key => {
      timetable[key].forEach((tt, i) => {
        if (tt._id === _id) {
          if (!name && !style) {
            // name和style都不传，代表删除
            timetable[key][i] = {
              name: '-',
              style: {
                fontColor: '#475569',
                bgColor: 'rgba(225, 222, 255, 0.6)'
              }
            }
          } else {
            tt.name = name || tt.name
            tt.style = style || tt.style
          }
        }
      })
    })
    this.setData({
      timetable
    })
    this.debouncedUpsertTimetable(timetable)
  },

  /** 创建课程 */
  async createCourse(name, style) {
    const info = {
      classId: getCurrentClass()?._id,
      name,
      style
    }
    try {
      const res = await callFunction('courses', {
        method: 'create',
        ...info
      })
      const data = analysisRes({
        res,
        messageType: 'collection.add',
        defaultValue: null
      })
      if (!data) {
        wx.showToast({
          title: '好像没有保存成功，请过一会再试试',
          icon: 'none'
        })
        return data
      }
      return data
    } catch (e) {
      // 判断异常类型
      if (e.errMsg && e.errMsg.includes('-502001')) {
        // 处理唯一索引约束的异常
        console.warn('保存失败，已存在重复数据')
        wx.showToast({
          title: '课程名称不能重复',
          icon: 'none'
        })
      } else {
        // 处理其他异常
        console.warn('保存失败：', e)
      }
      return null
    }
  },

  /** 更新课程 */
  async updateCourse(_id, name, style) {
    const info = {
      _id,
      name,
      style
    }
    try {
      const res = await callFunction('courses', {
        method: 'update',
        ...info
      })
      const data = analysisRes({
        res,
        messageType: 'document.update',
        defaultValue: false
      })
      if (!data) {
        wx.showToast({
          title: '好像没有保存成功，请过一会再试试',
          icon: 'none'
        })
        return data
      }
      return true
    } catch (e) {
      // 判断异常类型
      if (e.errMsg && e.errMsg.includes('-502001')) {
        // 处理唯一索引约束的异常
        console.warn('保存失败，已存在重复数据')
        wx.showToast({
          title: '课程名称不能重复',
          icon: 'none'
        })
      } else {
        // 处理其他异常
        console.warn('保存失败：', e)
      }
      return false
    }
  },

  /** 删除课程 */
  async delCourse(_id) {
    if (!_id) {
      console.error('缺少参数_id')
      wx.showToast({
        title: '好像没有删除成功，请过一会再试试',
        icon: 'none'
      })
      return false
    }
    try {
      const res = await callFunction('courses', {
        method: 'del',
        _id
      })
      const data = analysisRes({
        res,
        messageType: 'document.remove',
        defaultValue: false
      })
      if (!data) {
        wx.showToast({
          title: '好像没有删除成功，请过一会再试试',
          icon: 'none'
        })
        return data
      }
      return true
    } catch (e) {
      console.warn('保存失败：', e)
      return false
    }
  },

  /** 显示示例 */
  shwoEg() {
    wx.showModal({
      title: '查看演示',
      content: '预览动图大小约25M，请注意流量。',
      complete: res => {
        if (res.confirm) {
          wx.previewImage({
            current: 'cloud://cloud1-8ggb0v441269ef28.636c-cloud1-8ggb0v441269ef28-1319420876/paiKeYanShi.gif',
            urls: ['cloud://cloud1-8ggb0v441269ef28.636c-cloud1-8ggb0v441269ef28-1319420876/paiKeYanShi.gif']
          })
        }
      }
    })
  },

  jumpPage(e) {
    let url = `/pages/${e.currentTarget.dataset.page}/index`
    wx.navigateTo({
      url
    })
  }
})
