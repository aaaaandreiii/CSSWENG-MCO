<script>
	let username = '';
	let password = '';
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
			<a
				href="/dashboard"
				id="button"
				class="mt-4 w-full text-center font-semibold"
				style="display: block;">LOGIN</a
			>
		</div>
		<div class="p-5 text-center">
			<a href="/signup">SIGN UP</a>
		</div>
	</div>
</div>
