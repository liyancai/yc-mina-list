// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const coll = db.collection('project')

// 云函数入口函数
exports.main = async (event, context) => {

  // const log = cloud.logger()

  const { OPENID, APPID } = cloud.getWXContext()

  const { project } = event

  try {
    if(OPENID != project.author) {
      // 如果该清单不是本人创建，则只是从清单成员中移除

      let _members = []
      project.members.forEach(v => {
        if(v != OPENID) {
          _members.push(v)
        }
      })

      return await coll.doc(project._id).update({
        data: {
          members: _members
        }
      })
    
    } else {
      // 1. 删除task
      cloud.callFunction({
        name: 'task-remove',
        data: {
          projectId: project._id,
        }
      })

      // 2. 删除清单
      return await coll.doc(project._id).remove()
    }
  } catch (e) {
    console.error(e)
  }

}