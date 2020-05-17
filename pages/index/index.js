//index.js
//获取应用实例
const app = getApp()
var api = app.globalData.api

Page({
  data: {
    courses: [],
    info: null,
    disableBursh: false
  },
  onLoad: function (options) {
    console.log('load')

    var that = this;
    var user = wx.getStorageSync('user')
    if (user == null || user == "" || user == undefined) {
      wx.redirectTo({
        url: '../login/login',
      })
    }
    
    // 判断是否已经有任务在进行
    wx.request({
      url: api + "state/task",
      data: {id: user.user.userId},
      success: function(data) {
        var d = data.data
        if (d != null && d != "" && d != undefined) {
          wx.setStorageSync('courseId', d.courseId)
          wx.redirectTo({
            url: '../progress/progress',
          })
        }
      }
    })

    if (user && user.cookie) {
      // 线程池信息
      var that = this;
      wx.request({
        url: api + "/threadpool/info",
        success: function(data) {
          console.log(data)
          var d = data.data
          if (d) {
            that.setData({info: d})
          }
        }
      })
      // 课程列表
      wx.request({
        url: api + "course/list",
        data: { user: user.user, cookie: user.cookie },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (data) {
          // console.log(data.data.courseList)
          that.setData({ courses: data.data.courseList })
        }, fail: function (data) {
          console.log(data)
        }
      })
    } else {
      wx.redirectTo({
        url: '../login/login?msg=登录过期，请重新登录',
      })
    }
  },
  begin: function(e) {
    var dataset = e.currentTarget.dataset;
    var user = wx.getStorageSync('user');
    var that = this;
    if (user && user != null && user.cookie && user.cookie != null) {
      wx.request({
        url: api + "start",
        data: {
          user: user.user, 
          cookie: user.cookie,
          courseId: dataset.itemId,
          courseOpenId: dataset.courseId,
          openClassId: dataset.classId
        },
        method: 'get',
        success: function(data) {
          console.log(data)
          // 判断请求是否被拒绝
          var d = data.data;
          if (d.code === 403) {
            wx.showToast({
              title: d.msg,
              icon: 'none'
            })
          } else {
            wx.setStorageSync('courseId', dataset.itemId)
            // 刷新页面
            that.onLoad()
          }
          
        }
      })
    }
  },
  onPullDownRefresh: function () {
    this.onLoad()
    wx.stopPullDownRefresh()
  },
  logout: function () {
    wx.clearStorageSync('user')
    wx.clearStorageSync('courseId')
    wx.redirectTo({
      url: '../login/login',
    })
  },
})
