<script>
	let username = '';
	let password = '';
	let showPassword = false;

	async function login(){
		try {
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
		} catch (error) {
			console.error("Error during login:", error);
			alert("An error occurred. Please try again later.");
			return;
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
					type={showPassword ? "text" : "password"}
					bind:value={password}
					placeholder="Type your password"
					id="input"
					class="gray3_txt"
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
