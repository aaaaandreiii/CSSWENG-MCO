<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		// Check if user has a valid token
		const token = localStorage.getItem('actkn');
		if (token) {
			// If logged in, go to dashboard
			goto('/dashboard');
		} else {
			// If not logged in, go to login page
			goto('/login');
		}
	});
</script>

<!-- Show a loading message while redirecting -->
<div class="flex items-center justify-center min-h-screen">
	<div class="text-center">
		<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
		<p class="text-gray-600">Loading...</p>
	</div>
</div>