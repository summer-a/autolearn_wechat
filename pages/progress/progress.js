// pages/progress/progress.js
const app = getApp();
var api = app.globalData.api
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 重新获取状态
    //this.onLoad()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('pro hide')
    // clearInterval(this.flashStateInterval);
    // this.flashStateInterval = null;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('pro hide')
    clearInterval(this.flashStateInterval);
    this.flashStateInterval = null;
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

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
  cancel: function() {
    clearInterval(this.flashStateInterval);
    this.flashStateInterval = null;
    var user = wx.getStorageSync('user')
    wx.request({
      url: api + 'cancel',
      data: {
        userId: user.user.userId
      },
      success: function (data) {
        var d = data.data;
        if (d.code === 200 && d.data === true) {
          wx.showToast({
            title: d.msg,
            duration: 2000,
            success: function() {
              wx.redirectTo({
                url: '../index/index',
              })
            }
          })
        }
      }
    })
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
    
    wx.request({
      url: api + "state/task",
      data: { id: user.user.userId },
      success: (data) => {
        var d = data.data
        if (d != null && d != "" && d != undefined) {
          that.setData({ currCourse: d })
        } else {
          clearInterval(that.flashStateInterval);
          that.flashStateInterval = null;

          wx.showToast({
            title: '获取状态失败',
            icon: 'none',
            duration: 2000,
            success: function () {
              wx.redirectTo({
                url: '../index/index',
              })
              return;
            }
          })
          return;
        }
      }
    })

    wx.request({
      url: api + 'course',
      data: {
        id: courseId,
        cookie: user.cookie
      },
      success: function (data) {
        var d = data.data;
        if (d) {
          if (d.process == 100) {
            wx.showToast({
              title: '刷课完成',
              icon: 'success',
              duration: 5000,
              success: function() {
                wx.redirectTo({
                  url: '../index/index',
                })
              }
            })
          }
          that.setData({ course: d })
          wx.hideLoading()
        }
      }
    })
  },
  onPullDownRefresh: function () {
    this.onLoad()
    wx.stopPullDownRefresh()
  },
})