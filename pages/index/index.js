import service from '../../api/api.js'
//获取应用实例
const app = getApp()

Page({
  data: {
    courses: [],
    info: null,
    disableBursh: false,
    user: null,
    qq: 994580946,
    notice: null
  },
  onLoad: function(options) {
    console.log('load')
  },
  onShow: function() {
    console.log("onShow")
    wx.showLoading({
      title: '更新数据...',
    })
    
    // 更新通知
    service.notice().then(res => {
      this.setData({ notice: res == "" ? null : res })
    })

    var that = this;
    var user = wx.getStorageSync('user')
    this.user = user;
    if (user == null || user == "" || user.cookie == "") {
      wx.stopPullDownRefresh()
      wx.redirectTo({
        url: '../login/login',
      })
    } else {
      // 判断是否已经有任务在进行
      service.taskState(user.user.userId).then(res => {
        console.log(res)
        if (res != null && res != "") {
          wx.setStorageSync('courseId', res.courseId)
          wx.stopPullDownRefresh()
          wx.redirectTo({
            url: '../progress/progress',
          })
        } else {
          service.getThreadPoolState().then(res => {
            if (res) {
              that.setData({
                info: res
              })
            }
          })

          // 获取课程列表
          service.listCourse(user.user, user.cookie).then(res => {
            if (res != null && res != "" && res.courseList != "") {
              that.setData({
                courses: res.courseList
              })
            } else {
              // 登录过期
              wx.clearStorageSync('user')
              wx.redirectTo({
                url: '../login/login?msg=登录过期，请重新登录',
              })
            }
          }).catch(res => {
            wx.clearStorageSync('user')
            wx.redirectTo({
              url: '../login/login?msg=登陆失败',
            })
          }).finally(res => {
            wx.hideLoading()
            wx.stopPullDownRefresh()
          })
        }
      })
    }
  },
  begin: function(e) {
    var dataset = e.currentTarget.dataset;
    var user = this.user;
    var that = this;
    if (user && user != null && user.cookie && user.cookie != null) {
      service.start(user.user, user.cookie, dataset.itemId, dataset.courseId, dataset.classId).then(res => {
        console.log(res)
        // 判断请求是否被拒绝
        if (res.code === 403) {
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        } else {
          wx.setStorageSync('courseId', dataset.itemId)
          // 刷新页面
          that.onShow()
        }
      })
      // wx.request({
      //   url: api + "start",
      //   data: {
      //     user: user.user, 
      //     cookie: user.cookie,
      //     courseId: dataset.itemId,
      //     courseOpenId: dataset.courseId,
      //     openClassId: dataset.classId
      //   },
      //   method: 'get',
      //   success: function(data) {
      //     console.log(data)
      //     // 判断请求是否被拒绝
      //     var d = data.data;
      //     if (d.code === 403) {
      //       wx.showToast({
      //         title: d.msg,
      //         icon: 'none'
      //       })
      //       return;
      //     } else {
      //       wx.setStorageSync('courseId', dataset.itemId)
      //       // 刷新页面
      //       that.onLoad()
      //     }

      //   }
      // })
    }
  },
  onPullDownRefresh: function() {
    this.onShow()
  },
  logout: function() {
    wx.clearStorageSync('user')
    wx.clearStorageSync('courseId')
    wx.redirectTo({
      url: '../login/login',
    })
  },

})