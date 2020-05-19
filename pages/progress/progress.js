import service from '../../api/api.js'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    course: null,
    flashStateInterval: null,
    currCourse: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.showLoading({
      title: '载入中...',
    })

    let that = this;

    that.req()
    // 循环获取
    that.flashStateInterval = setInterval(() => {
      that.req();
    }, 10 * 1000)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('pro hide')
    wx.hideLoading()
    clearInterval(this.flashStateInterval);
    this.flashStateInterval = null;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('pro hide')
    wx.hideLoading()
    clearInterval(this.flashStateInterval);
    this.flashStateInterval = null;
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // 先清除定时器再刷新
    clearInterval(this.flashStateInterval);
    this.flashStateInterval = null;
    // 刷新
    this.onShow()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
   * 用于点击取消任务
   */
  cancel: function() {
    clearInterval(this.flashStateInterval);
    this.flashStateInterval = null;
    var user = wx.getStorageSync('user')
    if (user != null && user != "") {
      service.cancel(user.user.userId).then(res => {
        wx.showToast({
          title: (res.msg == undefined || res.msg == "") ? "已被取消" : res.msg,
          duration: 2000,
          success: function () {
            wx.redirectTo({
              url: '../index/index',
            })
          }
        })
      })
    }
  },
  logout: function() {
    clearInterval(this.flashStateInterval);
    this.flashStateInterval = null;
    wx.clearStorageSync('user')
    wx.clearStorageSync('courseId')
    wx.redirectTo({
      url: '../login/login',
    })
  },
  req: function () {

    var user = wx.getStorageSync('user');
    var courseId = wx.getStorageSync('courseId');

    var that = this;
    service.taskState(user.user.userId).then(res => {
      if (res != null && res != "") {
        that.setData({ currCourse: res })

        // 获取课程进度
        service.course(courseId, user.cookie).then(res => {
          if (res && res.process == 100) {
            wx.showToast({
              title: '刷课完成',
              icon: 'success',
              duration: 5000,
              complete: function () {

                // 刷课完调用取消任务操作
                that.cancel();
              }
            })
          } else if (res == null || res == "") {
            wx.redirectTo({
              url: '../login/login',
            })
          }
          that.setData({ course: res })
        }).finally(res => {
          wx.hideLoading()
          wx.stopPullDownRefresh()
        })
      } else {
        clearInterval(that.flashStateInterval);
        that.flashStateInterval = null;

        wx.showToast({
          title: '获取状态失败',
          icon: 'none',
          duration: 2000,
          complete: function () {
            wx.redirectTo({
              url: '../index/index',
            })
          }
        })
      }
    })
  }
})