<script>
	// import { PUBLIC_API_BASE_URL } from '$env/static/public';    //replaced by privateClient and publicClient
    import { publicClient } from '$lib/api/public.client';
    import privateClient   from '$lib/api/private.client';
	import { goto } from '$app/navigation';

	let username = '';
	let password = '';
	let showPassword = false;

	//login error
	let loginError = '';

	async function login(){
		if (!username.trim() || !password.trim()) {
			loginError = 'Please enter username and password.';
			return;
		}

		try {
			//fix: uses publicClient
			// const res = await fetch(`${PUBLIC_API_BASE_URL}/api/login`, {
			// 	method: 'POST',
			// 	headers: {
			// 		'Content-Type': 'application/json'
			// 	},
			// 	body: JSON.stringify({username, password})
			// });
			// const data = await res.json();
			// if(res.ok){
			// 	localStorage.setItem('token', data.token);
			// 	loginError = '';
			// 	window.location.href = '/dashboard';
			// }
			// else {
			// 	loginError = data?.message;
			// }

			const { data } = await publicClient.post('/api/login', { username, password });
			localStorage.setItem('actkn', data.token);
			localStorage.setItem('reftkn', data.refreshToken);

			loginError = '';
			goto('/dashboard');

		} catch (err) {
			console.error('Login error:', err);
			loginError = err.response?.data?.message || 'An error occurred. Please try again.';
		}
	}
</script>

<div style="display: flex;  height: 100vh">
	<div id="white_box">
		<header class="header text-center font-bold">Log in</header>
		<div class="mt-13 mb-10">
			<div class="flex-col">
				<h1 class="text-lg">Username</h1>
				<input
					type="text"
					bind:value={username}
					placeholder="Type your username"
					id="username"
					class="gray3_txt"
					on:keydown={(e) => { if (e.key === 'Enter') login(); }}
				/>
			</div>
			<div class="flex-scol pt-3">
				<h1 class="text-lg">Password</h1>
				<input
					type={showPassword ? "text" : "password"}
					bind:value={password}
					placeholder="Type your password"
					id="password"
					class="gray3_txt"
					on:keydown={(e) => { if (e.key === 'Enter') login(); }}
				/>
				<div class="flex items-center mt-2">
					<input
						type="checkbox"
						id="show-password"
						bind:checked={showPassword}
						class="mr-2"
					/>
					<label for="show-password" class="text-sm select-none">Show password</label>
				</div>
				{#if loginError}
					<p class="text-sm text-red-600 mt-2">{loginError}</p>
				{/if}
			</div>
		<h1 class="gray2_txt text-right font-bold">
			<a href="/forgot_password" class="transition-colors duration-150 hover:text-gray-800">Forgot password</a>
		</h1>
		</div>
		<div class="p-5 text-center">
			<button
				on:click={login}
				class="button mt-4 w-full text-center py-2"
				style="display: block;"
			>LOGIN
			</button>
		</div>
	</div>
</div>