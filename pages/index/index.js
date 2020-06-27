import service from '../../api/api.js'
import host from '../../utils/config.js'
//获取应用实例
const app = getApp()

var videoAd = null

Page({
  data: {
    courses: [],
    select: 1,
    courseStatus: ['未完成', '已完成'],
    info: null,
    disableBursh: false,
    user: null,
    // 当前准备解锁的课程
    currentUnlockedCourse: null
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
      host.host = host.host1
    }

    // 在页面中定义激励视频广告
    // 在页面onLoad回调事件中创建激励视频广告实例
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-6f125785163e82b9'
      })
      videoAd.onLoad(() => {console.log("广告加载成功")})
      videoAd.onError((err) => {console.log("广告加载失败")})
      videoAd.onClose((res) => {
        console.log("广告关闭")
        // 用户点击了【关闭广告】按钮
        if (res && res.isEnded) {
          // 正常播放结束，可以下发游戏奖励
          console.log("ok")
          let currentCourse = this.data.currentUnlockedCourse
          if (currentCourse) {
            let courses = this.data.courses
            console.log(courses)
            for (var c of courses) {
              if (c.courseOpenId == currentCourse) {
                c.unlocked = true
                this.setData({
                  courses: courses
                })
                // 存储当前解锁的课程
                wx.setStorageSync('unlockedCourse', currentCourse)
                break
              }
            }
            // 刷新
            this.onShow()
          } else {
            wx.showToast({
              title: '解锁异常，请刷新后重试',
              icon: 'none'
            })
          }
        } else {
          // 播放中途退出，不下发游戏奖励
          console.log("not ok")
          wx.showToast({
            title: '中途退出无效',
            icon: 'none'
          })
        }
    })
    }
  },
    /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  onShow: function(forceRefresh) {
    console.log("index onShow")
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
        if (res != null && res != "") {
          wx.setStorageSync('courseId', res.courseId)
          wx.redirectTo({
            url: '../progress/progress',
          })
        } else {
          service.getThreadPoolState().then(res => {
            if (res) {
              console.log(res)
              that.setData({
                info: res
              })
            }
          })
          
          // 获取课程列表
          // forceRefresh是否强制刷新
          service.listCourse(user.user, user.cookie, forceRefresh).then(res => {

            wx.hideLoading()
            wx.stopPullDownRefresh()

            if (res && res.courseList) {
              // 解锁课程
              let unlockedCourse = wx.getStorageSync('unlockedCourse')
              for (var course of res.courseList) {
                if (unlockedCourse && unlockedCourse == course.courseOpenId) {
                  course.unlocked = true
                  break
                }
              }
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
    
    app.globalData.brush = dataset.type == 'add' ? false : true

    if (dataset.unlocked && dataset.unlocked === true) {
      
      var user = this.user;
      var that = this;
      if (user && user != null && user.cookie && user.cookie != null) {
        service.start(user.user, user.cookie, dataset.itemId, dataset.courseId, dataset.classId, dataset.type).then(res => {
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
    } else {
      wx.showModal({
        title: '提醒',
        content: '服务器需要资金支持，现播放广告后才可以刷课，请理解，谢谢',
        success: res =>{
          if (res.confirm) {
            this.setData({
              currentUnlockedCourse: dataset.courseId
            })
            // 用户触发广告后，显示激励视频广告
            if (videoAd) {
              videoAd.show().catch(() => {
                // 失败重试
                videoAd.load()
                  .then(() => videoAd.show())
                  .catch(err => {
                    console.log('激励视频 广告显示失败')
                  })
              })
            }
          }        
        }
      })
    }
  },
  onPullDownRefresh: function() {
    this.onShow(true)
  },
  changeTab: function(e) {
    this.setData({
      select: e.currentTarget.dataset.id
    })
  },
  swiperChangeTab: function(e) {
    this.setData({
      select: e.detail.current + 1
    })
  },
  refresh: function() {
    this.onShow();
  }
})