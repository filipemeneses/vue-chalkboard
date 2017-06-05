<template>
  <main>

    <header class="header">
      <h1>vue-chalkboard</h1>
      <h2>A native Vue.js component that provides a simple canvas chalkboard.</h2>

      <section class="demo">
        <div class="chalkboard-component">
          <vue-chalkboard v-model="points" :configuration="config" @drawn="onDrawn" @modeChange="modeChange" @image="handleImage"/>
        </div>
        <img :src="imageSrc" width="100"/>
        {{imageSrc}}
      </section>
    </header>


    <section class="controls">

      <div class="json">
        <pre><code>{{config}}</code></pre>
      </div>
      <nav class="buttons">
        <p>Try to toggling the configurations:</p>
        <button v-on:click="toggleCanvasMode">View mode</button>
        <button v-on:click="toggleCanvasDraw">Draw locker</button>
        <button v-on:click="toggleCanvasCanResize">Resize locker</button>
      </nav>

    </section>

    <footer class="footer">
      <a href="https://github.com/filipemeneses/vue-chalkboard">Git</a>
    </footer>
  </main>
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
        canvas: {canDraw: true, mode: 'default', canResize: true, initialCanvas: window.localStorage.getItem('initialCanvas')}
      },
      points: []
    }
  },
  methods: {
    modeChange (data) {
      console.log(data.oldMode, data.newMode)
    },
    toggleCanvasCanResize () {
      this.config.canvas.canResize = !this.config.canvas.canResize
    },
    toggleCanvasMode () {
      this.config.canvas.mode = this.config.canvas.mode === 'default' ? 'landscape' : 'default'
    },
    toggleCanvasDraw () {
      this.config.canvas.canDraw = !this.config.canvas.canDraw
    },
    handleImage (image) {
      console.log('Saving canvas to localStorage as initialCanvas')
      window.localStorage.setItem('initialCanvas', image)
    },
    onDrawn (point) {
      console.log('New point', point)
    }
  }
}
</script>

<style media="screen" lang="scss">
  html, body {
    padding:0;
    margin:0;
    background-color: #FFFFFF;
  }
  h1, h2, h3 {
    margin: 0;
    color: #444;
    font-family: Georgia, serif;
  }
  h2, h3 {
    font-weight: 400;
    font-size: 16px;
  }

  .header {
    background-color: #F7F7F7;
    text-align: center;
    padding: 96px 0 32px 0;

    h2 {
      margin: 8px;
    }
  }

  section {
    h3 {
      margin: 16px 0 32px 0;
    }
  }

  .demo{
    padding: 32px;
  }
  .chalkboard-component {
    width: 800px;
    height: 300px;
    margin: 0 auto;
    border: 1px solid #E0E0E0;

    .chalkboard {
      width: 500px;
      height: 250px;
      margin: 0 auto;
    }
  }

  .controls{
    background-color: #FFF;
    width: 900px;
    overflow: hidden;
    margin: 0 auto;
    padding: 32px 32px 96px 32px;

    .json, .buttons {
      width: calc(50% - 64px);
      float: left;
      padding: 32px;
    }

    .json {
      background-color: #282C34;
      color: #A2A5AD;
      pre {
        margin: 16px;
      }
    }

    button {
      display: block;
      background-color: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,.2);
      color: #444;
      border:0;
      padding: 8px 16px;
      margin: 16px 0 ;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    p {
      margin: 0;
      color: #444;
    }
  }

  .footer {
    background-color: #F7F7F7;
    text-align: center;
    padding: 32px;

    a, a:link, a:visited, a:active {
      text-decoration: none;
      color:#444;
    }
    a:hover{
      color:#555;
    }
  }
</style>
