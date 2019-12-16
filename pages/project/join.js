const app = getApp()
const projectServUtil = require('../../service/ProjectService.js')

Page({
  data: {
    projectId: '',
    project: null,
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
  },
  // 查询清单信息
  getProjectInfo(__projectId) {
    let that = this
    projectServUtil.getInfo(__projectId, res => {
      if (res == null) {
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

        setTimeout(function(){
          if (app.globalData.userInfo != null && app.globalData.userInfo != undefined) {
            if (res.members.indexOf(app.globalData.userInfo._id) > -1) {
              that.gotoProjectDetail(__projectId)
            }
          }
        }, 300)
      }
    })
  },
  joinProject(event) {
    let _msg = event.detail.errMsg

    if (_msg == 'getUserInfo:fail auth deny') {
      this.doJoinProject()
    } else {
      this.addAccount(event.detail.userInfo)
    }
  },
  doJoinProject() {

    let _projectId = this.data.projectId
    let _project = this.data.project

    let that = this
    wx.showLoading({ title: '数据加载中' })
    wx.cloud.callFunction({
      name: 'project-modify',
      data: {
        action: 'join',
        projectId: _projectId,
        project: _project
      }
    })
    .then(res => {
      that.gotoProjectDetail(_projectId)
      wx.hideLoading()
    })
    .catch(err => {
      wx.hideLoading()
      console.error(err)
    })
  },
  // 更新微信账号信息
  addAccount(__userInfo) {

    let that = this
    // 调用添加account云函数请求
    wx.cloud.callFunction({
      name: 'account-add',
      data: __userInfo
    })
    .then(res => {
      that.doJoinProject()
    })
    .catch(err => {
      console.error(err)
    })
  },
  gotoProjectList() {
    wx.reLaunch({
      url: '/pages/project/list',
    })
  },
  gotoProjectDetail(__projectId) {
    wx.redirectTo({
      url: '/pages/project/detail?projectId=' + __projectId,
    })
  }

})