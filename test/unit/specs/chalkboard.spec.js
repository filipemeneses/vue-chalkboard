import Vue from 'vue'
import Chalkboard from 'src/vue-chalkboard'

describe('vue-chalkboard.vue', () => {
  it('should render correct contents', () => {
    const vm = new Vue({
      el: document.createElement('div'),
      render: h => h(Chalkboard)
    })
    expect(vm.$el.querySelector('canvas')).to.not.equal(null)
  })
})
