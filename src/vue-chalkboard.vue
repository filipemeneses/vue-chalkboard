<template>
  <div class="chalkboard">
    <ul class="chalkboard__nav" v-if="config.canvas.canDraw">
      <li class="chalkboard__nav-item"><i class="icon" :class="{'--active': mode === 'paint'}" v-on:click="changeMode('paint')" v-html="icons.write"></i></li>
      <li class="chalkboard__nav-item"><i class="icon" :class="{'--active': mode === 'erase'}" v-on:click="changeMode('erase')" v-html="icons.erase"></i></li>
    </ul>
    <canvas ref="canvas"></canvas>
    <ul class="chalkboard__footer-nav">
      <li class="chalkboard__nav-item" v-if="config.canvas.canResize"><i class="icon" :class="{'--active': config.canvas.mode === 'landscape'}" v-on:click="toggleCanvasMode()" v-html="icons.landscape"></i></li>
    </ul>
  </div>
</template>

<script>
import debounce from 'debounce'

/**
 * Global config
 */
let config

/**
 * Point class used to paint board
 */
class Point {

  /**
   * @param  {Number}  [x=0]            x in canvas
   * @param  {Number}  [y=0]            y in canvas
   * @param  {Number}  [color=240]      0 to 255
   * @param  {Boolean} [dragging=false] If first click or holding
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
let isObject = function isObject (item) {
  return (item && typeof item === 'object' && !Array.isArray(item))
}

/**
* Deep merge two objects.
* @param target
* @param ...sources
*/
let merge = function merge (target, ...sources) {
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
  props: ['value', 'configuration', 'exportDelay'],
  data () {
    return {
      mode: 'paint',
      exportCanvasImageDelay: this.exportDelay || 500,
      icons: {
        write: require('!!raw!./assets/write.svg'),
        erase: require('!!raw!./assets/erase.svg'),
        landscape: require('!!raw!./assets/landscape.svg')
      },
      points: [],
      canPaint: false,
      config: merge({
        canvas: {
          backgroundColor: '#444444',
          canDraw: true,
          canResize: true,
          initialCanvas: null,
          modes: {
            landscape: {
              getSize () {
                let cache = {
                  width: this.$el.parentNode.dataset.sizeWidth,
                  height: this.$el.parentNode.dataset.sizeHeight
                }
                cache.width = this.$el.parentNode.dataset.sizeWidth = cache.width ? cache.width : this.$el.parentNode.clientWidth
                cache.height = this.$el.parentNode.dataset.sizeHeight = cache.height ? cache.height : this.$el.parentNode.clientHeight
                return {
                  width: cache.width,
                  height: cache.height
                }
              }
            },
            default: {
              getSize () {
                let cache = {
                  width: this.$refs.canvas.parentNode.dataset.sizeWidth,
                  height: this.$refs.canvas.parentNode.dataset.sizeHeight
                }
                cache.width = this.$refs.canvas.parentNode.dataset.sizeWidth = cache.width ? cache.width : this.$refs.canvas.parentNode.clientWidth
                cache.height = this.$refs.canvas.parentNode.dataset.sizeHeight = cache.height ? cache.height : this.$refs.canvas.parentNode.clientHeight
                return {
                  width: cache.width,
                  height: cache.height
                }
              }
            }
          },
          oldMode: null,
          mode: 'default' // Available modes: 'default', 'landscape'
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
    },
    'configuration.canvas.canResize': {
      handler: function (status) {
        this.config.canvas.canResize = status
      }
    },
    'configuration.canvas.mode': {
      handler: function (mode) {
        this.config.canvas.mode = mode
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
      let ctx = this.$refs.canvas.getContext('2d')
      config.canvas.modes['default'].sizeBasedOn = this.$refs.canvas.parentNode
      ctx.fillStyle = 'solid'
      ctx.lineWidth = 5
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
    },

    /**
     * Add event listeners to canvas element and apply default state
     */
    refresh () {
      this.addCanvasListeners()
      this.addResizeListeners()
      this.updateDimensions()
      this.redraw()
    },

    /**
    * Add event listeners to canvas element
    */
    addCanvasListeners () {
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
    },

    /**
    * Add event listeners to canvas element
    */
    addResizeListeners () {
      this.$refs.canvas.removeEventListener('resize', this.handleResize)
      this.$el.removeEventListener('resize', this.handleResize)
      this.$refs.canvas.addEventListener('resize', this.handleResize)
      this.$el.addEventListener('resize', this.handleResize)
    },

    /**
    * Updates component size
    */
    updateDimensions () {
      let mode = this.config.canvas.modes[this.config.canvas.mode]
      if (!mode) this.config.canvas.modes.default
      let oldSize = this.getCanvasSize()
      let newSize = mode.getSize.bind(this)()

      this.$refs.canvas.width = newSize.width
      this.$refs.canvas.height = newSize.height
      this.$el.style.width = newSize.width + 'px'
      this.$el.style.height = newSize.height + 'px'

      this.updatePointsThroughDimensions(oldSize, newSize)
      this.paintBackground()
    },

    /**
    * Get canvas size
    */
    getCanvasSize () {
      return {
        width: this.$refs.canvas.width,
        height: this.$refs.canvas.height
      }
    },

    /**
    * Updates points list though dimentions
    */
    updatePointsThroughDimensions (oldSize, newSize) {
      let ratio = {
        width: newSize.width / oldSize.width,
        height: newSize.height / oldSize.height
      }
      this.points = this.points.map(function (point) {
        point.x *= ratio.width
        point.y *= ratio.height
        return point
      })
      this.debounceExportCanvasImage = debounce(this.exportCanvasImage, this.exportCanvasImageDelay)

      this.$emit('input', this.points)
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
    * Toggles canvas mode between `landscape` and `default`
     */
    toggleCanvasMode () {
      config.canvas.oldMode = this.config.canvas.oldMode = this.config.canvas.mode
      config.canvas.mode = this.config.canvas.mode = this.config.canvas.mode === 'default' ? 'landscape' : 'default'

      this.$emit('modeChange', {oldMode: config.canvas.oldMode, currMode: config.canvas.mode})
      this.refresh()
    },

    /**
     * Refresh canvas listerners and size
     */
    handleResize () {
      Object.keys(this.config.canvas.modes).forEach(function (mode) {
        delete this.config.canvas.modes[mode].oldSize
      })
      this.refresh()
    },

    /**
     * Save point and redraw canvas
     * @param  {MouseEvent} event
     */
    handleMouseMove (event) {
      if (this.canPaint) {
        let wrapper = event.target.parentNode
        let pos = wrapper.getBoundingClientRect()
        let point = new Point({
          x: event.pageX - (document.body.scrollLeft || 0) - pos.left,
          y: event.pageY - (document.body.scrollTop || 0) - pos.top,
          dragging: true,
          mode: this.mode
        })
        this.savePoint(point)
        this.redraw()
        this.debounceExportCanvasImage(event)
      }
    },

    /**
     * Activates paint functionality, save point and redraw canvas
     * @param  {MouseEvent} event
     */
    handleMouseDown (event) {
      let wrapper = event.target.parentNode
      let pos = wrapper.getBoundingClientRect()
      this.canPaint = true
      let point = new Point({
        x: event.pageX - (document.body.scrollLeft || 0) - pos.left,
        y: event.pageY - (document.body.scrollTop || 0) - pos.top,
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
      let ctx = this.$refs.canvas.getContext('2d')
      let points = this.points

      this.paintBackground()

      let i
      let point
      let last = {
        color: null,
        mode: null
      }

      let drawPath = (mode) => {
        ctx.lineWidth = this.config.tools[mode] ? this.config.tools[mode].size : this.config.tools.paint.size
        ctx.stroke()
      }
      for (i = 0; i < points.length; i++) {
        point = new Point(points[i])
        let color = point.getHexColor()
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

    /**
     * Draw a base 64 image to canvas
     * @param  {String} base64Image Base 64 image
     */
    drawnImageForeground (base64Image) {
      let ctx = this.$refs.canvas.getContext('2d')

      if (!this.initialImage) {
        this.initialImage = new window.Image()
        this.initialImage.onload = () => {
          ctx.drawImage(this.initialImage, 0, 0, this.initialImage.width, this.initialImage.height, 0, 0, this.$refs.canvas.width, this.$refs.canvas.height)
        }
        this.initialImage.src = base64Image
      } else {
        ctx.drawImage(this.initialImage, 0, 0, this.initialImage.width, this.initialImage.height, 0, 0, this.$refs.canvas.width, this.$refs.canvas.height)
      }
    },

    /**
     * Paint a solid color to canvas
     * @param  {String} color Hexadecimal color
     */
    drawnSolidColorForeground (color) {
      let ctx = this.$refs.canvas.getContext('2d')
      ctx.fillStyle = color
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    },

    /**
     * Fill background with default color
     */
    paintBackground () {
      this.drawnSolidColorForeground(this.config.canvas.backgroundColor)
      if (this.config.canvas.initialCanvas) {
        this.drawnImageForeground(this.config.canvas.initialCanvas)
      }
    },

    /**
     * Export image
     */
    exportCanvasImage () {
      let base64Image = this.$refs.canvas.toDataURL()
      this.$emit('image', base64Image)
      return base64Image
    }
  }
}
</script>

<style scoped lang="scss">
.chalkboard {
  position: relative;
  cursor: default;
}
.chalkboard__nav, .chalkboard__footer-nav {
  position: absolute;
  padding: 0;
  margin: 0;
}
.chalkboard__nav {
  top: 0;
  left: 0;
  .chalkboard__nav-item {
    border-right: 1px solid rgba(255, 255, 255, .1);
  }
}
.chalkboard__footer-nav {
  bottom: 0;
  right: 0;
  .chalkboard__nav-item {
    border-left: 1px solid rgba(255, 255, 255, .1);
  }
}
.chalkboard__nav-item {
  display: block;
  float: left;
  padding: 0;
  padding: 16px;

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
