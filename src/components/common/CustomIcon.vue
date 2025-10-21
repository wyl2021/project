<template>
  <svg :class="svgClass" aria-hidden="true" :style="svgStyle">
    <use :xlink:href="iconName"></use>
  </svg>
</template>

<script>
export default {
  name: 'CustomIcon',
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: [Number, String],
      default: 16
    },
    color: {
      type: String
    },
    className: {
      type: String,
      default: ''
    }
  },
  computed: {
    svgClass() {
      return [
        'custom-icon',
        this.className
      ]
    },
    iconName() {
      return `#icon-${this.name}`
    },
    svgStyle() {
      const style = {}
      if (this.size) {
        style.fontSize = typeof this.size === 'number' ? `${this.size}px` : this.size
      }
      if (this.color) {
        style.color = this.color
      }
      return style
    }
  }
}
</script>

<style scoped>
.custom-icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
  vertical-align: -0.2em;
  overflow: hidden;
}
</style>