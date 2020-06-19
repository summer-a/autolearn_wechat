// component/footer/footer.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    footerInfo: ''
  },

  /**
   * 组件所在页面的生命周期函数
   */
  pageLifetimes: {
    show: function () {
      console.log("组件所在页面 显示")
      let app = getApp()
      this.setData({
        footerInfo: 'QQ群:' + app.globalData.qq
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

  }
})
