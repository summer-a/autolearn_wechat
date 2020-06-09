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
  login(username, password) {
    let data = { username: username, password: password }
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
    return this._http.getRequest(host.host + '/threadpool/info').then(res => res.data)
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

  // 自定义请求
  request(url, data={}, header={}) {
    return this._http.getRequest(url, data, header).then(res => res.data)
  }
}

// 封装成服务
const service = new api()

export default service