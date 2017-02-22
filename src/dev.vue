<template>
  <div id="app" class="vue-chalkboard chalkboard">
    <vue-chalkboard v-model="points" v-on:drawn="onDrawn"/>
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
      points: []
    }
  },
  methods: {
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
