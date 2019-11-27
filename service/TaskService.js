let db = null
let coll = null
let getCollection = () => {
  if (db == null) {
    db = wx.cloud.database()
  }
  coll = db.collection('task')
  return coll
}
/**
 * 获取待办任务列表
 */
let getTodoList = (projectId, callback) => {

  getCollection()
  .where({
    projectId: projectId,
    done: false
  })
  .orderBy('modifyTime', 'desc')
  .orderBy('createTime', 'desc')
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
/**
 * 获取已完成任务列表
 */
let getDoneList = (projectId, callback) => {

  getCollection()
  .where({
    projectId: projectId,
    done: true
  })
  .orderBy('finishedTime', 'desc')
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

module.exports = { getTodoList, getDoneList }
