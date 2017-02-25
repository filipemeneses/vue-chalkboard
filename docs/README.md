
## Documentation

#### Configuration

Currently there is these configurations available

Attribute       | Default | Type | Description
---             | ---     | ---  | ---
canvas.canDraw  | true    | Boolean | Enable or disable mouse events
canvas.mode  | 'default'    | String | Canvas viewport mode. _There is two available: `default` and `landscape`_
canvas.canResize | true   | Boolean | Display or hide resize button


To use the configurations, use in your Vue component javascript:
```js
data () {
  return {
    config: {
      canvas: {
        canDraw: true,
        mode: 'default',
        modes: {
          landscape: {
            getSize () {
              return {x, y}
            }
          }
        },
        canResize: true
      }
    }
  }
}
```

and in your Vue component template:

```html
<chalkboard :configuration="config"/>
```

#### Events

Currently there is these events available

Event       | Return value | Description
---         | ---          | ---
drawn       | Point        | On point draw returns a point instance


#### Models


**Point**

Attribute   | Type |Description
---         | ---  | ---
x           | Number  | X position on canvas
y           | Number  | Y position on canvas
color       | Number  | Integer from 0 to 255
dragging    | Boolean | Either if is a click or hold
mode        | String  | Either if is `erase`, `write`

Methods     | Description
---         | ---
getHexColor | Returns hexadecimal color
