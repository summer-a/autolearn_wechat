//app.js
App({
  onLaunch: function() {

    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()

      updateManager.onCheckForUpdate(function(res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success(res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })

          updateManager.onUpdateFailed(function () {
            // 新版本下载失败
            wx.showModal({
              title: '新版本已更新',
              content: '新版本已经上线了，请重新搜索打开该小程序哟~'
            })
          })
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
    
  },
  globalData: {
    userInfo: null,
    qq: 994580946,
    notice: '通知区域'
  }
})