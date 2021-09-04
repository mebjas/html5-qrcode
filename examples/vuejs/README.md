# html5-qrcode with vue.js
<img src="https://vuejs.org/images/logo.png" width="200px"><br>
[vuejs.org](https://vuejs.org/) | `Support Level` = `Strong`

## How to create a `vue.js` component for `html5-qrcode`

### Include the js library in your project

```html
<script src="https://unpkg.com/html5-qrcode"></script>
```

### Create a `qrcode-scanner` component

```js
Vue.component('qrcode-scanner', {
  props: {
    qrbox: {
      type: Number,
      default: 250
    },
    fps: {
      type: Number,
      default: 10
    },
  },
  template: `<div id="qr-code-full-region"></div>`,
  mounted () {
    const config = {
      fps: this.fps,
      qrbox: this.qrbox,
    };
    const html5QrcodeScanner = new Html5QrcodeScanner('qr-code-full-region', config);
    html5QrcodeScanner.render(this.onScanSuccess);
  },
  methods: {
    onScanSuccess (decodedText, decodedResult) {
      this.$emit('result', decodedText, decodedResult);
    }
  }
});
```

### Usage

```vue
<template>
  <qrcode-scanner
    :qrbox="250" 
    :fps="10" 
    style="width: 500px;"
    @result="onScan"
  />
</template>

<script>
export default {
  methods: {
    onScan (decodedText, decodedResult) {
      // handle the message here :)
    }
  }
}
</script>
```

### Contributors
| Name | Profile|
| ----- | ------ |
| Jofferson Ramirez Tiquez | [@jofftiquez](https://github.com/jofftiquez) |
