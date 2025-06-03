<script>
    
	let tabs = [
		{ name: 'Dashboard', link: '/dashboard', icon: 'https://www.svgrepo.com/show/522557/home.svg' },
		{ name: 'Inventory', link: '/inventory', icon: 'https://www.svgrepo.com/show/522557/home.svg' },
		{
			name: 'Analytics',
			link: '/analytics',
			icon: 'https://www.svgrepo.com/show/524649/home-1.svg'
		},
        { name: 'Settings', link: '/settings', icon: 'https://www.svgrepo.com/show/522557/home.svg'}
	];
</script>


<nav>
    <img src = "../src/images/logo.png" alt = "logo" class = "pb-5"/>
    <ul><div class="justify-items-start">
            {#each tabs as tab, index}
                    <li class="flex items-center">
                        <a href={tab.link} class ="flex gap-x-6">
                                <img src={tab.icon} alt="home" style="width: 30px" />
                                <p class="py-4">{tab.name}</p>
                        </a>
                    </li>
            {/each}
        </div>
    </ul>
    <ul class="absolute bottom-7">
        <li>
            <a href= "/profile" class ="items-center pb-8 flex gap-3">
                <img src="https://www.svgrepo.com/show/522557/home.svg" alt = "pfp" class = "profile"/>
                <div class = "flex-col">
                    <h2>Username</h2><p>Auditor</p>
                </div>
            </a>
        </li>
        <li >
            <a href= /logout class = "flex items-center gap-x-2">
                <img src= "https://www.svgrepo.com/show/522557/home.svg" alt="home" style="width: 23px"/>
                <p style = "font-size: 14px">Log out</p>
            </a>

        </li>
    </ul>
</nav>

