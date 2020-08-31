const app = getApp()
const canvasUtil = require('../../utils/canvas.js')
const accountServUtil = require('../../service/AccountService.js')
const projectServUtil = require('../../service/ProjectService.js')
const { $Message } = require('../../components/iview/base/index');
let videoAd = null

Page({
  data: {
    addTaskLoading: false,
    inputValue: '',
    textareaValue: '',
    projectId: '',
    project: null,
    currentTask: null,
    currentTaskIndex: 0,
    memberMap: {},
    todoTaskList: [],
    doneTaskList: [],
    isMember: false,
    projectOptList: [],
    placardVisible: false,
    taskEditModelVisible: false,
    videoModelVisible: false,
    cover_temp: '/images/cover.png'
  },
  onLoad: function (options) {

    let _projectId = options.projectId

    // _projectId = ''

    if (_projectId == null || _projectId == undefined) {

      this.gotoProjectList()
      return
    }

    _projectId += ''
    this.setData({
      projectId: _projectId
    })

    // initMemberStatus
    let pages = getCurrentPages()
    if (pages.length >= 2) {
      let prevpage = pages[pages.length - 2]
      // 如果从列表页进入的，则初始化为 isMember = true
      if(prevpage.route == 'pages/project/list')
      this.setData({
        isMember: true
      })
    }

    this.getProjectInfo(_projectId)
    this.getTodoTaskList(_projectId)
    this.getDoneTaskList(_projectId)

  },
  initRewardedVideoAd(__this) {
    // 激励视频广告
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-ae3dee78088a4d1d'
      })
      videoAd.onLoad(() => { })
      videoAd.onError((err) => { })
      videoAd.onClose((res) => {
        // 用户点击了【关闭广告】按钮
        if (res && res.isEnded) {
          // 正常播放结束，可以下发游戏奖励
          __this.doIncMemberCountProject(__this.data.project)
        } else {
          // 播放中途退出，不下发游戏奖励
          wx.showToast({
            title: '视频还没有播放完，耐心一点哦~',
            icon: 'none',
            duration: 2500
          })
        }
      })
    }
  },
  initProjectOptList(__project) {
    let _list = [
      '📝 个性设置',
      '🌇 生成海报',
      '📥 清单归档',
      '🗑️ 删除清单',
    ]
    this.data.projectOptList = _list
  },
  showProjectOptModal() {

    let _project = this.data.project
    
    this.initProjectOptList(_project)

    let that = this
    wx.showActionSheet({
      itemList: that.data.projectOptList,
      success(res) {
        if (res.tapIndex == 0) {
          that.gotoModify()
        } else if (res.tapIndex == 1) {
          that.openCanvasView()
        } else if (res.tapIndex == 2) {
          that.doDoneProject(_project)
        } else if (res.tapIndex == 3) {
          that.doRemoveProject(_project)
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
        '📑 复制内容',
        '📝 修改内容',
        '🗑️ 删除该事项'
      ],
      success(res) {
        if (res.tapIndex == 0) {
          wx.setClipboardData({
            data: _task.title,
            success(res) {}
          })
        } else if (res.tapIndex == 1) {
          if(_task.done) {
            $Message({
              content: '该待办事项已经完成！',
              type: 'warning'
            });
          } else {
            that.data.currentTaskIndex = _index
            that.setData({
              currentTask: _task,
              textareaValue: _task.title,
            })
            that.openTaskEditView()
          }
        } else if (res.tapIndex == 2) {
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
    projectServUtil.getInfo(__projectId, res => {
      if (res == null || res.done) {
        wx.showToast({
          title: '清单已归档或已删除！',
          icon: 'none'
        })
        that.gotoProjectList()

        return
      } else {
        that.setData({
          project: res
        })

        let setMemberStatus = function() {
          if (app.globalData.userInfo != null && app.globalData.userInfo != undefined) {
            that.setData({
              isMember: res.members.indexOf(app.globalData.userInfo._id) > -1
            })
          }
        }
        // 获取清单详情后立即更新成员状态，预防执行顺序的问题，300ms后再次更新一次
        setMemberStatus()
        setTimeout(setMemberStatus, 300)

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

        // 初始化激励视频广告
        that.initRewardedVideoAd(that)
      }
    })
  },
  // 查询清单下的未完成任务列表
  getTodoTaskList(__projectId) {
    wx.showLoading({
      title: '正在加载'
    })

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
      wx.hideLoading()
      that.setData({
        todoTaskList: res.result ? res.result.data : []
      })
    })
    .catch(err => {
      wx.hideLoading()
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

    if (this.data.addTaskLoading) {
      return
    }

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

    this.data.addTaskLoading = true
    wx.showLoading({ title: '正在添加···' })

    let that = this
    // 调用添加task的云函数请求
    wx.cloud.callFunction({
      name: 'task-add',
      data: {
        projectId: _projectId,
        title: _title
      }
    })
    .then(res => {
      this.data.addTaskLoading = false
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
      this.data.addTaskLoading = false
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
  bindTextareaValueFunc(event) {
    this.setData({
      textareaValue: event.detail.value.trim()
    })
  },
  //保存修改任务
  modifyTask() {

    let _textareaValue = this.data.textareaValue
    if(_textareaValue == this.data.currentTask.title) {
      this.closeTaskEditView()
      return
    } else if (_textareaValue == '') {
      $Message({
        content: '待办事项不能为空哦~',
        type: 'warning'
      });
    } else {
      this.doModifyTask(
        'modify',
        this.data.currentTaskIndex,
        this.data.currentTask._id,
        _textareaValue
      )
    }

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
      } else if (__action == 'modify') {

        let _type = ''
        let _title = __title

        const IMAGE_TAG = 'image://'
        if (_title.substr(0, IMAGE_TAG.length) == IMAGE_TAG) {
          _type = 'image'
          _title = _title.substr(IMAGE_TAG.length)
        }
        that.data.todoTaskList[__index].title = _title
        that.data.todoTaskList[__index].type = _type

        that.setData({
          todoTaskList: that.data.todoTaskList
        })
        that.closeTaskEditView()
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
  doIncMemberCountProject(__project) {
    let that = this
    wx.showLoading({ title: '请稍候···' })
    wx.cloud.callFunction({
      name: 'project-modify',
      data: {
        action: 'incMemberCount',
        projectId: __project._id,
      }
    })
    .then(res => {
      wx.hideLoading()
      wx.showToast({
        title: '成员上限 +1，去邀请好友吧！',
        icon: 'none',
        duration: 2500
      })
      let _project = that.data.project
      _project.max_num_account += 1
      that.setData({
        project: _project
      })
      that.closeVideoView()
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
  openTaskEditView() {
    let that = this
    that.setData({
      taskEditModelVisible: true,
    })
  },
  closeTaskEditView() {
    this.setData({
      taskEditModelVisible: false,
    })
  },
  openVideoView() {
    let that = this
    that.setData({
      videoModelVisible: true,
    })
  },
  closeVideoView() {
    this.setData({
      videoModelVisible: false,
    })
  },
  playVideoAd() {
    if (videoAd) {
      videoAd.show().catch(() => {
        // 失败重试
        videoAd.load()
          .then(() => videoAd.show())
          .catch(err => {
            wx.showToast({
              title: '出了点小问题，稍候再试吧~',
              icon: 'none',
              duration: 2500
            })
          })
      })
    } else {
      wx.showToast({
        title: '出了点小问题，稍候再试吧~',
        icon: 'none',
        duration: 2500
      })
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    this.setData({
      placardVisible: false,
      taskEditModelVisible: false,
      videoModelVisible: false,
    })

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
    let _cWidth = Math.round(_wWidth * .7), _cHeight = Math.round(_wWidth * 1.25)

    that.drawImage(_cWidth, _cHeight);
  },
  drawImage(__cWidth, __cHeight) {
    wx.showLoading({
      title: '生成海报···',
    })

    var that = this
    var _ctx = wx.createCanvasContext('project-placard')

    let _header_h = __cWidth * .25

    // 绘制白色背景
    _ctx.setFillStyle('#ffffff')
    canvasUtil.fillRadiusRect(_ctx, 0, 0, __cWidth, __cHeight, 3)
    _ctx.draw(true)

    // 绘制页头颜色
    _ctx.setFillStyle(that.data.project.color)
    canvasUtil.fillRadiusRect(_ctx, 0, 0, __cWidth, 20, 3)
    _ctx.fillRect(0, 10, __cWidth, _header_h - 10)
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

    let _maxListLength = 10
    let _list_all = that.data.todoTaskList.concat(that.data.doneTaskList)

    // 过滤掉task是image的项目，生成的海报图片，只展示文字项
    let _list = []
    for (let i = 0; i < _list_all.length; i++) {
      if (_list_all[i].type != 'image') {
        _list.push(_list_all[i])
      }
    }
    for (var i = 0; i < _list.length && i < _maxListLength; i++) {
      //绘制文章列表前的圆点
      _ctx.setTextAlign('left')
      _ctx.setFillStyle(that.data.project.color)
      _ctx.setFontSize(12)
      _ctx.fillText(_list[i].done ? '√' : (i + 1) + '.', __cWidth * .1, textY)

      //绘制文章标题
      _ctx.setFillStyle('#353535')
      _ctx.setFontSize(10)
      let text = _list[i].title
      let res = canvasUtil.fillMultipleText(_ctx, text, textX, textY, maxWidth, 22, 1)

      textX = initX
      textY = res.y + 7
    }
    if (_list.length > _maxListLength) {
      _ctx.fillText('······', textX, textY - 7)
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
    _ctx.setFontSize(8)
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
              icon: 'none'
            })
          }
        })
      }
    })
  },
  previewImage(){
    var that = this
    wx.canvasToTempFilePath({
      canvasId: 'project-placard',
      success(res) {
        wx.previewImage({
          urls: [res.tempFilePath] // 需要预览的图片http链接列表
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
        title: this.data.project.name + ' - 来自简单好用的清单小程序',
        path: '/article/pages/detail?projectId=' + this.data.projectId
      }
    }
  }
})