// pages/login/login.js
import service from '../../api/api.js'
import host from '../../utils/config.js'
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    notice: '通知区域',
    account: '',
    verifyCodeImg: '',
    // 验证码输入框焦点
    verifyCodeFocus: false,
    // 服务器1情况
    host1: {},
    // 服务器2情况
    host2: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
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
  onReady: function() {
    console.log('ready')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    console.log('show')
    service.notice().then(res => {
      this.setData({ notice: res == "" ? "暂无公告" : res })
    })
    
    // 还原账号
    let account = wx.getStorageSync('account')
    if (account != '' && account != null) {
      this.setData({
        account: account
      })
    }

    // 还原服务器选择
    let serverNo = wx.getStorageSync('serverNo')
    this.setData({
      serverNo: serverNo
    })

    // 获取验证码
    this.getVerifyCode()

    // 获取服务器状态
    let url = 'threadpool/info'
    service.request(host.host1 + url).then(res => {
      res.idle = res.workThread < res.corePoolSize
      this.setData({
        host1: res
      })
    }).catch(res => {
      res.idle = null
      this.setData({
        host1: res
      })
    })
    service.request(host.host2 + url).then(res => {
      res.idle = res.workThread < res.corePoolSize
      this.setData({
        host2: res
      })
    }).catch(res => {
      res.idle = null
      this.setData({
        host2: res
      })
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    console.log('hide')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    console.log('unload')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    
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
   * 表单提交
   */
  formSubmit: function(e) {
    var form = e.detail.value;
    if (form.username == "" || form.password == "") {
      wx.showToast({
        title: '用户名和密码不能为空',
        icon: 'none',
      })
    } else if(form.verifyCode == "" || form.verifyCode.length < 4) {
      wx.showToast({
        title: '验证码有误',
        icon: 'none',
      })
    } else {
      wx.showLoading({
        title: '登录中……',
        mask: true
      })

      let verifyCodeCookie = wx.getStorageSync('verifyCodeCookie')

      var that = this;
      service.login(form.username, form.password, form.verifyCode, verifyCodeCookie).then(res => {
        console.log(res)
        
        wx.hideLoading()

        if (res.data && res.code == 200) {
          console.log('登录成功')
          // 存储cookie
          wx.setStorageSync('user', res.data)
          // 存储账号
          console.log(form.username)
          wx.setStorageSync('account', form.username)
          // 跳转到主页
          wx.redirectTo({
            url: '../index/index',
          })
        } else {
          wx.showToast({
            title: (res.msg != '' && res.msg != null) ? res.msg : '登录失败,请检查账号和密码是否正确',
            icon: 'none'
          })
        }
      }).catch(rec => {
        wx.hideLoading()
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        })
      })
    }
  },
  changeServer: function(e) {
    if (e.detail.value == "1") {
      host.host = host.host1
      wx.setStorageSync('serverNo', 1)
    } else {
      host.host = host.host2
      wx.setStorageSync('serverNo', 2)
    }
  },
  // 更换验证码
  changeVerifyCode: function() {
    this.getVerifyCode()
    this.setData({
      verifyCodeFocus: true
    })
  },
  // 获取验证码
  getVerifyCode: function() {
    service.verifyCode().then(res => {
      if (res && res.code === "200") {
        wx.setStorageSync('verifyCodeCookie', res.cookie)
        this.setData({
          verifyCodeImg: res.base64
        })
      }
    }).catch(err => {
      wx.showToast({
        title: '验证码获取失败，请重试',
        icon: 'none'
      })
    })
  }
})