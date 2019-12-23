// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = _.aggregate

// 云函数入口函数
exports.main = async (event, context) => {

  //  const log = cloud.logger()

  const { OPENID, APPID } = cloud.getWXContext()

  const { projectIds } = event

  try {

    return await db.collection('task').aggregate()
    .match({
      projectId: _.in(projectIds)
    })
    .group({
      _id: {
        projectId: '$projectId',
        done: '$done'
      },
      count: $.sum(1)
    })
    .group({
      _id: '$_id.projectId',
      detail: $.push({
        done: '$_id.done',
        count: '$count',
      })
    })
    .end()

  } catch (e) {
    console.error(e)
  }

}
