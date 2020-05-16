// pages/login/login.js
import {config} from '../../utils/config.js'
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.msg) {
      wx.showToast({
        title: options.msg,
        icon: 'none',
        duration: 2000
      })
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('ready')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('show')
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
  /**
   * 表单提交
   */
  formSubmit: function(e) {
    wx.showLoading({
      title: '登录中……',
      mask: true
    })
    var form = e.detail.value;
    var that = this;
    wx.request({
      url: config.api + 'login',
      data: {
        username: form.username,
        password: form.password
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'post',
      success: function (data) {
        var data = data.data;
        if (data.data && data.code == 200) {
          console.log('登录成功')
          // 存储cookie
          wx.setStorageSync('user', data.data)
          // 跳转到主页
          wx.redirectTo({
            url: '../index/index',
          })
        } else {
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          })
        }
      },
      fail: function() {
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        })
      },
      complete: function() {
        wx.hideLoading();
      }
    })
  },
  
})