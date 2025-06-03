<script>
    
	let tabs = [
		{ name: 'Dashboard', link: '/dashboard', icon: 'https://www.svgrepo.com/show/522557/home.svg' },
		{ name: 'Inventory', link: '/inventory', icon: 'https://www.svgrepo.com/show/522557/home.svg' },
		{
			name: 'Analytics',
			link: '/analytics',
			icon: 'https://www.svgrepo.com/show/524649/home-1.svg'
		}
	];
</script>


<nav>
    <img src = "../src/images/logo.png" alt = "logo" class = "pb-7"/>
    <ul><div class="justify-items-start">
            {#each tabs as tab, index}
                    <li class="flex items-center">
                        <a href={tab.link} class ="flex">
                                <img src={tab.icon} alt="home" style="width: 30px" />
                                <p class="pl-4 py-6">{tab.name}</p>
                        </a>
                    </li>
            {/each}
        </div>
    </ul>
    <ul class="absolute bottom-18">
        <li class="flex items-center">
            <img src="settings" alt = "settings" style = "width:30px"/>
            <p class="pl-6">Settings</p>
        </li>
        <li class = "flex pt-10 items-center">
            <img src="pfp" alt = "pfp" class = "profile"/>
            <div class = "flex-col pl-2.5">
                <h2>Username</h2>
                <p>Auditor</p>
            </div>
        </li>
        <li>
            <p class = "absolute right-0 pt-6" style = "font-size: 14px">Log out</p>
        </li>
    </ul>
</nav>

