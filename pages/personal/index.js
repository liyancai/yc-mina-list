const sysSettingServUtil = require('../../service/SystemSettingService.js')

Page({
  data: {
    bgImage: ''
  },
  onLoad: function (options) {
    this.getBgImage()
  },
  // 查询清单信息
  getBgImage() {
    let that = this
    sysSettingServUtil.getPersonalBg(res => {
      that.setData({
        bgImage: res.value ? res.value : 'http://imglf6.nosdn0.126.net/img/NjBvWnFYWXFScWhjRUxZaWo0ekt5d1RoTmY1Yi9rM3NXc0t4VjVxekRDVmpmY0JtcDlwTitBPT0.jpg'
      })      
    })
  },

  previewPayCodeImage: function (event) {
    var that = this
    wx.previewImage({
      urls: ["cloud://release-33vfx.7265-release-33vfx-1300876135/paycode.jpeg"]
    })
  },

})