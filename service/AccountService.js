let db = null
let coll = null
let _ = null
let getCollection = () => {
  if (db == null) {
    db = wx.cloud.database()
  }
  _ = db.command
  coll = db.collection('account')
  return coll
}
/**
 * 用户列表
 */
let getList = (ids, callback) => {

  getCollection()
  .where({
    _id: _.in(ids)
  })
  .get()
  .then(res => {
    if (res.data.length > 0) {
      callback(res.data)
    } else {
      callback([])
    }
  }).catch(err => {
    callback([])
  })
}

module.exports = { getList }
