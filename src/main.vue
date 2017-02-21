<template>
  <div id="app">
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
