const { $Message } = require('../../../components/iview/base/index');

Page({
  data: {
    inputValue: '',
    currentDays: 21,
    daysList: [10, 21, 30, 45, 84]
  },
  onLoad: function (options) {

  },
  // 切换小目标天数
  toggleDays(event) {
    let _days = event.currentTarget.dataset.days
    this.setData({
      currentDays: _days
    })
  },
  // 绑定输入框的值
  bindBlurFunc(event) {
    let _inputValue = event.detail.value.trim()

    this.setData({
      inputValue: _inputValue
    })
  },
  // 新建计划
  addPlan() {

    let _name = this.data.inputValue
    if (_name == "") {
      $Message({
        content: '前填写小目标标题!',
        type: 'warning'
      });
      return
    } else if (_name.length < 5) {
      $Message({
        content: '目标标题太短了吧!',
        type: 'warning'
      });
      return
    }

    let that = this
    wx.showLoading({ title: '正在创建···' })
    wx.cloud.callFunction({
      name: 'plan-add',
      data: {
        name: _name,
        days: that.data.currentDays
      }
    })
    .then(res => {
      wx.hideLoading()
      if (res.result && res.result._id) {
        wx.redirectTo({
          url: '/plan/pages/plan/detail?planId=' + res.result._id,
        })
      } else if (res.result && res.result.errCode && res.result.errCode == 87014) {
        $Message({
          content: '请合理填写目标标题！',
          type: 'error'
        });
      } else {
        $Message({
          content: '添加失败，请稍候重试~',
          type: 'error'
        });
      }
    })
    .catch(err => {
      wx.hideLoading()
      console.error(err)
    })
  },
})