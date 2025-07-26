<script lang="ts">
	import { page } from '$app/stores';
	import '../app.css';
	import Header from "../components/Header.svelte";
	import Sidebar from "../components/Sidebar.svelte";
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { onMount } from 'svelte';
	let { children } = $props();
	
	const showSidebar = $derived($page.route.id !== '/login' && $page.route.id !== '/signup' && $page.route.id !== '/forgot_password');

// check if login page for diff bg color
	$effect(() => {
    if (browser) {
      const isLoginPage = $page.route.id === '/login' || $page.route.id === '/signup' || $page.route.id === '/forgot_password';
      document.body.classList.toggle('login-page', isLoginPage);
    }
  });

	function isTokenExpired(token: string): boolean{
		try{
			const expire = JSON.parse(atob(token.split('.')[1]));
			return Date.now() >= expire.exp * 1000;
		}catch(err){
			return true;
		}
	}

	async function handleExpiredLogout(token: string){
		alert("Your session has expired. You will be logged out.")
		try{
			await fetch(`${PUBLIC_API_BASE_URL}/api/logoutExpired`, {
				method: 'POST',
				headers: { 
					Authorization: `Bearer ${token}` 
				}
			});
		}catch(err){
			console.error("Error notifying expired token: ", err);
		}
		localStorage.removeItem('token');
		goto('/login');
	}

	onMount(() => {
		const token = localStorage.getItem('token');
		if(token && isTokenExpired(token)){
			handleExpiredLogout(token)
			return;	
		}

		const check = setInterval(() => {
			const token = localStorage.getItem('token');
			if(token && isTokenExpired(token)){
				clearInterval(check);
				handleExpiredLogout(token);
			}
		}, 2000);
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
