let db = null
let coll = null
let getCollection = () => {
  if (db == null) {
    db = wx.cloud.database()
  }
  coll = db.collection('project_cover')
  return coll
}
/**
 * 清单分类列表
 */
let getList = callback => {

  getCollection()
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
