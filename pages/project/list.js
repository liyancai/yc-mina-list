const { $Message } = require('../../components/iview/base/index');

Page({
  data: {
    loading: false,
    authModelVisible: false,
    maxNumProject: 10,
    projectList: [],
  },
  onShow: function (options) {
    this.getProjectList()
  },
  // 查询未归档的清单列表
  getProjectList() {
    let that = this
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
      that.setData({
        projectList: res.result.data,
        loading: false
      })
    })
    .catch(err => {
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
        content: '清单数量已达上限!',
        type: 'error'
      });
      return
    }

    console.log(this.data.projectList.length)
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
    wx.navigateTo({
      url: '/pages/personal/about',
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
      title: '超好用的清单小程序，重要的事儿统统记下来',
      path: '/pages/project/list'
    }
  }
})