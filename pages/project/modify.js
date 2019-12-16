const projectServUtil = require('../../service/ProjectService.js')
const proIconServUtil = require('../../service/ProjectIconService.js')
const proCoverServUtil = require('../../service/ProjectCoverService.js')
const { $Message } = require('../../components/iview/base/index');

Page({
  data: {
    projectId: '',
    project: {},
    iconList: [],
    coverList: [],
    inputValue: '',
    currentIcon: {},
    currentCover: {},
  },
  onLoad: function (options) {

    let _projectId = options.projectId

    if (_projectId == null || _projectId == undefined) {

      this.gotoProjectList()
      return
    }

    _projectId += ''
    this.setData({
      projectId: _projectId
    })
    this.getProjectInfo(_projectId)
    this.getIconList()
    this.getCoverList()
  },
  // 查询清单信息
  getProjectInfo(__projectId) {
    let that = this
    wx.showNavigationBarLoading()
    projectServUtil.getInfo(__projectId, res => {
      wx.hideNavigationBarLoading()

      if(res == null) {
        wx.showToast({
          title: '清单已归档或已删除！',
          icon: 'none'
        })
        that.gotoProjectList()

        return
      } else {
        that.setData({
          project: res,
          projectId: res._id,
          inputValue: res.name
        })

        setTimeout(_ => {
          let _iconList = that.data.iconList
          for(let i=0; i<_iconList.length; i++) {
            if(_iconList[i].value == res.avatar) {
              that.setData({
                currentIcon: _iconList[i]
              })
              break;
            }
          }

          let _coverList = that.data.coverList
          for (let i = 0; i < _coverList.length; i++) {
            if (_coverList[i].value == res.cover) {
              that.setData({
                currentCover: _coverList[i]
              })
              break;
            }
          }
        }, 200)
      }
    })
  },
  getIconList() {
    let that = this
    proIconServUtil.getList(res => {
      that.setData({
        iconList: res,
        currentIcon: res[0]
      })
    })
  },
  getCoverList() {
    let that = this
    proCoverServUtil.getList(res => {
      that.setData({
        coverList: res,
        currentCover: res[0]
      })
    })
  },
  // 切换图标
  toggleIcon(event) {
    let _icon = event.currentTarget.dataset.icon

    this.setData({
      currentIcon: _icon
    })
  },
  // 切换封面图
  toggleCover(event) {
    let _cover = event.currentTarget.dataset.cover

    this.setData({
      currentCover: _cover
    })
  },
  // 绑定输入框的值
  bindBlurFunc(event) {
    let _inputValue = event.detail.value.trim()

    this.setData({
      inputValue: event.detail.value.trim()
    })
  },
  // 修改清单
  modifyProject() {
    if (this.data.project == null) {
      return
    }

    let _projectId = this.data.projectId
    let _currentIcon = this.data.currentIcon
    let _currentCover = this.data.currentCover
    let _name = (this.data.inputValue || '').trim()

    if (_name == "") {
      $Message({
        content: '标题不能为空哦~',
        type: 'warning'
      });
      return
    }

    let that = this
    // 调用修改project云函数请求
    wx.showLoading({ title: '请稍候···' })
    wx.cloud.callFunction({
      name: 'project-modify',
      data: {
        action: 'modify',
        projectId: _projectId,
        name: _name,
        avatar: _currentIcon.value,
        cover: _currentCover.value,
      }
    })
    .then(res => {
      wx.hideLoading()
      if (res.result && res.result.errMsg == 'document.update:ok') {
        wx.redirectTo({
          url: '/pages/project/detail?projectId=' + _projectId,
        })
      } else if (res.result && res.result.errCode && res.result.errCode == 87014) {
        $Message({
          content: '请正确填写清单标题！',
          type: 'error'
        });
      } else {
        $Message({
          content: '更新失败，请稍候重试~',
          type: 'error'
        });
      }
    })
    .catch(err => {
      wx.hideLoading()
      console.error(err)
    })
  },
  gotoProjectList() {
    wx.reLaunch({
      url: '/pages/project/list',
    })
  },

})