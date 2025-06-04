<script>
    let username = '';
    let password = '';
</script>


<div style = "display: flex;  height: 100vh">
<div id = "white_box">
    <header class = "header text-center font-bold">Log in</header>

    <div class = "mt-13 mb-15">
        <div class = "flex-col">
            <h1 class="text-lg">Username</h1>
            <input 
            type="text" 
            bind:value={username}
            placeholder="Type your username"
            id="input"
            class="gray3_txt"
            />
        </div>

        <div class = "flex-col pt-6">
            <h1 class = "text-lg">Password</h1>
            <input 
                type="password" 
                bind:value={password}
                placeholder="Type your password"
                id="input"
                class="gray3_txt"
            />
        </div>
        <h1 class = "gray2_txt font-bold text-right">Forgot password</h1>
    </div>


    <div id = "button" class = "text-center font-semibold">
        <a href = '/dashboard'>LOG IN</a>
    </div>
    <div class = "text-center p-5 mb-12">
        SIGN UP
    </div>
</div>
</div>