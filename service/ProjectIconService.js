let db = null
let coll = null
let getCollection = () => {
  if (db == null) {
    db = wx.cloud.database()
  }
  coll = db.collection('project_icon')
  return coll
}
/**
 * 清单分类列表
 */
let getList = callback => {
  wx.showNavigationBarLoading()
  getCollection()
  .get()
  .then(res => {
    wx.hideNavigationBarLoading()
    if (res.data.length > 0) {
      callback(res.data)
    } else {
      callback([])
    }
  }).catch(err => {
    wx.hideNavigationBarLoading()
    callback([])
  })
}

module.exports = { getList }
