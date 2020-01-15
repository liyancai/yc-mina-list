const { $Message } = require('../../components/iview/base/index');

Page({
  data: {
    loading: false,
    authModelVisible: false,
    moreMenuVisible: false,
    maxNumProject: 10,
    planList: [],
    projectList: [],
    projectStatisticsMap: {},
  },
  onShow: function (options) {
    this.getProjectList()
  },
  // 查询未归档的清单列表
  getProjectList() {
    let that = this
    wx.showNavigationBarLoading()
    that.setData({
      loading: true
    })

    wx.stopPullDownRefresh()
    wx.cloud.callFunction({
      name: 'project-list',
      data: {
        done: false
      }
    })
    .then(res => {
      wx.hideNavigationBarLoading()

      that.setData({
        projectList: res.result.data,
        loading: false
      })

      let _projectIds = []
      that.data.projectList.forEach(v => {
        _projectIds.push(v._id)
      })
      that.getProjectStatistics(_projectIds);

    })
    .catch(err => {
      wx.hideNavigationBarLoading()
      that.setData({
        loading: false
      })
      console.error(err)
    })

  },
  // 获取清单完成度的统计信息
  getProjectStatistics(__projectIds) {

    if(__projectIds == null || __projectIds == undefined || __projectIds.length == 0) {
      return
    }

    let that = this
    wx.showNavigationBarLoading()
    wx.cloud.callFunction({
      name: 'project-statistics',
      data: {
        projectIds: __projectIds
      }
    })
    .then(res => {
      wx.hideNavigationBarLoading()

      let _list = res.result.list
      let _map = {}
      _list.forEach(v => {
        let _doneCount = 0
        let _total = 0
        for(let i=0; i<v.detail.length; i++) {
          if(v.detail[i].done) {
            _doneCount = v.detail[i].count
          }
          _total += v.detail[i].count
        }

        _map[v._id] = {
          projectId: v._id,
          total: _total,
          doneCount: _doneCount,
          percent: _total == 0 ? 0 : Number(_doneCount / _total).toFixed(2),
        }
      })

      that.setData({
        projectStatisticsMap: _map
      })
    })
    .catch(err => {
      wx.hideNavigationBarLoading()
      console.error(err)
    })
  },
  getUserInfo(event) {

    this.setData({
      authModelVisible: false
    })

    let _msg = event.detail.errMsg
    if (_msg == 'getUserInfo:fail auth deny') {
      //that.gotoCreate()
    } else {
      // 写入account
      this.addAccount(event.detail.userInfo)
    }
  },
  // 点击添加清单按钮
  addProject() {
    if (this.data.projectList.length >= this.data.maxNumProject) {
      $Message({
        content: '数量已达上限，建议删除或归档历史清单!',
        type: 'warning'
      });
      return
    }

    let that = this
    // 获取用户信息
    wx.getSetting({
      success: res => {
        let userInfoAuth = res.authSetting['scope.userInfo']
        if (userInfoAuth == undefined || !userInfoAuth) {
          // 打开要求授权弹框
          that.setData({
            authModelVisible: true
          })
        } else {
          that.gotoCreate()
        }
      },
    })
  },
  //跳转到创建清单页
  gotoCreate() {
    this.setData({
      authModelVisible: false
    })
    wx.navigateTo({
      url: '/pages/project/create',
    })
  },
  gotoAbout() {
    this.toggleMoreMenu()
    wx.navigateTo({
      url: '/pages/personal/about',
    })
  },
  gotoProjectArchives() {
    this.toggleMoreMenu()
    wx.navigateTo({
      url: '/pages/project/archives',
    })
  },
  gotoPersonal() {
    this.toggleMoreMenu()
    wx.navigateTo({
      url: '/pages/personal/index',
    })
  },
  gotoSquare() {
    this.toggleMoreMenu()
    wx.navigateTo({
      url: '/square/pages/project/index',
    })
  },
  gotoPlanList() {
    this.toggleMoreMenu()
    wx.navigateTo({
      url: '/plan/pages/plan/list',
    })
  },
  toggleMoreMenu() {
    let that = this
    this.setData({
      moreMenuVisible: !that.data.moreMenuVisible
    })
  },
  // 更新微信账号信息
  addAccount(__userInfo) {

    let that = this
    // 调用添加account云函数请求
    wx.showLoading({ title: '请稍候···' })
    wx.cloud.callFunction({
      name: 'account-add',
      data: __userInfo
    })
    .then(res => {
      wx.hideLoading()
      that.gotoCreate()
    })
    .catch(err => {
      wx.hideLoading()
      console.error(err)
    })
  },
  closeAuthView() {
    this.setData({
      authModelVisible: false,
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getProjectList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return {
      title: '简单好用的清单小程序，省时更省心。',
      imageUrl: '/images/cover.png',
      path: '/pages/project/list'
    }
  }
})