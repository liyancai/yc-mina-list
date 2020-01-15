/**
 * 日期格式化  yyyy-MM-dd
 */
const formatDate = date => {

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}
/**
 * 日期格式化  yyyy年M月d日
 */
const formatDateZh = timestamp => {

  let date = new Date(timestamp)

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return year + '年' + month + '月' + day + '日'
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 1天的时长
 * 返回毫秒数
 */
let totalDay = () => {
  return 24 * 60 * 60 * 1000
}
/**
 * 当月的时长
 * 返回毫秒数
 */
let totalMonth = () => {
  let now = new Date()
  now.setHours(0, 0, 0, 0)
  now.setDate(1)

  let currentYear = now.getFullYear()
  let currentMonth = now.getMonth()

  let nextMonth = null
  if (currentMonth == 11) {
    nextMonth = new Date(currentYear + 1, 0, 1)
  } else {
    nextMonth = new Date(currentYear, currentMonth + 1, 1)
  }

  return nextMonth.getTime() - now.getTime()
}
/**
 * 当年的时长
 * 返回毫秒数
 */
let totalYear = () => {
  let now = new Date()
  now.setHours(0, 0, 0, 0)
  now.setMonth(0, 1)

  let nextYear = new Date(now.getFullYear() + 1, 0, 1)

  return nextYear.getTime() - now.getTime()
}
/**
 * 一生的时长，平均寿命76.7岁（2017年）
 * 返回毫秒数
 */
let totalLife = () => {
  return (76.7 * 365 + 19) * 24 * 60 * 60 * 1000
}
/**
 * 当天已经度过的时间
 * 返回毫秒数
 */
let hasPassDay = (now) => {
  if (now == undefined || now == null) {
    now = new Date()
  }

  let today = new Date()
  today.setHours(0, 0, 0, 0)

  return now.getTime() - today.getTime()
}
/**
 * 当月已经度过的时间
 * 返回毫秒数
 */
let hasPassMonth = (now) => {
  if (now == undefined || now == null) {
    now = new Date()
  }

  let currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  return now.getTime() - currentMonth.getTime()
}
/**
 * 当年已经度过的时间
 * 返回毫秒数
 */
let hasPassYear = (now) => {
  if (now == undefined || now == null) {
    now = new Date()
  }

  let currentYear = new Date(now.getFullYear(), 0, 1)

  return now.getTime() - currentYear.getTime()
}
/**
 * 一生已经度过的时间
 * 返回毫秒数
 */
let hasPassLife = (born, now) => {
  if (now == undefined || now == null) {
    now = new Date()
  }

  return now.getTime() - born.getTime()
}

/**
 * 某一事件已经过去的时间
 * 返回 年、月、日、时、分、秒 的对象
 */
let eventHasPassTime = (eventTime, now) => {
  if (now == undefined || now == null) {
    now = new Date()
  }
  if (now.getTime() < eventTime.getTime()) {
    return {
      year: 0,
      month: 0,
      day: 0,
      hour: 0,
      minutes: 0,
      second: 0
    }
  }

  const _year = eventTime.getFullYear()
  const _month = eventTime.getMonth() + 1
  const _day = eventTime.getDate()
  const _hour = eventTime.getHours()
  const _minutes = eventTime.getMinutes()
  const _second = eventTime.getSeconds()

  let now_year = now.getFullYear()
  let now_month = now.getMonth() + 1
  let now_day = now.getDate()
  let now_hour = now.getHours()
  let now_minutes = now.getMinutes()
  let now_second = now.getSeconds()


  // 处理减法时的借位
  if (now_second < _second) {
    now_second += 60
    now_minutes -= 1
  }
  if (now_minutes < _minutes) {
    now_minutes += 60
    now_hour -= 1
  }
  if (now_hour < _hour) {
    now_hour += 24
    now_day -= 1
  }
  if (now_day < _day) {
    if ([1, 3, 5, 7, 8, 10, 12 - 12].indexOf(now_month - 1) > -1) {
      now_day += 31
    } else if ([4, 6, 9, 11].indexOf(now_month - 1) > -1) {
      now_day += 30
    } else {
      if (now_year % 4 == 0) {
        now_day += 29
      } else {
        now_day += 28
      }
    }
    now_month -= 1
  }
  if (now_month < _month) {
    now_month += 12
    now_year -= 1
  }

  // console.log(now_year + "_" + now_month + "_" + now_day + "_" + now_hour + "_" + now_minutes + "_" + now_second)

  return {
    year: now_year - _year,
    month: now_month - _month,
    day: now_day - _day,
    hour: now_hour - _hour,
    minutes: now_minutes - _minutes,
    second: now_second - _second
  }
}


module.exports = {
  formatDate,
  formatDateZh,
  totalDay,
  totalMonth,
  totalYear,
  totalLife,
  hasPassDay,
  hasPassMonth,
  hasPassYear,
  hasPassLife,
  eventHasPassTime
}
