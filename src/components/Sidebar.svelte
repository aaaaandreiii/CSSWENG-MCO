<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    let selected = "dashboard";
	let tabs = [
		{ name: 'Dashboard', link: '/dashboard', icon: '../src/icons/home.svg' },
		{ name: 'Inventory', link: '/inventory', icon: '../src/icons/inventory.svg' },
		{
			name: 'Analytics',
			link: '/analytics',
			icon: '../src/icons/analytics.svg'
		},
        { name: 'Settings', link: '/settings', icon: '../src/icons/settings.svg'}
	];

    // make the selected tab ui based on current route on mount
    onMount(() => {
        const current = tabs.find(tab => tab.link === $page.url.pathname);
        if (current) selected = current.name;
    });
</script>


<nav >
    <img src = "../src/images/logo.png" alt = "logo" class = "pb-5"/>
    <ul><div class="justify-items-start">
            {#each tabs as tab, index}
                    <li class="flex items-center">
                        <a href={tab.link} class ="flex {selected === tab.name ? 'selected-tab' : ''}" id = "" on:click={() => selected = tab.name}>
                                <img src={tab.icon} alt="home" style="width: 30px" />
                                <p class="p-5">{tab.name}</p>
                        </a>
                    </li>
            {/each}
        </div>
    </ul>
    <ul class="absolute bottom-7 " >
        <li>
            <a href= "/profile" class ="items-center pb-8 flex gap-2">
                <div id = "pfp" class = "profile flex ">
                    <img  src="../src/icons/user.svg" alt = "pfp" style = "width:65px;"/>
                </div>
                <div class = "flex-col">
                    <h2 class = "text-lg">Username123</h2><p class = "gray3_txt text-sm">Auditor</p>
                </div>
            </a>
        </li>
        <li >
            <a href= /login class = "flex items-center gap-x-2 justify-center mr-4 bg-[#de0101] w-full py-1.5 rounded-lg">
                <img src= "../src/icons/logout-2.svg" alt="home" style="width: 23px"/>
                <p class = "font-medium" style = "font-size: 14px; color:#FFFFF">Log out</p>
            </a>

        </li>
    </ul>
</nav>

