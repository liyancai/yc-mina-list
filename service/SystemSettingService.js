let db = null
let coll = null
let getCollection = () => {
  if (db == null) {
    db = wx.cloud.database()
  }
  coll = db.collection('system_setting')
  return coll
}

/**
 * 我的页面 背景图
 */
let getPersonalBg = (callback) => {
  wx.stopPullDownRefresh()
  wx.showNavigationBarLoading()
  getCollection()
  .doc('bg-personal')
  .get()
  .then(res => {
    wx.hideNavigationBarLoading()
    callback(res.data)
  }).catch(err => {
    console.error(err)
    wx.hideNavigationBarLoading()
    callback({})
  })
}

/**
 * 公告页面 背景图
 */
let getNoticeBg = (callback) => {
  wx.stopPullDownRefresh()
  wx.showNavigationBarLoading()
  getCollection()
  .doc('bg-notice')
  .get()
  .then(res => {
    wx.hideNavigationBarLoading()
    callback(res.data)
  }).catch(err => {
    console.error(err)
    wx.hideNavigationBarLoading()
    callback({})
  })
}

module.exports = { getPersonalBg, getNoticeBg }
