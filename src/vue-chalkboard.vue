<template>
  <div class="chalkboard">
    <ul class="chalkboard__nav">
      <li class="chalkboard__nav-item"><i class="icon" :class="{'--active': mode === 'paint'}" v-on:click="changeMode('paint')" v-html="icons.write"></i></li>
      <li class="chalkboard__nav-item"><i class="icon" :class="{'--active': mode === 'erase'}" v-on:click="changeMode('erase')" v-html="icons.erase"></i></li>
    </ul>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
/**
 * Global configuration
 */
var config = {
  canvas: {
    backgroundColor: '#444444'
  },
  tools: {
    paint: {
      size: 2
    },
    erase: {
      size: 25
    }
  }
}

/**
 * Point class used to paint board
 */
class Point {

  /**
   * @param  {Number}  [x=0]            [description]
   * @param  {Number}  [y=0]            [description]
   * @param  {Number}  [color=240]      [description]
   * @param  {Boolean} [dragging=false] [description]
   * @param  {String}  mode             'erase', 'write'
   */
  constructor ({x = 0, y = 0, color = 240, dragging = false, mode = null}) {
    this.x = x
    this.y = y
    this.color = color
    this.dragging = dragging
    this.mode = mode

    this.getHexColor = getColor => {
      if (this.mode === 'erase') {
        return config.canvas.backgroundColor
      }
      return `#${(this.color).toString(16).repeat(3)}`
    }
  }
}

export default {
  name: 'chalkboard',
  props: ['value'],
  data () {
    return {
      mode: 'paint',
      icons: {
        write: require('!!raw!./assets/write.svg'),
        erase: require('!!raw!./assets/erase.svg')
      },
      points: [],
      canPaint: false
    }
  },
  watch: {
    value (points) {
      this.points = points
      this.redraw()
    }
  },
  mounted () {
    this.defaultConfiguration()
    this.install()
  },
  methods: {
    /**
     * Set default configuration
     */
    defaultConfiguration () {
      var ctx = this.$refs.canvas.getContext('2d')
      ctx.fillStyle = 'solid'
      ctx.lineWidth = 5
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
    },

    /**
     * Add event listeners to canvas element and apply default state
     */
    install () {
      this.$refs.canvas.addEventListener('mousedown', this.handleMouseDown)
      this.$refs.canvas.addEventListener('mousemove', this.handleMouseMove)
      this.$refs.canvas.addEventListener('mouseup', this.disablePaint)
      this.$refs.canvas.addEventListener('mouseleave', this.disablePaint)

      this.$refs.canvas.width = this.$refs.canvas.parentNode.clientWidth
      this.$refs.canvas.height = this.$refs.canvas.parentNode.clientHeight

      this.paintBackground()
    },

    /**
     * Disable paint functionality
     */
    disablePaint () {
      this.canPaint = false
    },

    /**
     * Change brush mode
     * @param  {String} mode Possible values: paint, erase
     */
    changeMode (mode) {
      this.mode = mode
    },

    /**
     * Save point and redraw canvas
     * @param  {MouseEvent} event
     */
    handleMouseMove (event) {
      if (this.canPaint) {
        var point = new Point({
          x: event.pageX - event.target.offsetLeft,
          y: event.pageY - event.target.offsetTop,
          dragging: true,
          mode: this.mode
        })
        this.savePoint(point)
        this.redraw()
      }
    },

    /**
     * Activates paint functionality, save point and redraw canvas
     * @param  {MouseEvent} event
     */
    handleMouseDown (event) {
      this.canPaint = true
      var point = new Point({
        x: event.pageX - event.target.offsetLeft,
        y: event.pageY - event.target.offsetTop,
        mode: this.mode
      })
      this.savePoint(point)
      this.redraw()
    },

    /**
     * Save the point in global variable
     * @param  {Point} point
     */
    savePoint (point) {
      this.points.push(point)
      this.$emit('drawn', point)
      this.$emit('input', this.points)
    },

    /**
     * Redrawns canvas though global points variable
     */
    redraw () {
      var ctx = this.$refs.canvas.getContext('2d')
      var points = this.points

      this.paintBackground()

      var i
      var point
      var last = {
        color: null,
        mode: null
      }

      var drawPath = (mode) => {
        ctx.lineWidth = config.tools[mode] ? config.tools[mode].size : config.tools.paint.size
        ctx.stroke()
      }
      for (i = 0; i < points.length; i++) {
        point = new Point(points[i])
        var color = point.getHexColor()
        if (!point.dragging || !i) {
          drawPath(last.mode || point.mode)
          ctx.beginPath()
          ctx.moveTo(point.x, point.y)
        } else if (last.color !== null && last.color !== color) {
          drawPath(last.mode)
          ctx.beginPath()
        }
        ctx.lineTo(point.x, point.y)
        last.color = ctx.strokeStyle = color
        last.mode = point.mode
      }
      ctx.lineWidth = config.tools[last.mode] ? config.tools[last.mode].size : config.tools.paint.size
      ctx.stroke()
    },

    paintBackground () {
      var ctx = this.$refs.canvas.getContext('2d')
      var fillStyle = ctx.fillStyle

      ctx.fillStyle = config.canvas.backgroundColor
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.fillStyle = fillStyle
    }
  }
}
</script>

<style scoped lang="scss">
.chalkboard {
  position: relative;
  cursor: default;
}
.chalkboard__nav {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0;
  margin: 0;
}
.chalkboard__nav-item {
  display: block;
  float: left;
  padding: 0;
  padding: 16px;
  border-right: 1px solid rgba(255, 255, 255, .1);

  .icon {
    fill: #fff;
    opacity: .40;
    cursor: pointer;
    transition: opacity .28s ease;

    &.--active, &:hover {
      opacity: 1;
    }
  }

}
</style>
