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
    <div id="white_box" style="padding: 40px;">
        <header class="header text-center font-bold" style="font-size: 1.3rem; margin-bottom: 0.7rem;">Sign Up</header>

        <div class="mt-8 mb-10">
            <div class="flex-col mb-2">
                <h1 style="font-size: 1rem; margin-bottom: 0.3rem;">Username</h1>
                <input 
                    type="text" 
                    bind:value={username}
                    placeholder="Enter your username"
                    id="input"
                    class="gray3_txt"
                    style="font-size: 0.95rem; padding: 7px 10px;"
                />
            </div>
            <div class="flex-col mb-2">
                <h1 style="font-size: 1rem; margin-bottom: 0.3rem;">Email</h1>
                <input 
                    type="email" 
                    bind:value={email}
                    placeholder="Enter your email"
                    id="input"
                    class="gray3_txt"
                    style="font-size: 0.95rem; padding: 7px 10px;"
                />
            </div>
            <div class="flex-col mb-2">
                <h1 style="font-size: 1rem; margin-bottom: 0.3rem;">Password</h1>
                <input 
                    type="password" 
                    bind:value={password}
                    placeholder="Enter your password"
                    id="input"
                    class="gray3_txt"
                    style="font-size: 0.95rem; padding: 7px 10px;"
                />
            </div>
            <div class="flex-col mb-2">
                <h1 style="font-size: 1rem; margin-bottom: 0.3rem;">Confirm Password</h1>
                <input 
                    type="password" 
                    bind:value={confirmPassword}
                    placeholder="Re-enter your password"
                    id="input"
                    class="gray3_txt"
                    style="font-size: 0.95rem; padding: 7px 10px;"
                />
            </div>
            {#if error}
                <div class="text-red-500 text-xs ">{error}</div>
            {/if}
        </div>

        <button id="button" class="text-center font-semibold w-full" style="font-size: 1rem; padding: 8px 0;" on:click={handleSignup}>
            SIGN UP
        </button>
        <div class="text-center py-7">
            <a href="/login" class="text-center" style="font-size: 0.95rem; display: block;">BACK TO LOGIN</a>
        </div>
    </div>
</div>