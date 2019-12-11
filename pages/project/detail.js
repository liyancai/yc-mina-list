const app = getApp()
const canvasUtil = require('../../utils/canvas.js')
const accountServUtil = require('../../service/AccountService.js')
const projectServUtil = require('../../service/ProjectService.js')
const { $Message } = require('../../components/iview/base/index');

Page({
  data: {
    inputValue: '',
    projectId: '',
    project: null,
    memberMap: {},
    todoTaskList: [],
    doneTaskList: [],
    isMember: true,
    placardVisible: false,
    avatar_temp: '/images/icon/christmas_star.png'
  },
  onLoad: function (options) {

    let _projectId = options.projectId

    if (_projectId == null || _projectId == undefined) {
      //todo 无数据页
      return
    }

    _projectId += ''
    this.setData({
      projectId: _projectId
    })

    this.getProjectInfo(_projectId)
    this.getTodoTaskList(_projectId)
    this.getDoneTaskList(_projectId)
  },
  showProjectOptModal() {

    let _project = this.data.project

    let that = this
    wx.showActionSheet({
      itemList: [
        '个性设置',
        '将清单归档',
        '删除清单',
        '生成海报图片',
      ],
      success(res) {
        if (res.tapIndex == 0) {
          that.gotoModify()
        } else if (res.tapIndex == 1) {
          that.doDoneProject(_project)
        } else if (res.tapIndex == 2) {
          that.doRemoveProject(_project)
        } else if (res.tapIndex == 3) {
          that.openCanvasView()
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  // 打开task的操作列表
  showTaskOptModal(event) {
    let _task = event.currentTarget.dataset.task
    let _index = event.currentTarget.dataset.index

    let that = this
    wx.showActionSheet({
      itemList: [
        '删除任务'
      ],
      success(res) {
        if(res.tapIndex == 0) {

          if(_task.done) {
            that.data.doneTaskList.splice(_index, 1)

            that.setData({
              doneTaskList: that.data.doneTaskList
            })
          } else {
            that.data.todoTaskList.splice(_index, 1)

            that.setData({
              todoTaskList: that.data.todoTaskList
            })
          }

          that.doRemoveTask(_task._id)
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  // 查询清单信息
  getProjectInfo(__projectId) {
    let that = this
    wx.showNavigationBarLoading()
    projectServUtil.getInfo(__projectId, res => {
      that.setData({
        project: res
      })

      setTimeout(_ => {
        if (app.globalData.userInfo != null && app.globalData.userInfo != undefined) {
          that.setData({
            isMember: res.members.indexOf(app.globalData.userInfo._id) > -1
          })
        }
      }, 300)

      accountServUtil.getList(res.members, res => {
        let _map = {}
        res.forEach(v => {
          _map[v._id] = v
        })
        
        that.setData({
          memberMap: _map
        })
      })

      if(res.cover == null || res.cover == undefined || res.cover == '') {
        that.setMainColor(res.color)
      }

      wx.hideNavigationBarLoading()
    })
  },
  // 查询清单下的未完成任务列表
  getTodoTaskList(__projectId) {
    let that = this
    // 调用task-list云函数请求
    wx.cloud.callFunction({
      name: 'task-list',
      data: {
        projectId: __projectId,
        done: false
      }
    })
    .then(res => {
      that.setData({
        todoTaskList: res.result ? res.result.data : []
      })
    })
    .catch(err => {
      console.error(err)
    })
  },
  // 查询清单下的已完成任务列表
  getDoneTaskList(__projectId) {
    let that = this
    // 调用task-list云函数请求
    wx.cloud.callFunction({
      name: 'task-list',
      data: {
        projectId: __projectId,
        done: true
      }
    })
    .then(res => {
      that.setData({
        doneTaskList: res.result ? res.result.data : []
      })
    })
    .catch(err => {
      console.error(err)
    })
  },
  // 添加待办任务
  addTask(event) {
    if(this.data.project == null) {
      return
    }

    let _projectId = this.data.projectId
    let _title = event.detail.value.trim()

    if (_title == "") {
      $Message({
        content: '内容不能为空哦~',
        type: 'warning'
      });
      return
    }

    let that = this
    // 调用添加task的云函数请求
    wx.showLoading({ title: '正在添加···' })
    wx.cloud.callFunction({
      name: 'task-add',
      data: {
        projectId: _projectId,
        title: _title
      }
    })
    .then(res => {
      wx.hideLoading()
      if (res.result && res.result._id) {
        // 添加新task成功后，将对象添加到todoTaskList的开头
        that.data.todoTaskList.unshift({
          _id: res.result._id,
          author: app.globalData.userInfo == null ? '' : app.globalData.userInfo._id,
          projectId: _projectId,
          title: _title,
          done: false,
        })

        that.setData({
          inputValue: '',
          todoTaskList: that.data.todoTaskList
        })
      } else if (res.result && res.result.errCode && res.result.errCode == 87014) {
        $Message({
          content: '请正确录入待办任务！',
          type: 'error'
        });
      } else {
        $Message({
          content: '更新失败，请稍候重试~',
          type: 'error'
        });
      }
    })
    .catch(err => {
      wx.hideLoading()
      console.error(err)
    })
  },
  doneTask(event) {
    let _taskId = event.currentTarget.dataset.taskId
    let _index = event.currentTarget.dataset.index
    this.doModifyTask('done', _index, _taskId)
  },
  undoneTask(event) {
    let _taskId = event.currentTarget.dataset.taskId
    let _index = event.currentTarget.dataset.index
    this.doModifyTask('undone', _index, _taskId)
  },
  // 编辑任务
  doModifyTask(__action, __index, __taskId, __title) {

    let _projectId = this.data.projectId

    let that = this
    wx.showLoading({ title: '请稍候···' })
    wx.cloud.callFunction({
      name: 'task-modify',
      data: {
        action: __action,
        taskId: __taskId,
        title: __title,
      }
    })
    .then(res => {
      if(__action == 'done') {
        that.data.todoTaskList.splice(__index, 1)

        that.setData({
          todoTaskList: that.data.todoTaskList
        })
        that.getDoneTaskList(_projectId)
      } else if(__action == 'undone') {
        that.data.doneTaskList.splice(__index, 1)

        that.setData({
          doneTaskList: that.data.doneTaskList
        })
        that.getTodoTaskList(_projectId)
      }
      wx.hideLoading()
    })
    .catch(err => {
      wx.hideLoading()
      console.error(err)
    })
  },
  // 归档清单
  doDoneProject(__project) {
    let that = this
    wx.showLoading({ title: '正在归档···' })
    wx.cloud.callFunction({
      name: 'project-modify',
      data: {
        action: 'done',
        projectId: __project._id,
      }
    })
    .then(res => {
      wx.hideLoading()
      that.gotoProjectList()
    })
    .catch(err => {
      wx.hideLoading()
      console.error(err)
    })
  },
  // 删除清单
  doRemoveProject(__project) {
    let that = this
    wx.showLoading({ title: '正在删除···' })
    wx.cloud.callFunction({
      name: 'project-remove',
      data: {
        project: __project,
      }
    })
    .then(res => {
      wx.hideLoading()
      wx.reLaunch({
        url: '/pages/project/list',
      })
    })
    .catch(err => {
      wx.hideLoading()
      console.error(err)
    })
  },
  // 删除任务
  doRemoveTask(__taskId) {
    wx.cloud.callFunction({
      name: 'task-remove',
      data: {
        taskId: __taskId,
      }
    })
    .then(res => {
    })
    .catch(err => {
      console.error(err)
    })
  },
  // 更改页面头部及上边区域的颜色，后续想修改为背景图
  setMainColor(__color) {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: __color,
    })
    wx.setBackgroundColor({
      backgroundColor: __color,
      backgroundColorTop: __color,
      backgroundColorBottom: __color,
    })
  },
  gotoProjectList() {
    wx.reLaunch({
      url: '/pages/project/list',
    })
  },
  gotoModify() {
    let that = this
    wx.redirectTo({
      url: '/pages/project/modify?projectId=' + this.data.projectId,
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    let _projectId = this.data.projectId

    this.getProjectInfo(_projectId)
    this.getTodoTaskList(_projectId)
    this.getDoneTaskList(_projectId)
  },
  openCanvasView() {
    let that = this

    that.drawPlacard()
    that.setData({
      placardVisible: true,
    })
  },
  closeCanvasView() {
    this.setData({
      placardVisible: false,
    })
  },
  drawPlacard: function () {
    var that = this

    var _sysInfo = wx.getSystemInfoSync()
    let _wWidth = _sysInfo.windowWidth
    let _cWidth = Math.round(_wWidth * .7), _cHeight = Math.round(_wWidth * 1.2)

    that.drawImage(_cWidth, _cHeight);
  },
  drawImage(__cWidth, __cHeight) {
    wx.showLoading({
      title: '生成海报···',
    })

    var that = this
    var _ctx = wx.createCanvasContext('project-placard')

    // 绘制白色背景
    _ctx.setFillStyle('#ffffff')
    canvasUtil.fillRadiusRect(_ctx, 0, 0, __cWidth, __cHeight, 3)
    _ctx.draw(true)

    // 绘制页头颜色
    _ctx.setFillStyle(that.data.project.color)
    canvasUtil.fillRadiusRect(_ctx, 0, 0, __cWidth, 20, 3)
    _ctx.fillRect(0, 10, __cWidth, __cWidth * .25 - 10)
    _ctx.draw(true)

    //绘制icon
    let _icon_x = __cWidth * 0.05, _icon_y = __cWidth * 0.05, _icon_w = __cWidth * 0.15
    _ctx.drawImage(that.data.project.avatar, _icon_x, _icon_y, _icon_w, _icon_w)

    //绘制清单名称
    _ctx.setFillStyle('#fff')
    _ctx.setFontSize(14)
    _ctx.fillText(that.data.project.name, _icon_x + __cWidth * 0.2, _icon_y + + __cWidth * 0.1)
    _ctx.draw(true)


    //绘制内容
    var textX, initX, textY, initY
    textX = initX = __cWidth * .17, textY = initY = __cWidth * .35
    var maxWidth = __cWidth * .7

    let _list = that.data.todoTaskList.concat(that.data.doneTaskList)
    for (var i = 0; i < _list.length && i < 8; i++) {
      //绘制文章列表前的圆点
      _ctx.setTextAlign('left')
      _ctx.setFillStyle(that.data.project.color)
      _ctx.setFontSize(14)
      _ctx.fillText(_list[i].done ? '√' : (i + 1) + '.', __cWidth * .1, textY)

      //绘制文章标题
      _ctx.setFillStyle('#353535')
      _ctx.setFontSize(12)
      let text = _list[i].title
      let res = canvasUtil.fillMultipleText(_ctx, text, textX, textY, maxWidth, 22, 2)

      textX = initX
      textY = res.y + 10
    }
    _ctx.draw(true)

    //绘制分割线
    let line_x_s = __cWidth * 0.10, line_x_e = __cWidth - line_x_s, line_y = __cHeight * .84
    _ctx.moveTo(line_x_s, line_y)
    _ctx.lineTo(line_x_e, line_y)
    _ctx.setStrokeStyle('#f1f1f1')
    _ctx.stroke()

    //绘制底部信息
    _ctx.setFillStyle('#353535')
    _ctx.setFontSize(10)
    _ctx.fillText('长按识别二维码', line_x_s, __cHeight * .90)
    _ctx.fillText('使用更多清单功能', line_x_s, __cHeight * .94)

    //绘制小程序码
    let qrcode_width = __cWidth * .18
    _ctx.beginPath()
    _ctx.drawImage('/images/qrcode.jpeg', __cWidth * .90 - qrcode_width, __cHeight * .84 + (__cHeight * .14 - qrcode_width) / 2, qrcode_width, qrcode_width)


    _ctx.draw(true)
    wx.hideLoading()
    return
  },
  /**
   * 保存canvas图片到手机
   */
  save2PhoneImage: function () {
    var that = this
    wx.showLoading({
      title: '正在保存···',
    })
    wx.canvasToTempFilePath({
      canvasId: 'project-placard',
      success(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            wx.hideLoading()
          },
          fail(res) {
            wx.hideLoading()
            wx.showToast({
              title: '保存到相册失败！',
            })
          }
        })
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      return {
        title: '我列了一张任务清单，快来和我一起完成',
        path: '/pages/project/join?projectId=' + this.data.projectId
      }
    } else {
      return {
        title: '超好用的清单小程序，重要的事儿通通记下来',
        path: '/pages/project/detail?projectId=' + this.data.projectId
      }
    }
  }
})