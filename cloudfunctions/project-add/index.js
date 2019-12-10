// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const coll = db.collection('project')

// 云函数入口函数
exports.main = async (event, context) => {

  //  const log = cloud.logger()

  const { OPENID, APPID } = cloud.getWXContext()

  const { cateId, name, avatar, color, maxNumAccount } = event

  // 内容审核
  let _res = await msgSecCheck(name)
  if (!_res || _res.errCode != 0) {
    return {
      errCode: 87014
    }
  }

  try {
    let _now = new Date()
    return await coll.add({
      data: {
        cate_id: cateId,
        name: name,
        avatar: avatar,
        color: color,
        author: OPENID,
        members: [OPENID],
        max_num_account: maxNumAccount,
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
    return result
  } catch(e) {
    console.error(e)
  }
}
