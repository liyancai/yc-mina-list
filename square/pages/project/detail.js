const app = getApp()
const accountServUtil = require('../../../service/AccountService.js')
const projectServUtil = require('../../../service/ProjectService.js')

Page({
  data: {
    projectId: '',
    project: null,
    memberMap: {},
    todoTaskList: [],
    doneTaskList: [],
  },
  onLoad: function (options) {

    let _projectId = options.projectId

    if (_projectId == null || _projectId == undefined) {

      this.gotoProjectList()
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
  // 查询清单信息
  getProjectInfo(__projectId) {
    let that = this
    projectServUtil.getInfo(__projectId, res => {
      if (res == null) {
        wx.showToast({
          title: '清单已删除！',
          icon: 'none'
        })
        that.gotoSquare()

        return
      } else {
        that.setData({
          project: res
        })

        accountServUtil.getList(res.members, res => {
          let _map = {}
          res.forEach(v => {
            _map[v._id] = v
          })

          that.setData({
            memberMap: _map
          })
        })

        if (res.cover == null || res.cover == undefined || res.cover == '') {
          that.setMainColor(res.color)
        }
      }
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
  gotoSquare() {
    wx.redirectTo({
      url: '/square/pages/project/index',
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return {
      title: this.data.project.name + ' - 来自简单好用的清单小程序',
      path: '/square/pages/project/detail?projectId=' + this.data.projectId
    }
  }
})