// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const coll = db.collection('task')

// 云函数入口函数
exports.main = async (event, context) => {

  //  const log = cloud.logger()

  const { OPENID, APPID } = cloud.getWXContext()

  const { taskId, projectId } = event

  try {

    if(taskId != undefined && taskId != null) {

      return await coll.doc(taskId).remove()

    } else if (projectId != undefined && projectId != null) {
      
      return await coll.where({
        projectId: projectId
      }).remove()

    }

  } catch (e) {
    console.error(e)
  }

}