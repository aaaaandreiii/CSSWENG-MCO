<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { goto } from '$app/navigation';

	let selected = 'dashboard';
	let expandedTab = ''; // Track toggled tab

	let tabs = [
		{ name: 'Dashboard', link: '/dashboard', icon: '../src/icons/home.svg' },
		{
			name: 'Inventory', link: '/inventory', icon: '../src/icons/inventory.svg',
			subtabs: [
				{ name: 'Products', link: '/inventory/products' },
				{ name: 'Stock In', link: '/inventory/stock-in' },
				{ name: 'Stock Out', link: '/inventory/stock-out' },
				{ name: 'Orders', link: '/inventory/orders' },
				{ name: 'Returns', link: '/inventory/returns' },
				{ name: 'Activity Logs', link: '/inventory/activity-logs' }
			]
		},
		{ name: 'Analytics', link: '/analytics', icon: '../src/icons/analytics.svg' },
		{ name: 'Settings', link: '/settings', icon: '../src/icons/settings.svg' }
	];

	$: filteredTabs = tabs
	.filter(tab => {
		//remove settings for staff user
		if ($userProfile.role.toLowerCase() === 'staff') {
			return tab.name !== 'Settings'; 
		}
		return true; 
	})
	//remove activity log for staff user
	.map(tab => {
		if (tab.name === 'Inventory' && $userProfile.role.toLowerCase() === 'staff') {
			return {
				...tab,
				subtabs: tab.subtabs?.filter(sub => sub.name !== 'Activity Logs')
			};
		}
		return tab;
	});

	$: {
		let current = tabs.find(tab => tab.link === $page.url.pathname);
		for (const tab of tabs) {
			if (tab.subtabs) {
				const match = tab.subtabs.find(sub => sub.link === $page.url.pathname);
				if (match) {
					selected = match.name;
					expandedTab = tab.name;
				}
			}
		}
		if (current) {
			selected = current.name;
		}
	}

	// let username = '';
	// let role = '';
	// let profilePic = '../src/icons/user.svg';

	import {userProfile} from '$lib/stores/user';

	onMount(async () => {
		try {
			const token = localStorage.getItem('token');
			const res = await fetch(`${PUBLIC_API_BASE_URL}/api/getUserProfile`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			const data = await res.json();
			userProfile.set({
				userId: data.user.userId,
				username: data.user.username,
				role: data.user.userRole,
				profilePic: data.user.pathName || '../src/icons/user.svg'
			});
		} catch (err) {
			console.error("Error fetching profile: ", err);
		}
	});

	function toggleTab(tabName: string) {
		expandedTab = expandedTab === tabName ? '' : tabName;
	}

	async function handleLogout(){
		try{
			const token = localStorage.getItem('token');
			//log audit
			await fetch(`${PUBLIC_API_BASE_URL}/api/logout`, {
				method: 'POST',
				headers: { 
					Authorization: `Bearer ${token}` 
				}
			});
			localStorage.removeItem('token');
			goto('/login');
		}catch(err){
			console.error("Error logging out: ", err);
		}
	}
</script>

<nav>
	<a href="/dashboard">
		<img src="../src/images/logo.png" alt="logo" />
	</a>
	<ul>
		{#each filteredTabs as tab}
			<li class="flex-row items-center">
				<a
					href={tab.link}
					class={`flex ${
						selected === tab.name
						? 'selected-tab'
						: 'hover:bg-[#0e7b34] hover:text-white hover:shadow hover:rounded-r-[18px] hover:ml-[-30px] hover:pl-[30px] hover:w-[calc(100%+30px)]'
					}`}
					on:click={() => {
						selected = tab.name;
						if (tab.name === 'Inventory') {
							toggleTab(tab.name);
						} else {
							expandedTab = '';
						}
					}}
				>
					<img src={tab.icon} alt={tab.icon} style="width: 30px" />
					<p class="p-4">{tab.name}</p>
				</a>
				{#if tab.subtabs && expandedTab === tab.name}
					<ul class="ml-12 flex-col">
						{#each tab.subtabs as sub}
							<li>
								<a
									href={sub.link}
									class={`block py-2 text-sm rounded ${
										selected === sub.name
											? 'selected-subtab'
											: 'hover:bg-[#0e7b34] hover:text-white hover:shadow hover:rounded-r-[18px] hover:ml-[-80px] hover:pl-[80px] hover:w-[calc(100%+40px)]'
										}`}
									on:click={() => selected = sub.name}
									>
									{sub.name}
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			</li>
		{/each}
	</ul>

	<ul class="absolute bottom-7">
		<li>
			<a
				href="/profile"
				class="flex items-center gap-3 pb-5 w-full"
				on:click={() => {
					selected = 'profile';
					expandedTab = '';
				}}
			>
				<div id="pfp" class="profile flex-shrink-0">
					<img src={$userProfile.profilePic} alt="pfp" class="w-[45px] h-[45px] rounded-full object-cover" />
				</div>
				<div class="flex flex-col items-start ml-2 min-w-0" style="width: 0; flex: 0;">
					<h2 class="text-lg truncate max-w-[180px]">{$userProfile.username}</h2>
					<p class="gray3_txt text-sm truncate max-w-[180px]">{$userProfile.role}</p>
				</div>
			</a>
		</li>
		<li>
			<button
				class="flex justify-start gap-x-2 rounded-lg bg-[#de0101] py-2 px-5 hover:bg-[#a30000] transition-colors duration-150 mx-auto"
				on:click={handleLogout}
			>
				<img src="../src/icons/logout-2.svg" alt="logout" style="width: 23px" />
				<p class="font-medium text-white text-sm">Log out</p>
		</button>
		</li>
	</ul>
</nav>
