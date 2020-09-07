// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const coll = db.collection('project')

// 云函数入口函数
exports.main = async (event, context) => {

  //  const log = cloud.logger()

  const { OPENID, APPID } = cloud.getWXContext()

  const { projectId } = event

  try {

    return await coll.doc(projectId).get()

  } catch (e) {
    console.error(e)
    return {
      data: null,
      errMsg: "document.get:ok"
    }
  }

}