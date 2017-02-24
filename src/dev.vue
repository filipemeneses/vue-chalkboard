<template>
  <div id="app" class="vue-chalkboard chalkboard">
    <button href="#" v-on:click="toggleCanvasDraw">Toggle edit</button>
    {{config.canvas.canDraw}}
    <vue-chalkboard v-model="points" v-on:drawn="onDrawn" :configuration="config" @modeChange="modeChange"/>
  </div>
</template>

<script>
import VueChalkboard from './vue-chalkboard'

export default {
  name: 'app',
  components: {
    VueChalkboard
  },
  data () {
    return {
      config: {
        canvas: {canDraw: true}
      },
      points: []
    }
  },
  methods: {
    modeChange (data) {
      console.log(data.oldMode, data.newMode)
    },
    toggleCanvasDraw () {
      this.config.canvas.canDraw = !this.config.canvas.canDraw
    },
    onDrawn (point) {
      console.log('New point', point)
    }
  }
}
</script>

<style media="screen">
  #app {
    width: 800px;
    max-height: 400px;
    margin: 0 auto;
    border: 1px solid #444;
  }
  .chalkboard {
    width: 300px;
  }
</style>
