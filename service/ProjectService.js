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
  getCollection()
  .doc(id)
  .get()
  .then(res => {
    if(res.data && res.data.done) {
      callback(null)
    } else {
      callback(res.data)
    }
  }).catch(err => {
    console.log(err)
    callback(null)
  })
}

module.exports = { getInfo }
