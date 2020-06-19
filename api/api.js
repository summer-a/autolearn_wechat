import host from '../utils/config.js'
import http from '../utils/http.js'

class api{
  constructor() {
    this._http = new http
    this._http.setErrorHandler(this.errorHandler)
  }
  // 统一异常处理
  errorHandler(res) {
    console.error(res)
  }

  // 登录
  login(username, password, verifyCode, verifyCodeCookie) {
    let data = { username: username, password: password, verifyCode:verifyCode, verifyCodeCookie:verifyCodeCookie }
    let header = { 'content-type': 'application/x-www-form-urlencoded' }
    return this._http.postRequest(host.host + 'login', data, header).then(res => res.data)
  }

  // 获取验证码
  verifyCode() {
    return this._http.getRequest(host.host + 'verifyCode').then(res => res.data)
  }

  // 获取任务状态以判断是否已经有任务在进行
  taskState(userId) {
    let data = {id: userId}
    return this._http.getRequest(host.host + 'state/task', data).then(res => res.data)
  }

  // 获取线程池信息
  getThreadPoolState() {
    return this._http.getRequest(host.host + 'threadpool/info').then(res => res.data)
  }

  // 课程列表
  listCourse(user, cookie) {
    let data = { user: user, cookie: cookie}
    return this._http.getRequest(host.host + 'course/list', data).then(res => res.data)
  }

  // 开始任务
  start(user, cookie, courseId, courseOpenId, openClassId) {
    let data = {
      user: user,
      cookie: cookie,
      courseId: courseId,
      courseOpenId: courseOpenId,
      openClassId: openClassId
    }
    return this._http.getRequest(host.host + 'start', data).then(res => res.data)
  }

  // 取消任务 
  cancel(userId) {
    let data = {userId: userId}
    return this._http.getRequest(host.host + 'cancel', data).then(res => res.data)
  }

  // 当前课件信息
  course(courseId, cookie) {
    let data = {id: courseId, cookie: cookie}
    return this._http.getRequest(host.host + 'course', data).then(res => res.data)
  }

  // 获取通知
  notice() {
    // 通知服务器默认2
    return this._http.getRequest(host.host2 + 'msg', {}).then(res => res.data)
  }

  // 获取作业列表
  works(unprocessed, cookie) {
    let data = {unprocessed: unprocessed, cookie: cookie}
    return this._http.getRequest(host.host + 'listWork', data).then(res => res.data)
  }

  // 获取作业详情
  work(cookie, courseOpenId, openClassId, homeWorkId, activityId=null, hkTermTimeId, faceType=null) {
    let data = {cookie: cookie, courseOpenId: courseOpenId, openClassId: openClassId, homeWorkId: homeWorkId, activityId: activityId, hkTermTimeId: hkTermTimeId, faceType: faceType}
    return this._http.getRequest(host.host + 'getWork', data).then(res => res.data)
  }

  // 搜索答案
  searchAnswer(q) {
    let data = {q: q}
    return this._http.getRequest(host.host + 'answer', data).then(res => res.data)
  }

  // 提交作业
  submitWork(cookie, data) {
    data.cookie = cookie
    console.log(data)
    return this._http.postRequest(host.host + 'submitWork', data).then(res => res.data)
  }

  // 自定义请求
  request(url, data={}, header={}) {
    return this._http.getRequest(url, data, header).then(res => res.data)
  }
}

// 封装成服务
const service = new api()

export default service