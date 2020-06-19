// pages/work/works.js
import service from '../../api/api.js'
import formatTime from '../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    works: [],
    showWork: 0
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
    let cookie = wx.getStorageSync('user').cookie
    if (cookie != undefined && cookie != '') {
      let type = 0;
      service.works(type, cookie).then(res => {
        if (res.code == 1) {
          res.list.map(res => res +":::")
          console.log(res.list)
          this.setData({
            works: res.list
          })
        } else {
          wx.showToast({
            title: '获取作业失败',
            icon: 'none'
          })
        }
      }).catch(err => {
        console.log(err)
      })
    }
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

  showLabel: function(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      showWork: this.data.showWork == index ? -1 : index
    })
  },
  doWork: function(e) {
    let index = e.currentTarget.dataset.cindex;
    let works = this.data.works;
    
    if (works != null && !isNaN(index)) {
      let work = works[index]

      let windex = e.currentTarget.dataset.windex;
      let homeworkList = work.homeworkList;

      work = homeworkList[windex]

      wx.navigateTo({
        url: '../work/work?data=' + JSON.stringify(work),
      })
    }
  }
})