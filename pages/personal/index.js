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
        bgImage: res.value ? res.value : 'https://goss1.veer.com/creative/vcg/veer/612/veer-343378905.jpg'
      })      
    })
  },

})