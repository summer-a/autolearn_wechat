import service from '../../api/api.js'
import host from '../../utils/config.js'
//获取应用实例
const app = getApp()

Page({
  data: {
    courses: [],
    select: 1,
    courseStatus: ['未完成', '已完成'],
    info: null,
    disableBursh: false,
    user: null,
  },
  onLoad: function(options) {
    console.log('load')
    // 服务器切换
    let server = wx.getStorageSync('serverNo')
    if (server === 1) {
      host.host = host.host1
    } else if (server === 2) {
      host.host = host.host2
    } else {
      
    }
    
  },
    /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  onShow: function() {
    console.log("onShow")
    wx.showLoading({
      title: '更新数据...',
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

            wx.hideLoading()
            wx.stopPullDownRefresh()

            if (res != null && res != "" && res.courseList != "") {
              that.setData({
                courses: res.courseList
              })
            } else {
              // 登录过期
              wx.removeStorageSync('user')
              wx.redirectTo({
                url: '../login/login?msg=登录过期，请重新登录',
              })
            }
          }).catch(res => {

            wx.hideLoading()
            wx.stopPullDownRefresh()

            wx.removeStorageSync('user')
            wx.redirectTo({
              url: '../login/login?msg=登陆失败',
            })
          })
        }
      }).catch(err => {
        wx.hideLoading()
        wx.stopPullDownRefresh()
      })
    }
  },
  begin: function(e) {
    
    var dataset = e.currentTarget.dataset;
    if (dataset.type == 'add') {
      wx.showModal({
        title: '该功能尚未完成',
      })
      return;
    }
    var user = this.user;
    var that = this;
    if (user && user != null && user.cookie && user.cookie != null) {
      service.start(user.user, user.cookie, dataset.itemId, dataset.courseId, dataset.classId).then(res => {
        // 判断请求是否被拒绝
        if (res.code === 403) {
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        } else {
          wx.setStorageSync('courseId', dataset.itemId)
          // 刷新页面
          // that.onShow()
          wx.redirectTo({
            url: '../progress/progress',
          })
        }
      })
    }
  },
  onPullDownRefresh: function() {
    this.onShow()
  },
  changeTab: function(e) {
    console.log(e.currentTarget.dataset.id)
    this.setData({
      select: e.currentTarget.dataset.id
    })
  },
  swiperChangeTab: function(e) {
    console.log(e)
    this.setData({
      select: e.detail.current + 1
    })
  },
  refresh: function() {
    this.onShow();
  }
})