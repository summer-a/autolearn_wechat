// templates/header/header.js
import service from '../../api/api.js'
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: '标题'
    },
    message: {
      type: String,
      value: ''
    },
    messageStyle: {
      type: String,
      value: 'color: #4c4c4c'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    qq: 0,
    buttonInfo: null,
    notice: null,
    user: null
  },

  /**
   * 组件的生命周期函数
   */
  lifetimes: {
    attached: function () {
      console.log("header attached")
    },
    moved: function () { 
      console.log("header moved")
    },
    detached: function () { 
      console.log("header detached")
    },
  },

  /**
   * 组件所在页面的生命周期函数
   */
  pageLifetimes: {
    show: function () {
      console.log("组件所在页面 显示")
      let user = wx.getStorageSync('user')
      this.setData({
        qq: app.globalData.qq,
        buttonInfo: app.globalData.buttonInfo,
        user
      })
      // 更新通知
      service.notice().then(res => {
        this.setData({ notice: res == "" ? '暂无公告' : res })
      })
    },
    hide: function () {
      console.log("组件所在页面 隐藏")
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    logout: function() {
      wx.removeStorageSync('user')
      wx.removeStorageSync('courseId')
      wx.redirectTo({
        url: '../../pages/login/login',
      })
    },
  }
})
