import { getNoticeBg } from '../../service/SystemSettingService.js'

Page({
  data: {
    loading: false,
    noticeList: [],
    bgImage: '"https://goss4.veer.com/creative/vcg/veer/612/veer-312155011.jpg'
  },
  onLoad: function (options) {
    this.getBgImage()
    this.getNoticeList()
  },
  // 查询公告列表
  getNoticeList() {
    let that = this
    wx.showLoading({
      title: '正在加载'
    })
    that.setData({
      loading: true
    })

    wx.stopPullDownRefresh()
    wx.cloud.callFunction({
      name: 'notice-list',
      data: {
        active: true
      }
    })
    .then(res => {
      wx.hideLoading()
      
      that.setData({
        noticeList: res.result.data,
        loading: false
      })
    })
    .catch(err => {
      wx.hideLoading()
      that.setData({
        loading: false
      })
      console.error(err)
    })

  },
  gotoNoticeDetail(event) {
    let _notice = event.currentTarget.dataset.notice
    wx.navigateTo({
      url: '/notice/pages/detail?id=' + _notice._id,
    })    
  },
  getBgImage() {
    let that = this
    getNoticeBg(res => {
      that.setData({
        bgImage: res.value ? res.value : that.data.bgImage
      })      
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getNoticeList()
  },

})