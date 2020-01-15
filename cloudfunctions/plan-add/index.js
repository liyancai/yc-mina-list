// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const coll = db.collection('plan')

// 云函数入口函数
exports.main = async (event, context) => {

  //  const log = cloud.logger()

  const { OPENID, APPID } = cloud.getWXContext()

  const { name, days, avatar } = event

  // 内容审核
  let _res = await msgSecCheck(name)
  if (!_res || _res.errCode != 0) {
    return {
      errCode: 87014
    }
  }

  try {
    let _now = new Date()
    let _detail = []

    let _today = new Date(_now.toLocaleDateString()).getTime()
    let _firstDay = (_now.getHours < 12) ? _today : (_today + 24 * 3600 * 1000)

    for(let i=0; i<days; i++) {
     
      let _date = new Date(_firstDay + i * 24 * 3600 * 1000)

      _detail.push({
        timestamp: _date.getTime(),
        day: _date.getDate() == 1 ? ((_date.getMonth() + 1) + '月') : _date.getDate(), //日
        done: false,
      })
    }

    return await coll.add({
      data: {
        name: name,
        author: OPENID,
        avatar: avatar,
        detail: _detail,
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
  } catch (e) {
    console.error(e)
  }
}
