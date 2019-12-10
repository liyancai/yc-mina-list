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

  // 内容审核
  let _res = await msgSecCheck(title)
  if (!_res || _res.errCode != 0) {
    return {
      errCode: 87014
    }
  }

  try {
    let _now = new Date()
    return await coll.add({
      data: {
        projectId: projectId,
        title: title,
        author: OPENID,
        completer: '',
        done: false,
        createTime: _now,
        modifyTime: _now,
      }
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
