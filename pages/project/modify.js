const projectServUtil = require('../../service/ProjectService.js')

Page({
  data: {
    projectId: '',
    project: {},

  },
  onLoad: function (options) {
    let _projectId = options.projectId
    if (_projectId == null || _projectId == undefined) {
      
      return
    }

    _projectId += ''
    this.setData({
      projectId: _projectId
    })
    this.getProjectInfo(_projectId)


  },
  // 查询清单信息
  getProjectInfo(__projectId) {
    let that = this
    projectServUtil.getInfo(__projectId, res => {
      that.setData({
        project: res,
        projectId: res._id,
      })
    })
  },

})