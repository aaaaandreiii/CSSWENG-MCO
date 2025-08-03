<script lang="ts">
	import { page } from '$app/stores';
	import Sidebar from "../components/Sidebar.svelte";
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { onMount } from 'svelte';
	import '../app.css';

	//header
	import Header from '../components/Header.svelte';
	import { derived } from 'svelte/store';

	function formatTitle(path: string | null): string {
		if (!path) return 'Unknown Page';
		const lastSegment = path.split('/').filter(Boolean).pop() || '';
		return lastSegment.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
	}

	const pageTitle = derived(page, ($page) =>
		$page.route.id === '/' ? 'Dashboard' : formatTitle($page.route.id)
	);


	let { children } = $props();
	
	const showSidebar = $derived($page.route.id !== '/login' && $page.route.id !== '/signup' && $page.route.id !== '/forgot_password' && $page.route.id !== '/');

	// check if login page for diff bg color
	$effect(() => {
		if (browser) {
			const isLoginPage = $page.route.id === '/login' || $page.route.id === '/forgot_password';
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

	// new state for expiry modal
	import { writable } from 'svelte/store';
	const showSessionExpired = writable(false);

	async function handleExpiredLogout(token: string){
		// notify server (optional)
		try {
			await fetch(`${PUBLIC_API_BASE_URL}/api/logoutExpired`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` }
			});
		} catch(err) {
			console.error("Error notifying expired token: ", err);
		}
		localStorage.removeItem('token');
		// show our custom modal instead of immediate redirect
		showSessionExpired.set(true);
	}

	function redirectToLogin() {
		showSessionExpired.set(false);
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

	import { dev } from '$app/environment';

	// Testing function to create token with custom expiry (development only)
	if (dev && browser) {
		(window as any).setTokenExpiry = (minutesFromNow: number) => {
			const currentToken = localStorage.getItem('token');
			if (!currentToken) {
				console.log('No token found');
				return;
			}
			
			try {
				const parts = currentToken.split('.');
				const payload = JSON.parse(atob(parts[1]));
				
				// Set new expiry time
				payload.exp = Math.floor(Date.now() / 1000) + (minutesFromNow * 60);
				
				const newToken = parts[0] + '.' + btoa(JSON.stringify(payload)) + '.' + parts[2];
				localStorage.setItem('token', newToken);
				
				console.log(`Token expiry set to ${minutesFromNow} minutes from now`);
				console.log(`Expires at: ${new Date(payload.exp * 1000).toLocaleString()}`);
			} catch(err) {
				console.error('Error setting token expiry:', err);
			}
		};
	}
	// to test token expiry, type in dev console: setTokenExpiry(0); to expire immediately when logged in
</script>
{#if $showSessionExpired}
  <div class="modal-backdrop">
	<div class="modal-box">
	  <h2 class="text-xl font-bold mb-4">Session Expired</h2>
	  <p class="mb-6">Your session has expired. Please log in again.</p>
	  <button
		class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
		onclick={redirectToLogin}
	  >
		Go to Login
	  </button>
	</div>
  </div>
{/if}

{#if showSidebar}
	<Header {pageTitle} />
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
