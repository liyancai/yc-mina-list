Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    msg: {
      type: String,
      value: '暂无内容! ^_^'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  lifetimes: {
    attached: function (e) {
    },
    ready: function () {
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {

  }
})
