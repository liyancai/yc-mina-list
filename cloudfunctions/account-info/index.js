// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const coll = db.collection('account')

// 云函数入口函数
exports.main = async (event, context) => {

  //  const log = cloud.logger()

  const { OPENID, APPID } = cloud.getWXContext()

  const { } = event

  try {
    return await coll.doc(OPENID).get()
  } catch (e) {
    console.error(e)
    return {
      data: {
        _id: OPENID
      },
      errMsg: "document.get:ok"
    }
  }

}