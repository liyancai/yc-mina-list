
Page({
  data: {
    loading: false,
    projectList: [],
  },
  onLoad: function (options) {
    this.getProjectList()
  },
  showOptModal(event) {

    let _project = event.currentTarget.dataset.project
    let _index = event.currentTarget.dataset.index

    let that = this
    wx.showActionSheet({
      itemList: [
        '📤 恢复清单',
        '️️️🗑️ 删除清单'
      ],
      success(res) {
        if (res.tapIndex == 0) {
          that.doUndoneProject(_index, _project)
        } else if (res.tapIndex == 1) {
          that.doRemoveProject(_index, _project)
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  // 查询已归档的清单列表
  getProjectList() {
    let that = this
    wx.showNavigationBarLoading()
    that.setData({
      loading: true
    })

    wx.stopPullDownRefresh()
    wx.cloud.callFunction({
      name: 'project-list',
      data: {
        done: true
      }
    })
    .then(res => {
      wx.hideNavigationBarLoading()
      
      that.setData({
        projectList: res.result.data,
        loading: false
      })
    })
    .catch(err => {
      wx.hideNavigationBarLoading()
      that.setData({
        loading: false
      })
      console.error(err)
    })

  },
  // 恢复清单
  doUndoneProject(__index, __project) {
    let that = this
    wx.showLoading({ title: '正在恢复···' })
    wx.cloud.callFunction({
      name: 'project-modify',
      data: {
        action: 'undone',
        projectId: __project._id,
      }
    })
    .then(res => {
      console.log(res)

      // 将project从已归档列表移除
      that.data.projectList.splice(__index, 1)

      that.setData({
        projectList: that.data.projectList
      })

      wx.hideLoading()
    })
    .catch(err => {
      wx.hideLoading()
      console.error(err)
    })
  },
  // 删除清单
  doRemoveProject(__index, __project) {
    let that = this
    wx.showLoading({ title: '正在删除···' })
    wx.cloud.callFunction({
      name: 'project-remove',
      data: {
        project: __project,
      }
    })
    .then(res => {
      console.log(res)

      // 将project从已归档列表移除
      that.data.projectList.splice(__index, 1)

      that.setData({
        projectList: that.data.projectList
      })

      wx.hideLoading()
    })
    .catch(err => {
      wx.hideLoading()
      console.error(err)
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getProjectList()
  },

})