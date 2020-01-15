let db = null
let coll = null
let getCollection = () => {
  if (db == null) {
    db = wx.cloud.database()
  }
  coll = db.collection('plan')
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

    let _plan = res.data
    if (_plan && !_plan.done) {
      callback(_plan)
    } else {
      callback(null)
    }
  }).catch(err => {
    wx.hideNavigationBarLoading()
    callback(null)
  })
}

module.exports = { getInfo }
