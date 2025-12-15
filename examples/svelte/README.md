# html5-qrcode with Svelte/SvelteKit

## Creating a `svelte` component for `html5-qrcode`

### Install the library in your project

```bash
npm i html5-qrcode
```

### Create a `Scanner.svelte` component

```svelte
// Scanner.svelte
<script lang="ts">
	import { Html5QrcodeScanner } from 'html5-qrcode';
	import { onMount } from 'svelte';

    const { onScanSuccess, onScanFail } = $props();

    // `onMount` indicates to the framework to render this component on the client-side.
    onMount(async () => {
        const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 350 }, false);
        scanner.render(onScanSuccess, onScanFail);
    })
</script>

<div id="reader"></div>
```

### Use the component

```svelte
<script lang="ts">
    // Import the Scanner component
	import Scanner from './Scanner.svelte';

    // Declare some local state
    const data = $state(undefined);

    // Define the callbacks
	const onScanSuccess = (decodedText, decodedResult) => {
		console.log(`Scan result: ${decodedText}`, decodedResult);
        data = decodedText;
	}
	const onScanFail = (error) => {
        console.warn(`Code scan error = ${error}`);
    }
</script>

<section>
    <Scanner {onScanSuccess} {onScanFail} />
</section>
```
