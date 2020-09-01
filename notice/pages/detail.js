const app = getApp()
import { formatDateZh } from '../../utils/date.js'
import { getInfo } from '../../service/NoticeService.js'

Page({
  data: {
    noticeId: '',
    notice: null,
  },
  onLoad: function (options) {

    let _noticeId = options.id

    if (_noticeId == null || _noticeId == undefined) {
      this.gotoNoticeList()
      return
    }

    _noticeId += ''
    this.setData({
      noticeId: _noticeId
    })

    this.getNoticeInfo(_noticeId)
  },
  // 查询公告信息
  getNoticeInfo(__noticeId) {

    let that = this
    getInfo(__noticeId, res => {
      if (res == null) {
        wx.showToast({
          title: '请稍候重试！',
          icon: 'none'
        })

        that.gotoNoticeList()
        return
      } else {
        res.time = formatDateZh(res.modifyTime)

        that.setData({
          notice: res,
        })
      }
    })
  },
  gotoNoticeList() {
    wx.redirectTo({
      url: '/notice/pages/list',
    })
  },
  previewImage: function (event) {
    let dataset = event.currentTarget.dataset
    wx.previewImage({
      urls: [dataset.src]
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    let _noticeId = this.data.noticeId

    this.getNoticeInfo(_noticeId)
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return {
      title: '这是我的小目标 - 来自简单好用的清单小程序',
      path: '/notice/pages/detail?id=' + this.data.noticeId
    }
  }
})