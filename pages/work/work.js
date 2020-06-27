// pages/work/work.js
import service from '../../api/api.js'
import util from '../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    work: null,
    param: null,
    questions: null,
    checked: [[]],
    submitData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let work = null;
    if (options == undefined || options == null || options == '') {
      work = this.data.work;
    } else {
      try {
        work = JSON.parse(options.data);
        this.setData({
          work: work
        })
      } catch (e) {
        wx.showToast({
          title: '数据异常，请重试:' + e,
          icon: 'none'
        })
        return;
      }
    }
    let cookie = wx.getStorageSync('user').cookie
    if (cookie != null) {
      service.work(cookie, work.courseOpenId, work.openClassId, work.homeworkId, null, work.hkTermTimeId, null).then(res => {
        if (res && res.code == 100 || res.code == 1) {
          let data = JSON.parse(res.redisData)
          if (data) {
            let questions = data.questions;
            console.log(questions)
            this.setData({
              questions: questions
            })
            // 初始化提交数据
            if (questions) {
              let data = []
              for (var i = 0; i < questions.length; i++) {
                let q = questions[i];
                let submitData = {
                  questionId: q.questionId,
                  sourceType: 1,
                  questionType: q.questionType,
                  questionScore: q.totalScore,
                  sortOrder: q.sortOrder,
                  answerTime: new Date().getTime() - (parseInt(Math.random() * 1000)),
                  stuAnswer: null,
                  paperStuQuestionId: res.param.uniqueId + "_" + i
                }
                data.push(submitData)
              }
              this.setData({
                submitData: data
              })
            }
          }
          // 提升性能
          res.redisData = null
          this.setData({
            param: res
          })

        } else {
          wx.showToast({
            title: res && res.msg ? res.msg : "该作业类型不支持",
            icon: 'none'
          })
        }
      }).catch(err => {
        wx.showToast({
          title: "作业获取失败",
          icon: 'none'
        })
      })
    } else {
      wx.showToast({
        title: 'Cookie不存在，请重新登录',
        icon: 'none'
      })
    }
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
  selectAnswer: function (e) {
    var index = e.currentTarget.dataset.index

    let checked = this.data.checked

    var submitData = this.data.submitData
    if (typeof (submitData[index[1]]) == 'undefined' || submitData[index[1]] == null) {
      submitData[index[1]] = {}
    }

    let _answer = ''
    // 判断题目类型
    if (index[0] === 1 || index[0] === 3) { // 单选 和 判断
      checked[index[1]] = []
      checked[index[1]][index[2]] = true

      // 填充答案 
      if (index[0] === 1) { // 单选
        _answer = this.data.questions[index[1]].answerList[index[2]].SortOrder
      } else { // 判断
        _answer = index[2]
      }

    } else if (index[0] === 2) { // 多选

      if (typeof (checked[index[1]]) == "undefined") {
        checked[index[1]] = []
      }

      checked[index[1]][index[2]] = !checked[index[1]][index[2]]
      // 填充答案
      let chk = checked[index[1]]
      if (chk && typeof (chk) != 'undefined' && chk != null) {
        let mutiplyAnswer = ''
        for (var i = 0; i < chk.length; i++) {
          if (chk[i] == true) {
            if (i == 0) {
              mutiplyAnswer += this.data.questions[index[1]].answerList[i].SortOrder
            } else {
              mutiplyAnswer += "," + this.data.questions[index[1]].answerList[i].SortOrder
            }
          }
        }
        _answer = mutiplyAnswer.startsWith(",") ? mutiplyAnswer.replace(",", "") : mutiplyAnswer

      }
    } else if (index[0] === 4 || index[0] === 5) { // 填空题，有多个
      _answer = this.data.questions[index[1]].answerList[index[2]].SortOrder
    }

    // 答案
    submitData[index[1]].stuAnswer = _answer

    this.setData({
      checked,
      submitData
    })
  },
  blurText: function (e) {
    let submitData = this.data.submitData
    let index = e.currentTarget.dataset.index
    submitData[index].stuAnswer = typeof (submitData[index].stuAnswer) == 'undefined' ? '' : e.detail.value
    this.setData({
      submitData
    })
  },
  blurInput: function (e) {
    let submitData = this.data.submitData
    let dataset = e.currentTarget.dataset
    let content = {
      "SortOrder": dataset.sort,
      "Content": e.detail.value
    }
    try {
      let stuAnswer = submitData[dataset.index[0]].stuAnswer
      submitData[dataset.index[0]].stuAnswer = typeof (stuAnswer) == 'undefined' || stuAnswer == null ? [] : stuAnswer

      let stuAns = submitData[dataset.index[0]].stuAnswer[dataset.index[1]]
      submitData[dataset.index[0]].stuAnswer[dataset.index[1]] = typeof (stuAns) == 'undefined' || stuAns == null ? '' : stuAns
      submitData[dataset.index[0]].stuAnswer[dataset.index[1]] = content
      this.setData({
        submitData
      })
    } catch (err) {
      wx.showToast({
        title: '数据异常',
      })
    }
  },
  searchAnswer: function () {
    try {
      this.searchAnswerFun(0, this.data.questions.length)
    } catch (err) {
      wx.showToast({
        title: '获取作业失败，请刷新重试' + err,
        icon: 'none'
      })
    }
  },
  searchAnswerFun: function (index, len) {
    if (index === len) {
      return
    }
    let questions = this.data.questions
    let q = questions[index]
    // console.log("原题:" + q.Title)
    let title = util.convertStr(q.Title).replace(/<[^>]+>/g, "")

    // 搜索答案
    service.searchAnswer(title).then(res => {
      wx.showToast({
        title: '正在搜索...',
        icon: 'none'
      })
      if (res.code === 1) {
        let answer = res.data.answer
        // 存储到questions
        if (q.questionType == 4 || q.questionType == 5) {
          try {
            let _answer = JSON.parse(answer)
            let _data = [];
            _data[_answer.SortOrder] = _answer.Content
            q.netAnswer = _data
          } catch (e) {
            q.netAnswer = answer.split("---")
          }
        } else {
          q.netAnswer = answer
        }

        this.setData({
          questions: questions
        })
        //
        let list = q.answerList

        let checked = this.data.checked

        // console.log("类型id：" + q.questionType + ", 类型名:" + q.queTypeName)
        // 防止undefined
        checked[index] = typeof (checked[index]) == "undefined" ? [] : checked[index]

        var sdata = this.data.submitData
        // 答案存储
        let _answer = ''
        /// 判断类型
        if (q.questionType == 1) {
          // 单选题
          for (var i = 0; i < list.length; i++) {
            // 题目答案
            let myAnswer = util.convertStr(list[i].Content).replace(/\s*/g, "")
            if (myAnswer == answer.replace(/\s*/g, "")) {
              checked[index][i] = true
              // 存储
              _answer = list[i].SortOrder
            }
          }
        } else if (q.questionType == 2) {
          // 选择题--多选用---分割
          let results = answer.split("---")
          let submitRes = ''
          for (var i = 0; i < list.length; i++) {
            let myAnswer = util.convertStr(list[i].Content).replace(/\s*/g, "")

            for (var r of results) {
              if (myAnswer == r.replace(/\s*/g, "")) {
                // 多选题
                checked[index][i] = true
                submitRes += "," + i
              }
            }
          }
          if (submitRes.startsWith(",")) {
            submitRes = submitRes.replace(",", "")
          }
          _answer = submitRes
        } else if (q.questionType == 3) {
          // 判断题
          let result = answer.trim()
          if (/对|yes|✓|✔|√|正确|T/.test(result)) {
            checked[index][1] = true
            _answer = 1
          } else if (/错|no|×|x|✘|错误|F/.test(result)) {
            checked[index][0] = true
            _answer = 0
          }
        } else if (q.questionType == 4 || q.questionType == 5) {

          let list = q.answerList
          let _answers = answer.trim().split("---")
          let r = []
          for (var i = 0; i < list.length; i++) {
            let content = {
              "SortOrder": list[i].SortOrder,
              "Content": _answers[i]
            }
            r.push(content)
          }
          _answer = r
        } else {
          _answer = answer.startsWith('抱歉找不到') ? '' : answer.trim()
        }

        // 答案
        sdata[index].stuAnswer = _answer
        // 存储
        this.setData({
          checked,
          submitData: sdata
        })

        // console.log(title + ":\n\t" + answer)
      }
    }).catch(err => {
      wx.showToast({
        title: '搜索失败' + err,
        icon: 'none'
      })
    })
    this.searchAnswerFun(index + 1, len)
  },
  submit: function () {

    wx.showModal({
      title: '提醒',
      content: '提交前建议请先检查一遍',
      cancelText: '好的',
      confirmText: '直接提交',
      success: res => {
        if (res.cancel) {
          return
        }
      },fail: err => {
        return
      }
    })

    // 封装
    let p = this.data.param.param
    if (!p) {
      wx.showToast({
        title: '参数为空，请刷新重试',
        icon: 'none'
      })
      return;
    }
    let data = {
      uniqueId: p.uniqueId,
      homeworkId: p.homeworkId,
      openClassId: p.openClassId,
      homeworkTermTimeId: p.hkTermTimeId,
      sourceType: 1,
      isDraft: 0,
      useTime: parseInt(Math.random() * 10000),
      timestamp: new Date().getTime(),
      data: JSON.stringify(this.data.submitData)
    }

    console.log(data)
    let cookie = wx.getStorageSync('user').cookie
    if (cookie != null && cookie != '') {
      service.submitWork(cookie, data).then(res => {
        if (res) {
          wx.showToast({
            title: '提交成功',
          })

          setTimeout(function () {
            wx.hideToast()
            wx.redirectTo({
              url: '../index/index',
            })
          }, 1500)
        }
      }).catch(res => {
        wx.showToast({
          title: '提交失败',
          icon: 'none'
        })
      })
    }
  }
})