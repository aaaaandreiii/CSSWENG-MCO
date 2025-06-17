<script>
    let username = '';
    let email = '';
    let password = '';
    let confirmPassword = '';
    let error = '';

    function handleSignup() {
        if (!username || !email || !password || !confirmPassword) {
            error = 'Please fill in all fields.';
            return;
        }
        if (password !== confirmPassword) {
            error = 'Passwords do not match.';
            return;
        }
        window.location.href = '/login';
    }
</script>


<div style="display: flex; height: 100vh">
    <div id="white_box">
        <header class="header text-center font-bold">Sign Up</header>

        <div class="mt-13 mb-15">
            <div class="flex-col">
                <h1 class="text-lg">Username</h1>
                <input 
                    type="text" 
                    bind:value={username}
                    placeholder="Enter your username"
                    id="input"
                    class="gray3_txt"
                />
            </div>
            <div class="flex-col pt-6">
                <h1 class="text-lg">Email</h1>
                <input 
                    type="email" 
                    bind:value={email}
                    placeholder="Enter your email"
                    id="input"
                    class="gray3_txt"
                />
            </div>
            <div class="flex-col pt-6">
                <h1 class="text-lg">Password</h1>
                <input 
                    type="password" 
                    bind:value={password}
                    placeholder="Enter your password"
                    id="input"
                    class="gray3_txt"
                />
            </div>
            <div class="flex-col pt-6">
                <h1 class="text-lg">Confirm Password</h1>
                <input 
                    type="password" 
                    bind:value={confirmPassword}
                    placeholder="Re-enter your password"
                    id="input"
                    class="gray3_txt"
                />
            </div>
            {#if error}
                <div class="text-red-500 text-sm mt-2">{error}</div>
            {/if}
        </div>

        <button id="button" class="text-center font-semibold w-full mt-4" on:click={handleSignup}>
            SIGN UP
        </button>
        <div class="text-center p-5 mb-12">
            <a href="/login" class="text-center p-5 mb-12" style="display: block;">BACK TO LOGIN</a>
        </div>
    </div>
</div>