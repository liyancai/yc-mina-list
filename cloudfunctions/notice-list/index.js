// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const coll = db.collection('notice')
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  //  const log = cloud.logger()

  const { OPENID, APPID } = cloud.getWXContext()

  const { showOnHomepage } = event

  let _data = {
    active: true
  }

  if(showOnHomepage) {
    _data = {
      active: true,
      showOnHomepage: true
    }
  }

  try {
    return await coll.where(_data)
    .orderBy('modifyTime', 'desc')
    .get()

  } catch (e) {
    console.error(e)
  }

}
