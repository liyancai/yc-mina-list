const app = getApp()
const accountServUtil = require('../../service/AccountService.js')
const projectServUtil = require('../../service/ProjectService.js')
const taskServUtil = require('../../service/TaskService.js')
const { $Message } = require('../../components/iview/base/index');

Page({
  data: {
    inputValue: '',
    projectId: '',
    project: null,
    memberList: [],
    memberMap: {},
    todoTaskList: [],
    doneTaskList: [],
    doneTaskListViewVisible: false,
  },
  onLoad: function (options) {

    let _projectId = options.projectId

    // _projectId = "e2001a7f5ddd67da009a6f265990be02"

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
        // '修改清单名称',
        // '将清单归档',
        '删除清单'
      ],
      success(res) {
        if (res.tapIndex == 0) {
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
        '删除'
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
    projectServUtil.getInfo(__projectId, res => {
      that.setData({
        project: res
      })

      accountServUtil.getList(res.members, res => {
        let _map = {}
        res.forEach(v => {
          _map[v._id] = v
        })
        
        that.setData({
          // memberList: res,
          memberMap: _map
        })
      })

      that.setMainColor(res.color)
    })
  },
  // 查询清单下的未完成任务列表
  getTodoTaskList(__projectId) {
    let that = this
    taskServUtil.getTodoList(__projectId, res => {
      that.setData({
        todoTaskList: res
      })
    })
  },
  // 查询清单下的已完成任务列表
  getDoneTaskList(__projectId) {
    let that = this
    taskServUtil.getDoneList(__projectId, res => {
      that.setData({
        doneTaskList: res
      })
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
    wx.showLoading({ title: '请稍候……' })
    wx.cloud.callFunction({
      name: 'task-add',
      data: {
        projectId: _projectId,
        title: _title
      }
    })
    .then(res => {
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
      wx.hideLoading()
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
    wx.showLoading({ title: '请稍候……' })
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
  // 删除清单
  doRemoveProject(__project) {
    let that = this
    wx.showLoading({ title: '正在删除……' })
    wx.cloud.callFunction({
      name: 'project-remove',
      data: {
        project: __project,
      }
    })
    .then(res => {
      
      console.log(res)

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
  // @deprecated
  // 切换已完成的任务列表是否显示
  toggleDoneTaskListViewVisible() {
    let that = this
    this.setData({
      doneTaskListViewVisible: !that.data.doneTaskListViewVisible
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
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    let _projectId = this.data.projectId

    this.getProjectInfo(_projectId)
    this.getTodoTaskList(_projectId)
    this.getDoneTaskList(_projectId)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})