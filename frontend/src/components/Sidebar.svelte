<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	let selected = 'dashboard';
	let tabs = [
		{ name: 'Dashboard', link: '/dashboard', icon: '../src/icons/home.svg' },
		{ name: 'Inventory', link: '/inventory', icon: '../src/icons/inventory.svg' },
		{
			name: 'Analytics',
			link: '/analytics',
			icon: '../src/icons/analytics.svg'
		},
		{ name: 'Settings', link: '/settings', icon: '../src/icons/settings.svg' }
	];

	// update selected tab reactively when route changes
	$: {
		const current = tabs.find((tab) => tab.link === $page.url.pathname);
		if (current) selected = current.name;
	}

	let username = '';
	let role = '';
	let profilePic = '../src/icons/user.svg';
	onMount(async() =>{
		try{
			const token = localStorage.getItem('token');
			const res = await fetch('http://localhost:5000/api/getUserProfile', {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			const data = await res.json();
			username = data.user.username;
			role = data.user.userRole;
			profilePic = data.user.pathName || '../src/icons/user.svg';
		}catch(err){
			console.error("Error fetching profile: ", err);
		}
	})
</script>

<nav>
	<a href = "/dashboard"> <img src="../src/images/logo.png" alt="logo" class="pb-5"/> </a>
	<ul>
		<div class="justify-items-start">
			{#each tabs as tab, index}
				<li class="flex items-center">
					<a
						href={tab.link}
						class="flex {selected === tab.name ? 'selected-tab' : ''}"
						id=""
						on:click={() => (selected = tab.name)}
					>
						<img src={tab.icon} alt="home" style="width: 30px" />
						<p class="p-5">{tab.name}</p>
					</a>
				</li>
			{/each}
		</div>
	</ul>
	<ul class="absolute bottom-7">
		<li>
			<a href="/profile" class="flex items-center gap-2 pb-8">
				<div id="pfp" class="profile flex">
					<img src="../src/icons/user.svg" alt="pfp" style="width:65px;" />
				</div>
				<div class="flex-col">
					<h2 class="text-lg">{username}</h2>
					<p class="gray3_txt text-sm">{role}</p>
				</div>
			</a>
		</li>
		<li>
			<a
				href="/login"
				class="mr-4 flex w-full items-center justify-center gap-x-2 rounded-lg bg-[#de0101] py-1.5 hover:bg-[#a30000] transition-colors duration-150"
			>
				<img src="../src/icons/logout-2.svg" alt="home" style="width: 23px" />
				<p class="font-medium" style="font-size: 14px; color:#FFFFFF;">Log out</p>
			</a>
		</li>
	</ul>
</nav>
