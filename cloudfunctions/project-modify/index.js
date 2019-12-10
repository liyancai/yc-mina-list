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

  const { action, projectId, project, name, avatar, cover } = event

  let _data = {}
  if (action == 'modify') {

    // 内容审核
    let _res = await msgSecCheck(name)
    if (!_res || _res.errCode != 0) {
      return {
        errCode: 87014
      }
    }

    _data = {
      name: name,
      avatar: avatar,
      cover: cover,
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

/**
 * 内容审核
 */
async function msgSecCheck(__content) {
  try {
    const result = await cloud.openapi.security.msgSecCheck({
      content: __content
    })
    return result;
  } catch (e) {
    console.error(e)
  }
}
