// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const coll = db.collection('plan')
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  // const log = cloud.logger()

  const { OPENID, APPID } = cloud.getWXContext()

  const { action, plan } = event

  let _data = {}
  if (action == 'modifyDayStatus') {
    _data = {
      detail: plan.detail,
      modifyTime: new Date(),
    }
  }

  try {
    return await coll.doc(plan._id).update({
      data: _data
    })
  } catch (e) {
    console.error(e)
  }

}
