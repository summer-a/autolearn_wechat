//index.js
//获取应用实例
import { config } from '../../utils/config.js'
const app = getApp()

Page({
  data: {
    courses: []
  },
  onLoad: function (options) {
    console.log('load')

    var that = this;
    var user = wx.getStorageSync('user')

    // 判断是否已经有任务在进行
    wx.request({
      url: config.api + "has/task",
      data: {id: user.user.userId},
      success: function(data) {
        console.log('载入')
        console.log(data.data)
        if (data.data != null && data.data != "") {
          wx.setStorageSync('courseId', data.data)
          wx.redirectTo({
            url: '../progress/progress',
          })
        }
      }
    })

    if (user && user.cookie) {
      // 线程池信息
      wx.request({
        url: '',
      })
      // 课程列表
      wx.request({
        url: config.api + "course/list",
        data: { user: user.user, cookie: user.cookie },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (data) {
          // console.log(data.data.courseList)
          that.setData({ courses: data.data.courseList })
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
    if (user && user.cookie) {
      wx.request({
        url: config.api + "start",
        data: {
          user: user.user, 
          cookie: user.cookie,
          courseId: dataset.itemId,
          courseOpenId: dataset.courseId,
          openClassId: dataset.classId
        },
        method: 'get',
        success: function(data) {
          console.log('课程选择')
          console.log(data)
          wx.setStorageSync('courseId', dataset.itemId)
          // 刷新页面
          that.onLoad()
        }
      })
    }
  }
})
