<template>
  <div class="chalkboard">
    <ul class="chalkboard__nav" v-if="config.canvas.canDraw">
      <li class="chalkboard__nav-item"><i class="icon" :class="{'--active': mode === 'paint'}" v-on:click="changeMode('paint')" v-html="icons.write"></i></li>
      <li class="chalkboard__nav-item"><i class="icon" :class="{'--active': mode === 'erase'}" v-on:click="changeMode('erase')" v-html="icons.erase"></i></li>
    </ul>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
/**
 * Global config
 */
var config

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
        return config.canvas ? config.canvas.backgroundColor : '#000000'
      }
      return `#${(this.color).toString(16).repeat(3)}`
    }
  }
}

/**
* Simple is object check.
* @param item
* @returns {boolean}
*/
var isObject = function isObject (item) {
  return (item && typeof item === 'object' && !Array.isArray(item))
}

/**
* Deep merge two objects.
* @param target
* @param ...sources
*/
var merge = function merge (target, ...sources) {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        merge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }
  return merge(target, ...sources)
}

export default {
  name: 'chalkboard',
  props: ['value', 'configuration'],
  data () {
    return {
      mode: 'paint',
      icons: {
        write: require('!!raw!./assets/write.svg'),
        erase: require('!!raw!./assets/erase.svg')
      },
      points: [],
      canPaint: false,
      config: merge({
        canvas: {
          backgroundColor: '#444444',
          canDraw: true
        },
        tools: {
          paint: {
            size: 2
          },
          erase: {
            size: 25
          }
        }
      }, this.configuration)
    }
  },
  watch: {
    value (points) {
      this.points = points
      this.redraw()
    },
    'configuration.canvas.canDraw': {
      handler: function (newConfig) {
        this.config.canvas.canDraw = newConfig
        this.refresh()
        this.redraw()
      }
    }
  },
  mounted () {
    config = this.config
    this.defaultSetting()
    this.refresh()
  },
  methods: {
    /**
     * Set default setting
     */
    defaultSetting () {
      var ctx = this.$refs.canvas.getContext('2d')
      ctx.fillStyle = 'solid'
      ctx.lineWidth = 5
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
    },

    /**
     * Add event listeners to canvas element and apply default state
     */
    refresh () {
      this.$refs.canvas.removeEventListener('mousedown', this.handleMouseDown)
      this.$refs.canvas.removeEventListener('mousemove', this.handleMouseMove)
      this.$refs.canvas.removeEventListener('mouseup', this.disablePaint)
      this.$refs.canvas.removeEventListener('mouseleave', this.disablePaint)
      if (this.config.canvas.canDraw) {
        this.$refs.canvas.addEventListener('mousedown', this.handleMouseDown)
        this.$refs.canvas.addEventListener('mousemove', this.handleMouseMove)
        this.$refs.canvas.addEventListener('mouseup', this.disablePaint)
        this.$refs.canvas.addEventListener('mouseleave', this.disablePaint)
      }

      this.$refs.canvas.width = this.$refs.canvas.parentNode.clientWidth
      this.$refs.canvas.height = this.$refs.canvas.parentNode.clientHeight - 4

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
        var wrapper = event.target.parentNode
        var pos = wrapper.getBoundingClientRect()
        var point = new Point({
          x: event.pageX - pos.left,
          y: event.pageY - pos.top,
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
      var wrapper = event.target.parentNode
      var pos = wrapper.getBoundingClientRect()
      this.canPaint = true
      var point = new Point({
        x: event.pageX - pos.left,
        y: event.pageY - pos.top,
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
        ctx.lineWidth = this.config.tools[mode] ? this.config.tools[mode].size : this.config.tools.paint.size
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
      ctx.lineWidth = this.config.tools[last.mode] ? this.config.tools[last.mode].size : this.config.tools.paint.size
      ctx.stroke()
    },

    paintBackground () {
      var ctx = this.$refs.canvas.getContext('2d')
      var fillStyle = ctx.fillStyle

      ctx.fillStyle = this.config.canvas.backgroundColor
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
