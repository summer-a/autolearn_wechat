// pages/progress/progress.js
import { config } from '../../utils/config.js'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    course: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    this.req()
    var interval = setInterval(this.req, 10 * 1000)

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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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
    var user = wx.getStorageSync('user')
    wx.request({
      url: config.api + 'cancel',
      data: {
        userId: user.user.userId
      },
      success: function (data) {
        console.log(data)
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
      url: config.api + 'course',
      data: {
        id: courseId,
        cookie: user.cookie
      },
      success: function (data) {
        console.log(data.data)
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
        }
      }
    })
  }
})