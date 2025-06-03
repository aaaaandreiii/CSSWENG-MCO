<script lang="ts">
	import '../app.css';
	import Header from "../components/Header.svelte";
	import Sidebar from "../components/Sidebar.svelte";

	let { children } = $props();
</script>

<div>
	<!-- <div>
		<Header />
	</div> -->
	
	<div>
		<Sidebar />
	</div>

	<div>
		{@render children()}
	</div>
	
</div>

