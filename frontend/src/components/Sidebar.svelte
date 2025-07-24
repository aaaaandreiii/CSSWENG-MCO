<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	let selected = 'dashboard';

	let tabs = [
		{ name: 'Dashboard', link: '/dashboard', icon: '../src/icons/home.svg' },
		{ name: 'Inventory', link: '/inventory', icon: '../src/icons/inventory.svg', 
			subtabs: [
				{ name: 'Products', link: '/inventory/products' },
				{ name: 'Stock In', link: '/inventory/stock-in' },
				{ name: 'Stock Out', link: '/inventory/stock-out' },
				{ name: 'Orders', link: '/inventory/orders' },
				{ name: 'Returns', link: '/inventory/returns' },
				{ name: 'Reports', link: '/inventory/reports' }
			]
		},
		{
			name: 'Analytics',
			link: '/analytics',
			icon: '../src/icons/analytics.svg',
		},
		{ name: 'Settings', link: '/settings', icon: '../src/icons/settings.svg' }
	];

	// update selected tab reactively when route changes
	$: {
		let current = tabs.find(tab => tab.link === $page.url.pathname);
		for (const tab of tabs) {
			if (tab.subtabs) {
				const match = tab.subtabs.find(sub => sub.link === $page.url.pathname);
				if (match) {
					selected = match.name;
				}
			}
		}
		if (current) {
			selected = current.name;
		}
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
	<a href = "/dashboard"> <img src="../src/images/logo.png" alt="logo"/> </a>
	<ul>
		<div class="justify-items-start">
			{#each tabs as tab, index}
				<li class="flex-row items-center">
					<a
						href={tab.link}
						class="flex {selected === tab.name ? 'selected-tab' : ''}"
						on:click={() => (selected = tab.name)}
					>
						<img src={tab.icon} alt={tab.icon} style="width: 30px" />
						<p class="p-4">{tab.name}</p>
					</a>
					<!-- subtabs -->
					{#if tab.subtabs}
						<ul class="ml-12 flex-col justify-items-start place-content-start">
							{#each tab.subtabs as sub}
								<li>
									<a
										href={sub.link}
										class="block py-2 text-sm {selected === sub.name ? 'selected-tab' : ''}"
										on:click={() => (selected = sub.name)}
									>
										{sub.name}
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				</li>
			{/each}
		</div>
	</ul>
	<ul class="absolute bottom-7">
		<li>
			<a href="/profile" class="flex items-center gap-3 pb-5 w-full">
				<div id="pfp" class="profile flex-shrink-0">
					<img src="../src/icons/user.svg" alt="pfp" style="width:45px; height:45px;" />
				</div>
				<div class="flex flex-col items-start ml-2 min-w-0" style="width: 0; flex: 0;">
					<h2 class="text-lg truncate max-w-[180px]">{username}</h2>
					<p class="gray3_txt text-sm truncate max-w-[180px]">{role}</p>
				</div>
			</a>
		</li>
		<li>
			<a
				href="/login"
				class="flex justify-start gap-x-2 rounded-lg bg-[#de0101] py-2 px-5 hover:bg-[#a30000] transition-colors duration-150 mx-auto"
			>
				<img src="../src/icons/logout-2.svg" alt="logout" style="width: 23px" />
				<p class="font-medium" style="font-size: 14px; color:#FFFFFF;">Log out</p>
			</a>
		</li>
	</ul>
</nav>
