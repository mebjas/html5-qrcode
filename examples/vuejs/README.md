# html5-qrcode with vue.js
<img src="https://vuejs.org/images/logo.png" width="200px"><br>
[vuejs.org](https://vuejs.org/) | `Support Level` = `Strong`

## How to build a `vue.js` component using `html5-qrcode`

### Include the js library in your project
```html
<script src="https://unpkg.com/html5-qrcode/minified/html5-qrcode.min.js"></script>
```

### Use a `qrcode-scanner` component
```js
Vue.component('qrcode-scanner', {
    props: {
        qrbox: Number,
        fps: Number,
    },
    template: `<div id="qr-code-full-region"></div>`,
    mounted: function () {
        var $this = this;
        var config = { fps: this.fps ? this.fps : 10 };
        if (this.qrbox) {
            config['qrbox'] = this.qrbox;
        }

        function onScanSuccess(qrCodeMessage) {
            $this.$root.$emit('decodedQrCode', qrCodeMessage);
        }
        
        var html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-code-full-region", config);
        html5QrcodeScanner.render(onScanSuccess);
    }
});
```

### And place it in the DOM as component
```html
<qrcode-scanner
    v-bind:qrbox="250" 
    v-bind:fps="10" 
    style="width: 500px;">
</qrcode-scanner>
```

### Add listener to listen to scanned code
You can consume the scanned code by listening to `decodedQrCode` event
