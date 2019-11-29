// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const coll = db.collection('project')
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  // const log = cloud.logger()

  const { OPENID, APPID } = cloud.getWXContext()

  const { action, projectId, project, name, avatar } = event

  let _data = {}
  if (action == 'modify') {
    _data = {
      name: name,
      modifyTime: new Date(),
    }
  } else if (action == 'done') {
    _data = {
      done: true,
      finishedTime: new Date(),
    }
  } else if (action == 'undone') {
    _data = {
      done: false,
    }
  } else if (action == 'join') {
    if (project.members.indexOf(OPENID) > -1) {
      return ''
    } else {
      _data = {
        members: _.push([OPENID]),
      }
    }
  }

  try {
    return await coll.doc(projectId).update({
      data: _data
    })
  } catch (e) {
    console.error(e)
  }

}