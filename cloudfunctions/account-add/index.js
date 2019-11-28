// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const coll = db.collection('account')

// 云函数入口函数
exports.main = async (event, context) => {

  //  const log = cloud.logger()

  const { OPENID, APPID } = cloud.getWXContext()

  const { avatarUrl, nickName, language, gender, country, province, city } = event

  try {
    return await coll.doc(OPENID).set({
      data: {
        avatar: avatarUrl,
        nickname: nickName,
        language: language,
        gender: gender,
        country: country,
        province: province,
        city: city,
        modifyTime: new Date(),
      }
    })
  } catch (e) {
    console.error(e)
  }

}