// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const coll = db.collection('project')
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  const log = cloud.logger()

  const { OPENID, APPID, UNIONID, ENV, SOURCE } = cloud.getWXContext()

  const { action, projectId, name, avatar, color, member, } = event


  let _data = (action == 'modify') ? {
    name: name,
    modifyTime: new Date(),
  } : (action == 'done') ? {
    done: true,
    finishedTime: new Date(),
  } : (action == 'undone') ? {
    done: false,
  } : (action == 'join') ? {
    members: _.push([OPENID]),
  } : {}

  try {
    return await coll.doc(projectId).update({
      data: _data
    })
  } catch (e) {
    console.error(e)
  }

}