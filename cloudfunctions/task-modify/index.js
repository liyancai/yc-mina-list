// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const coll = db.collection('task')

// 云函数入口函数
exports.main = async (event, context) => {

  //  const log = cloud.logger()

  const { OPENID, APPID } = cloud.getWXContext()

  const { action, taskId, title } = event

  let _data = {}
  if (action == 'modify') {

    let _type = ''
    let _title = title

    const IMAGE_TAG = 'image://'
    if (_title.substr(0, IMAGE_TAG.length) == IMAGE_TAG) {
      _type = 'image'
      _title = _title.substr(IMAGE_TAG.length)
    }

    _data = {
      type: _type,
      title: _title,
      modifyTime: new Date(),
    }
  } else if (action == 'done') {
    _data = {
      completer: OPENID,
      done: true,
      finishedTime: new Date(),
    }
  } else if (action == 'undone') {
    _data = {
      done: false,
    }
  }
  
  try {
    return await coll.doc(taskId).update({
      data: _data
    })
  } catch (e) {
    console.error(e)
  }

}