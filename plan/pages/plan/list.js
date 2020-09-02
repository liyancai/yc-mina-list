import { $Message } from '../../../components/iview/base/index';

Page({
  data: {
    loading: false,
    authModelVisible: false,
    maxNumPlan: 10,
    planList: [],
    planStatisticsMap: {}
  },
  onShow: function (options) {
    this.getPlanList()
  },
  // 查询未归档的清单列表
  getPlanList() {
    let that = this
    wx.showNavigationBarLoading()
    that.setData({
      loading: true
    })

    wx.stopPullDownRefresh()
    wx.cloud.callFunction({
      name: 'plan-list',
      data: {
        done: false
      }
    })
    .then(res => {
      wx.hideNavigationBarLoading()

      that.setData({
        planList: res.result.data,
        loading: false
      })

      that.getPlanStatistics(res.result.data);

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
  getPlanStatistics(__planList) {

    if (__planList == null || __planList == undefined || __planList.length == 0) {
      return
    }

    let _map = {}
    __planList.forEach(v => {
      let _total = v.detail.length
      let _doneCount = 0
      for (let i = 0; i < v.detail.length; i++) {
        if (v.detail[i].done) {
          _doneCount++
        }
      }
      _map[v._id] = {
        planId: v._id,
        total: _total,
        doneCount: _doneCount,
        percent: _total == 0 ? 0 : Number(_doneCount / _total).toFixed(2),
      }
    })
    this.setData({
      planStatisticsMap: _map
    })
  },
  showPlanOptModal(event) {

    let _plan = event.currentTarget.dataset.plan
    let _index = event.currentTarget.dataset.index

    let that = this
    wx.showActionSheet({
      itemList: [
        '️️️📄 查看详情',
        '🗑️ 删除该计划',
      ],
      success(res) {
        if (res.tapIndex == 0) {
          that.gotoPlanDetail(event)
        } else if (res.tapIndex == 1) {
          that.doRemovePlan(_index, _plan)
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  doRemovePlan(__index, __plan) {
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
      that.data.planList.splice(__index, 1)
      that.setData({
        planList: that.data.planList
      })
    })
    .catch(err => {
      wx.hideLoading()
      console.error(err)
    })
  },
  getUserInfo(event) {

    this.setData({
      authModelVisible: false
    })

    let _msg = event.detail.errMsg
    if (_msg == 'getUserInfo:fail auth deny') {
    } else {
      // 写入account
      this.addAccount(event.detail.userInfo)
    }
  },
  // 点击添加清单按钮
  addPlan() {
    if (this.data.planList.length >= this.data.maxNumPlan) {
      $Message({
        content: '数量已达上限，建议删除已完成目标!',
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
  //进入计划详情页
  gotoPlanDetail(event) {
    let _plan = event.currentTarget.dataset.plan
    wx.navigateTo({
      url: '/plan/pages/plan/detail?planId=' + _plan._id,
    })
  },
  //跳转到创建清单页
  gotoCreate() {
    this.setData({
      authModelVisible: false
    })
    wx.navigateTo({
      url: '/plan/pages/plan/create',
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
    this.getPlanList()
  },

  /**
   * 用户点击右上角分享
   */
  // todo
  onShareAppMessage: function (res) {
    return {
      title: '简单好用的目标清单小程序，开始制定计划吧!',
      imageUrl: '/images/cover.png',
      path: '/plan/pages/plan/list'
    }
  }
})