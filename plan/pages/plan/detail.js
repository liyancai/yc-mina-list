const app = getApp()
const dateUtil = require('../../../utils/date.js')
const accountServUtil = require('../../../service/AccountService.js')
const planServUtil = require('../../../service/PlanService.js')
const { $Message } = require('../../../components/iview/base/index');

Page({
  data: {
    planId: '',
    plan: null,
    author: {},
    detail: [],
    startTime: '',
    endTime: '',
    isMember: false,
    weeks: ['日', '一', '二', '三', '四', '五', '六'],
    placardVisible: false
  },
  onLoad: function (options) {

    let _planId = options.planId

    if (_planId == null || _planId == undefined) {

      this.gotoPlanList()
      return
    }

    _planId += ''
    this.setData({
      planId: _planId
    })

    // initMemberStatus
    let pages = getCurrentPages()
    if (pages.length >= 2) {
      let prevpage = pages[pages.length - 2]
      // 如果从列表页进入的，则初始化为 isMember = true
      if(prevpage.route == 'plan/pages/plan/list')
      this.setData({
        isMember: true
      })
    }

    this.getPlanInfo(_planId)
  },
  showPlanOptModal() {

    let _plan = this.data.plan
    
    let that = this
    wx.showActionSheet({
      itemList: [
        '🗑️ 删除该计划',
      ],
      success(res) {
        if (res.tapIndex == 0) {
          that.doRemovePlan(_plan)
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  // 补全日期列表的页头页尾，凑够一周的整数倍, 用于展示
  getWeekList4Show(__list) {
    let _weekList = __list.slice()

    let _firstDay = new Date(__list[0].timestamp)
    let _lastDay = new Date(__list[__list.length - 1].timestamp)

    let _firstDayWeek = _firstDay.getDay()
    let _lastDayWeek = _lastDay.getDay()


    for (let i = 0; i < _firstDayWeek; i++) {
      _weekList.unshift({ placeholder: true })
    }
    for (let i = _lastDayWeek + 1; i < 7; i++) {
      _weekList.push({ placeholder: true })
    }
    return _weekList
  },
  // 查询计划信息
  getPlanInfo(__planId) {

    let that = this
    planServUtil.getInfo(__planId, res => {

      if (res == null || res.done) {
        wx.showToast({
          title: '计划已归档或已删除！',
          icon: 'none'
        })

        that.gotoPlanList()
        return
      } else {
        that.setData({
          plan: res,
          detail: that.getWeekList4Show(res.detail),
          startTime: dateUtil.formatDateZh(res.detail[0].timestamp),
          endTime: dateUtil.formatDateZh(res.detail[res.detail.length - 1].timestamp),
        })

        let setMemberStatus = function() {
          if (app.globalData.userInfo != null && app.globalData.userInfo != undefined) {
            that.setData({
              isMember: res.author == app.globalData.userInfo._id
            })
          }
        }
        // 获取清单详情后立即更新成员状态，预防执行顺序的问题，300ms后再次更新一次
        setMemberStatus()
        setTimeout(setMemberStatus, 300)

        accountServUtil.getList([res.author], res => {
          if(res != null && res.length > 0) {
            that.setData({
              author: res[0]
            })
          }
        })

      }
    })
  },
  // 修改计划的明细状态
  modifyDayStatus(event) {
    let _dayObj = event.currentTarget.dataset.dayObj

    if(!_dayObj.done) {
      if(_dayObj.timestamp > new Date().getTime()) {
        $Message({
          content: '不能选择未来时间哦！',
          type: 'error',
        });
        return
      }
    }

    let _plan = this.data.plan
    for(let i=0; i< _plan.detail.length; i++) {
      let _item = _plan.detail[i]
      if (_item.timestamp == _dayObj.timestamp){
        _item.done = !_item.done
      }
    }

    this.doModifyDay('modifyDayStatus', _plan)
  },
  // 更改明细状态
  doModifyDay(__action, __plan) {

    let that = this
    wx.showLoading({ title: '请稍候···' })
    wx.cloud.callFunction({
      name: 'plan-modify',
      data: {
        action: __action,
        plan: __plan,
      }
    })
    .then(res => {
      that.data.plan = __plan
      that.setData({
        detail: that.getWeekList4Show(__plan.detail),
      })
      wx.hideLoading()
    })
    .catch(err => {
      wx.hideLoading()
      console.error(err)
    })
  },
  // 删除计划
  doRemovePlan(__plan) {
    let that = this
    wx.showLoading({ title: '正在删除···' })
    wx.cloud.callFunction({
      name: 'plan-remove',
      data: {
        planId: __plan._id,
      }
    })
    .then(res => {
      wx.hideLoading()
      let pages = getCurrentPages()
      if (pages.length >= 2) {
        wx.navigateBack({})
      } else {
        that.gotoPlanList()
      }
    })
    .catch(err => {
      wx.hideLoading()
      console.error(err)
    })
  },
  gotoPlanList() {
    wx.redirectTo({
      url: '/plan/pages/plan/list',
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    let _planId = this.data.planId

    this.getPlanInfo(_planId)
  },
  openCanvasView() {
    let that = this

    that.drawPlacard()
    that.setData({
      placardVisible: true,
    })
  },
  closeCanvasView() {
    this.setData({
      placardVisible: false,
    })
  },
  /**
   * 保存canvas图片到手机
   */
  save2PhoneImage: function () {
    var that = this
    wx.showLoading({
      title: '正在保存···',
    })
    wx.canvasToTempFilePath({
      canvasId: 'plan-placard',
      success(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            wx.hideLoading()
          },
          fail(res) {
            wx.hideLoading()
            wx.showToast({
              title: '保存到相册失败！',
              icon: 'none'
            })
          }
        })
      }
    })
  },
  previewImage(){
    var that = this
    wx.canvasToTempFilePath({
      canvasId: 'plan-placard',
      success(res) {
        wx.previewImage({
          urls: [res.tempFilePath] // 需要预览的图片http链接列表
        })
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return {
      title: '这是我的小目标 - 来自简单好用的清单小程序',
      path: '/plan/pages/plan/detail?planId=' + this.data.planId
    }
  }
})