const app = getApp()
const projectServUtil = require('../../service/ProjectService.js')
let videoAd = null

Page({
  data: {
    projectId: '',
    project: null,
  },
  onLoad: function (options) {

    let _projectId = options.projectId

    // _projectId = '79a2c43f5e7aca370006c39b3592c7d0'

    if (_projectId == null || _projectId == undefined) {

      this.gotoProjectList()
      return
    }

    _projectId += ''
    this.setData({
      projectId: _projectId
    })

    this.getProjectInfo(_projectId)

    let that = this
    // 激励视频广告
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-fb84155005bd15ed'
      })
      videoAd.onLoad(() => { })
      videoAd.onError((err) => { })
      videoAd.onClose((res) => {
        // 用户点击了【关闭广告】按钮
        if (res && res.isEnded) {
          // 正常播放结束，可以下发游戏奖励
          that.doJoinProject()
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

})