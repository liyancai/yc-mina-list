let db = null
let coll = null
let getCollection = () => {
  if (db == null) {
    db = wx.cloud.database()
  }
  coll = db.collection('project')
  return coll
}

/**
 * 清单详情信息
 */
let getInfo = (id, callback) => {
  wx.stopPullDownRefresh()
  wx.showNavigationBarLoading()
  getCollection()
  .doc(id)
  .get()
  .then(res => {
    wx.hideNavigationBarLoading()

    let _project = res.data
    if(_project && _project.members) {
      _project['members'] = Array.from(new Set(res.data.members))
    }

    callback(_project)
  }).catch(err => {
    wx.hideNavigationBarLoading()
    callback(null)
  })
}

module.exports = { getInfo }
