// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const coll = db.collection('task')

// 云函数入口函数
exports.main = async (event, context) => {

//  const log = cloud.logger()

  const { OPENID, APPID } = cloud.getWXContext()

  const { projectId, title } = event

  try {
    return await coll.add({
      data: {
        projectId: projectId,
        title: title,
        author: OPENID,
        completer: '',
        done: false,
        createTime: new Date(),
      }
    })
  } catch (e) {
    console.error(e)
  }

}