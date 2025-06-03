<script lang="ts">
	import '../app.css';
	import Header from "../components/Header.svelte";
	import Sidebar from "../components/Sidebar.svelte";

	let { children } = $props();
</script>

<div class = "flex">
	<!-- <div>
		<Header />
	</div> -->
	
	<aside class = "sidebar">
		<Sidebar />
	</aside>

	<div class = "main">
		{@render children()}
	</div>
	
</div>

