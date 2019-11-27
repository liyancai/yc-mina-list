
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    wx.cloud.callFunction({
      name: 'account-info',
      data: {}
    })
    .then(res => {
      if(res.result != undefined && res.result != null) {
        this.globalData.userInfo = res.result.data
      }
    })
    .catch(err => {
      console.error(err)
    })
  },
  globalData: {
    userInfo: null
  }
})