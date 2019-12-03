const projectServUtil = require('../../service/ProjectService.js')
const proCateServUtil = require('../../service/ProjectCategoryService.js')
const { $Message } = require('../../components/iview/base/index');

Page({
  data: {
    currentCate: {},
    cateList: [],

    inputValue: '',
    placeholder: '',
  },
  onLoad: function (options) {

    this.getCateList()
  },
  // 查询清单分类列表
  getCateList() {
    let that = this
    proCateServUtil.getList(res => {
      that.setData({
        cateList: res,
        currentCate: res[0]
      })
      that.setDefaultName()
    })
  },
  // 切换清单分类
  toggleCate(event) {
    let _cate = event.currentTarget.dataset.cate

    this.setData({
      currentCate: _cate
    })
    this.setDefaultName()
  },
  // 绑定输入框的值
  bindBlurFunc(event) {
    let _inputValue = event.detail.value.trim()

    this.setData({
      inputValue: event.detail.value.trim()
    })
  },
  // 默认清单标题
  setDefaultName() {
    //获得清单的默认名称
    let _now = new Date()
    let _thisMonth = _now.getMonth() + 1
    let _thisDay = _now.getDate()

    let defaultName = [_thisMonth, '月', _thisDay, '日', '的', this.data.currentCate.name].join('')

    this.setData({
      placeholder: defaultName
    })
  },

  // 新建清单
  addProject() {

    let _name = this.data.inputValue
    if (_name == "") {
      _name = this.data.placeholder
    }

    let that = this
    // 调用添加project云函数请求
    
    wx.showLoading({ title: '正在创建···' })
    let _cate = that.data.currentCate
    wx.cloud.callFunction({
      name: 'project-add',
      data: {
        cateId: _cate._id,
        name: _name,
        avatar: _cate.icon,
        color: _cate.color,
        maxNumAccount: _cate.max_num_account
      }
    })
    .then(res => {
      wx.hideLoading()
      if (res.result._id) {
        wx.redirectTo({
          url: '/pages/project/detail?projectId=' + res.result._id,
        })
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