<template>
  <div id="app" class="vue-chalkboard chalkboard">
    <button href="#" v-on:click="toggleCanvasDraw">Toggle edit</button>
    {{config.canvas.canDraw}}
    <vue-chalkboard v-model="points" v-on:drawn="onDrawn" :configuration="config"/>
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
  .chalkboard {
    position: absolute;
    max-width: 500px;
    min-height: 800px;
    left: 20%;
  }
</style>
