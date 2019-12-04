// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const coll = db.collection('project')
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  //  const log = cloud.logger()

  const { OPENID, APPID } = cloud.getWXContext()

  const { done } = event

  try {
    return await coll.where({
      members: _.in([OPENID]),
      done: done,
    })
    .orderBy('modifyTime', 'desc')
    .get()

  } catch (e) {
    console.error(e)
  }

}