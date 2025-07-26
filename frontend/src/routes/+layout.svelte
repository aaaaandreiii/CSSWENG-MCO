<script lang="ts">
	import { page } from '$app/stores';
	import '../app.css';
	import Header from "../components/Header.svelte";
	import Sidebar from "../components/Sidebar.svelte";
	import { browser } from '$app/environment';
	let { children } = $props();
	
	const showSidebar = $derived($page.route.id !== '/login' && $page.route.id !== '/signup' && $page.route.id !== '/forgot_password');

// check if login page for diff bg color
	$effect(() => {
    if (browser) {
      const isLoginPage = $page.route.id === '/login' || $page.route.id === '/signup' || $page.route.id === '/forgot_password';
      document.body.classList.toggle('login-page', isLoginPage);
    }
  });

</script>

{#if showSidebar}
	<aside class = 'sidebar'>
		<Sidebar />
	</aside>

	<div class = "main">
		{@render children()}
	</div>
{:else}
	<div>
		{@render children()}
	</div>
{/if}
