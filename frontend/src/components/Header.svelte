<script lang="ts">
	import { type Readable } from 'svelte/store';
	export let pageTitle: Readable<string>;
</script>


<header class="ml-63 pl-8 pt-7 font-bold text-xl fixed gray1 z-15 w-fit">
	<h1>{$pageTitle}</h1>
</header>