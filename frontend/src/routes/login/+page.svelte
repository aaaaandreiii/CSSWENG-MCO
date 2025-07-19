<script>
	let username = '';
	let password = '';

	async function login(){
		const res = await fetch('http://localhost:5000/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({username, password})
		});
		const data = await res.json();
		if(res.ok){
			localStorage.setItem('token', data.token);
			alert("Login Successful!");
			window.location.href = '/dashboard';
		}
		else{
			alert("Login failed");
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
					id="input"
					class="gray3_txt"
				/>
			</div>

			<div class="flex-scol pt-3">
				<h1 class="text-lg">Password</h1>
				<input
					type="password"
					bind:value={password}
					placeholder="Type your password"
					id="input"
					class="gray3_txt"
				/>
			</div>
			<h1 class="gray2_txt text-right font-bold"><a href="/forgot_password">Forgot password</a></h1>
		</div>

		<div class="p-5 text-center">
			<button
				on:click={login}
				id="button"
				class="mt-4 w-full text-center font-semibold"
				style="display: block;">LOGIN
			</button>
		</div>
		<div class="p-5 text-center">
			<a href="/signup">SIGN UP</a>
		</div>
	</div>
</div>
