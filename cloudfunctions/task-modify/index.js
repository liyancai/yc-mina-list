// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const coll = db.collection('task')

// 云函数入口函数
exports.main = async (event, context) => {

  //  const log = cloud.logger()

  const { OPENID, APPID } = cloud.getWXContext()

  const { action, taskId, title } = event

  let _data = (action == 'modify') ? {
    title: title,
    modifyTime: new Date(),
  } : (action == 'done') ? {
    completer: OPENID,
    done: true,
    finishedTime: new Date(),
  } : (action == 'undone') ? {
    done: false,
  } : {}

  try {
    return await coll.doc(taskId).update({
      data: _data
    })
  } catch (e) {
    console.error(e)
  }

}