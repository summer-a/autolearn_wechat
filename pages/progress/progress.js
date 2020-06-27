import service from '../../api/api.js'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 课程信息
    course: null,
    // 定时器状态
    flashStateInterval: null,
    // 当前刷课的课程
    currCourse: null,
    // 公告
    notice: null,
    // qq群
    qq: 0,
    // 退出按钮的位置信息
    buttonInfo: null,
    // 是否有lodingModel在使用
    loading: false,
    // 控制台输出信息
    console: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      qq: app.globalData.qq,
      buttonInfo: app.globalData.buttonInfo
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    wx.showLoading({
      title: '载入中...',
    })

    // 更新状态
    this.setData({
      loading: true
    })

    // 通知
    service.notice().then(res => {
      this.setData({ notice: res == "" ? "暂无公告" : res})
    })

    let that = this;

    that.req()
    // 循环获取
    that.flashStateInterval = setInterval(() => {
      that.req();
    }, 5 * 1000)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    console.log('pro hide')
    wx.hideLoading()
    clearInterval(this.flashStateInterval);
    this.flashStateInterval = null;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    console.log('pro hide')
    wx.hideLoading()
    clearInterval(this.flashStateInterval);
    this.flashStateInterval = null;
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // 先清除定时器再刷新
    clearInterval(this.flashStateInterval);
    this.flashStateInterval = null;
    // 刷新
    this.onShow()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  /**
   * 用于点击取消任务
   */
  cancel: function() {
    clearInterval(this.flashStateInterval);
    this.flashStateInterval = null;
    var user = wx.getStorageSync('user')
    if (user != null && user != "" && user.user != null && user.user.userId != undefined) {
      service.cancel(user.user.userId).then(res => {
        wx.showToast({
          title: (res.msg == undefined || res.msg == "") ? "已被取消" : res.msg,
          duration: 2000,
          success: function() {
            wx.redirectTo({
              url: '../index/index',
            })
          }
        })
      })
    }
  },
  req: function() {

    var user = wx.getStorageSync('user');
    var courseId = wx.getStorageSync('courseId');

    if (user == null || user == '' || user.user == null){
      if (this.data.loading == true) {
        this.setData({
          loading: false
        })
        wx.hideLoading()
      }
      wx.stopPullDownRefresh()
      wx.redirectTo({
        url: '../login/login',
      })
      return ;
    }

    var that = this;
    service.taskState(user.user.userId).then(res => {
      if (res != null && res != "") {
        that.setData({
          currCourse: res
        })

        // 获取课程进度
        service.course(courseId, user.cookie).then(res => {
          console.log(res)
          if (this.data.loading == true) {
            that.setData({
              loading: false
            })
            wx.hideLoading()
          }
          wx.stopPullDownRefresh()

          if (res && res.process == 100 && app.globalData.brush == true) {
            wx.showToast({
              title: '刷课完成',
              icon: 'success',
              duration: 5000,
              complete: function() {

                // 刷课完调用取消任务操作
                that.cancel();
              }
            })
          } else if (res == null || res == "") {
            wx.redirectTo({
              url: '../login/login',
            })
          }
          that.setData({
            course: res
          })
        }).catch(err => {
          if (this.data.loading == true) {
            that.setData({
              loading: false
            })
            wx.hideLoading()
          }
          wx.stopPullDownRefresh()
        })
      } else {
        clearInterval(that.flashStateInterval);
        that.flashStateInterval = null;

        wx.showToast({
          title: '获取状态失败',
          icon: 'none',
          duration: 2000,
          complete: function() {
            wx.redirectTo({
              url: '../index/index',
            })
          }
        })
      }
    })
  }
})