<template>
  <div class="chalkboard">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
class Point {
  constructor ({x = 0, y = 0, color = 240, dragging = false}) {
    this.x = x
    this.y = y
    this.color = color
    this.dragging = dragging

    this.getHexColor = getColor => {
      return `#${(this.color).toString(16).repeat(3)}`
    }
  }
}
export default {
  name: 'chalkboard',
  props: ['value'],
  data () {
    return {
      points: [],
      canPaint: false
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

      this.paintBackground()
    },

    /**
     * Disable paint functionality
     */
    disablePaint () {
      this.canPaint = false
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
          dragging: true
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
        y: event.pageY - event.target.offsetTop
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
      ctx.beginPath()

      for (var i = 0; i < points.length; i++) {
        var point = points[i]
        ctx.strokeStyle = point.getHexColor()
        if (!point.dragging) {
          ctx.moveTo(point.x, point.y)
        }
        ctx.lineTo(point.x, point.y)
      }
      ctx.stroke()
    },

    paintBackground () {
      var ctx = this.$refs.canvas.getContext('2d')
      var fillStyle = ctx.fillStyle

      ctx.fillStyle = '#444444'
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.fillStyle = fillStyle
    }
  }
}
</script>

<style scoped lang="scss">
.chalkboard canvas{
  border: 1px solid #ccc;
}
</style>
