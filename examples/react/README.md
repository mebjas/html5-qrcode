# html5-qrcode with React
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K" width="200px"><br>
[reactjs.org](https://reactjs.org/) | `Support Level` = `Strong`

## How to build a `React Plugin / Component` using `html5-qrcode`
We shall be using React's recommendation on [Integrating with Other Libraries](https://reactjs.org/docs/integrating-with-other-libraries.html) to create a plugin for `React`.

### Download the latest library
You can download this from [Github release page](https://github.com/mebjas/html5-qrcode/releases) or [npm](https://www.npmjs.com/package/html5-qrcode). And include this in `index.html`.

```html
<script src="html5-qrcode.min.js"></script>
```

### Create a new component `Html5QrcodeScannerPlugin`
You can write a custom plugin like this:

```js
class Html5QrcodeScannerPlugin extends React.Component {
    componentDidMount() {
        // Creates the configuration object for Html5QrcodeScanner.
        function createConfig(props) {
            var config = {};
            if (props.fps) {
            config.fps = props.fps;
            }
            if (props.qrbox) {
            config.qrbox = props.qrbox;
            }
            if (props.aspectRatio) {
            config.aspectRatio = props.aspectRatio;
            }
            if (props.disableFlip !== undefined) {
            config.disableFlip = props.disableFlip;
            }
            return config;
        }

        var config = createConfig(this.props);
        var verbose = this.props.verbose === true;

        // Suceess callback is required.
        if (!(this.props.qrCodeSuccessCallback )) {
            throw 'qrCodeSuccessCallback is required callback.';
        }

        this.html5QrcodeScanner = new Html5QrcodeScanner(
            'qr-code-full-region', config, verbose);
        this.html5QrcodeScanner.render(
            this.props.qrCodeSuccessCallback, this.props.qrCodeErrorCallback);
    }

    componentWillUnmount() {
        // TODO(mebjas): See if there is a better way to handle
        //  promise in `componentWillUnmount`.
        this.html5QrcodeScanner.clear().catch(error => {
            console.error('Failed to clear html5QrcodeScanner. ', error);
        });
    }

    render() {
        return <div id={'qr-code-full-region'} />;
    }
}
```

### Use this new component in your React app
A very crude example would be to
```js
ReactDOM.render(
    <div>
        <h1>Html5Qrcode React example!</h1>
        <Html5QrcodeScannerPlugin
            fps={10}
            qrbox={250}
            disableFlip={false}
            qrCodeSuccessCallback={console.log}
            qrCodeErrorCallback={console.error} />
    </div>,
    document.getElementById('root')
);
```

### Example implementation
You can find an example impelementation at [example.html](./example.html).

### Contributors
| Name | Profile|
| ----- | ------ |
| Andy Tenholder| [@AndyTenholder](https://github.com/AndyTenholder) |

### TODO(mebjas): Create and publish `Html5QrcodeScanner` as proper react plugin
It'd be great to publish this as a proper React plugin so every developer doesn't have to write custom React plugin to use this library.
