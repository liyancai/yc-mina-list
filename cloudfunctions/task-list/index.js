// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const coll = db.collection('task')
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  //  const log = cloud.logger()

  const { OPENID, APPID } = cloud.getWXContext()

  const { projectId, done } = event

  try {
    let res = await coll.where({
      projectId: projectId,
      done: done
    })

    if(done) {
      res = res.orderBy('finishedTime', 'desc')
    } else {
      res = res.orderBy('modifyTime', 'desc')
    }

    return res.get()
  } catch (e) {
    console.error(e)
  }

}
