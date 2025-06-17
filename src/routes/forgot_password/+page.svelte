<script>
    let email = '';
    let error = '';
    let sent = false;

    function handleForgotPassword() {
        if (!email) {
            error = 'Please enter your email.';
            return;
        }

        sent = true;
        error = '';
    }
</script>

<div style="display: flex; height: 100vh; justify-content: center; align-items: center;">
    <div id="white_box" style="display: flex; flex-direction: column; align-items: center;">
        <header class="header text-center font-bold">Forgot Password</header>

        <div class="mt-13 mb-15">
            {#if !sent}
                <div class="text-gray-600 text-sm mb-4">
                    Please enter the email address connected to your account.<br>
                    Instructions to reset your password will be sent to your email.
                </div>
                <div class="flex-col">
                    <h1 class="text-lg">Email</h1>
                    <input 
                        type="email" 
                        bind:value={email}
                        placeholder="Enter your email"
                        id="input"
                        class="gray3_txt"
                    />
                </div>
                {#if error}
                    <div class="text-red-500 text-sm mt-2">{error}</div>
                {/if}
                <button id="button" class="text-center font-semibold w-full mt-4" on:click={handleForgotPassword}>
                    SEND RESET LINK
                </button>
                <a href="/login" class="text-center p-5 mb-12" style="display: block;">BACK TO LOGIN</a>
            {:else}
                <div class="text-green-600 text-center mt-8 mb-8">
                    A password reset link has been sent to your email.
                </div>
                <div class="text-center">
                    <a href="/login" class="text-center p-5 mb-12">BACK TO LOGIN</a>
                </div>
            {/if}
        </div>
    </div>
</div>