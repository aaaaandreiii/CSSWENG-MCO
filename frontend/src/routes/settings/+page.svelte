<script lang="ts">
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { onMount } from 'svelte';

	let selected = 'all'; // default selected tab = profile

	let hasDropdownChanged = false;
	
	type UserDetails = { 
		userId: string; 
		name: string; 
		user: string; 
		date: string; 
		position: string; 
		profilePic: string
	};
	let details: UserDetails[] = [];

	async function fetchUsers() {
		try {
			const token = localStorage.getItem('token');
			const res = await fetch(`${PUBLIC_API_BASE_URL}/api/getUsers`, {
			headers: { Authorization: `Bearer ${token}` }
			});
			const data = await res.json();
        	console.log('Fetched data:', data);
			details = data.users.map((item: any) => ({
				userId: item.userId,
				name: item.fullName,
				user: item.username,
				date: new Date(item.dateAdded).toLocaleDateString('en-PH', {
					timeZone: 'Asia/Manila'
				}),
				position: item.userRole,
				profilePic: item.pathName || "../src/icons/user.svg"
			}));
		} catch (err) {
			console.error('Error fetching user lists:', err);
		}
	}

	onMount(fetchUsers);

	// Computed filtered details based on selected tab
	$: filteredDetails =
		selected === 'all'
			? details
			: details.filter((d) => d.position.toLowerCase() === selected.toLowerCase());

	// Function to map position to color id
	function getColorId(position: string) {
		switch (position.toLowerCase()) {
			case 'admin':
				return 'red';
			case 'staff':
				return 'green';
			case 'auditor':
				return 'yellow';
			case 'manager':
				return 'blue';
			default:
				return '';
		}
	}

	// Dropdown state: track open dropdown by user index
	let showDropdown = false;
	let openDropdownIndex: number | null = null;
	const dropdownOptions = ['admin', 'staff', 'auditor', 'manager'];

	function selectPosition(option: string, idx: number) {
		const newPosition = option.charAt(0).toUpperCase() + option.slice(1);
		if (details[idx].position !== newPosition) {
			details[idx].position = newPosition;
			hasDropdownChanged = true;
		}
		openDropdownIndex = null;
	}

	let dropdownRef: HTMLDivElement | null = null;

	function handleClickOutside(event: MouseEvent) { //this fn does nothing
		if (showDropdown && dropdownRef && !dropdownRef.contains(event.target as Node)) {
			showDropdown = false;} 
	}


	onMount(() => {
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	});

	// Edit mode state
	let isEditMode = false;

	// Modal state and form fields for account creation
	let showAddModal = false;
	let newFullName = '';
	let newUsername = '';
	let newUserRole = '';
	let newPassword = '';
	let newPathName = '';
	
	// let newEmail = '';
	
	let addError = '';

	function openAddModal() {
		showAddModal = true;
		// newEmail = '';
		newFullName = '';
		newUsername = '';
		newUserRole = '';
		newPassword = '';
		newPathName = '';
		addError = '';
	}

	function closeAddModal() {
		showAddModal = false;
		addError = '';
	}

	async function handleAddAccount(event: SubmitEvent) {
		event.preventDefault();
		addError = '';
		//1. basic validation
		if (!newFullName.trim() || !newUsername.trim() || !newPassword.trim() || !newUserRole.trim()) {
			addError = 'All fields are required.';
			return;
		}

		if(newPathName.trim() !== '') {
			try {
				new URL(newPathName.trim());
			}catch(_) {
				addError = 'Invalid path name.';
				return;
			}
		}
		const role = newUserRole.trim().toLowerCase();
		if(!(role === 'admin' || role === 'manager' || role === 'staff' || role === 'auditor')){
			addError = 'Only admin, manager, staff, auditor are valid user role';
			return;
		}

		// 2) Build payload
		const payload = {
			fullName:   	newFullName.trim(),
			userRole:   	newUserRole.trim(),
			username:   	newUsername.trim(),
			userPassword: 	newPassword,
			pathName:   	newPathName.trim() || null
		};

		try {
			const token = localStorage.getItem('token');
			const res = await fetch(`${PUBLIC_API_BASE_URL}/api/createUser`, {
			method:  'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization:   `Bearer ${token}`
			},
			body: JSON.stringify(payload)
			});

			const result = await res.json();
			if (!res.ok) {
			addError = result.message || 'Failed to create user.';
			return;
			}

			// 3) Success: close modal, reload list
			closeAddModal();
			await fetchUsers();

		} catch (err) {
			console.error(err);
			addError = 'Network error. Please try again.';
		}
		// ...submit logic here (e.g., API call)...
		// On success:
		// closeAddModal();
		// Optionally refresh user list
	}

	// tab animation logic for underline effect
	let tabNavRef: HTMLUListElement;
	let underlineStyle = '';

	function updateUnderline() {
		if (!tabNavRef) return;
		
		const activeTab = tabNavRef.querySelector(`a[href="#${selected}"]`) as HTMLElement;
		if (activeTab) {
			const navRect = tabNavRef.getBoundingClientRect();
			const tabRect = activeTab.getBoundingClientRect();
			
			const left = tabRect.left - navRect.left;
			const width = tabRect.width;
			
			underlineStyle = `left: ${left}px; width: ${width}px;`;
		}
	}

	$: if (selected && tabNavRef) {
		setTimeout(updateUnderline, 0);
	}

	onMount(() => {
		updateUnderline();
	});

</script>

<style>
	.tab-nav {
		position: relative;
	}
	
	.tab-underline {
		position: absolute;
		bottom: 0;
		height: 4px;
		background-color: #15803d;
		transition: all 0.3s ease;
		z-index: 1;
	}
	
	.tab-link {
		transition: color 0.3s ease, font-weight 0.3s ease;
	}
</style>

<div class="flex ">
	<div class="flex-1 p-7">
		<!-- header -->
		<header class="mb-4 flex items-center justify-between">
			<h1>Settings</h1>
			<div class="flex w-fit rounded-4xl bg-white px-3">
				<input type="text" placeholder="Search" class="w-55 p-1" style="outline:none" />
				<img src="../src/icons/search.svg" alt="search" style="width:15px; " />
			</div>
		</header>

		<!-- settings nav bar -->
		<nav class="mb-0. flex justify-between">
			<ul class="flex space-x-4 self-end tab-nav" bind:this={tabNavRef}>
				<div class="tab-underline" style={underlineStyle}></div>
				<li>
<a
	href="#all"
	class="px-4 text-lg tab-link {selected === 'all'
		? 'font-bold text-green-700'
		: 'text-black'} {isEditMode ? 'cursor-not-allowed opacity-60 pointer-events-none' : ''}"
	onclick={() => { if (!isEditMode) { selected = 'all'; openDropdownIndex = null; } }}
	tabindex={isEditMode ? -1 : 0}
>
	All
</a>
				</li>
				<li>
<a
	href="#admin"
	class="px-4 text-lg tab-link {selected === 'admin'
		? 'font-bold text-green-700'
		: 'text-black'} {isEditMode ? 'cursor-not-allowed opacity-60 pointer-events-none' : ''}"
	onclick={() => { if (!isEditMode) { selected = 'admin'; openDropdownIndex = null; } }}
	tabindex={isEditMode ? -1 : 0}
>
	Admin
</a>
				</li>
				<li>
<a
	href="#staff"
	class="px-4 text-lg tab-link {selected === 'staff'
		? 'font-bold text-green-700'
		: 'text-black'} {isEditMode ? 'cursor-not-allowed opacity-60 pointer-events-none' : ''}"
	onclick={() => { if (!isEditMode) { selected = 'staff'; openDropdownIndex = null; } }}
	tabindex={isEditMode ? -1 : 0}
>
	Staff
</a>
				</li>
				<li>
<a
	href="#auditor"
	class="px-4 text-lg tab-link {selected === 'auditor'
		? 'font-bold text-green-700'
		: 'text-black'} {isEditMode ? 'cursor-not-allowed opacity-60 pointer-events-none' : ''}"
	onclick={() => { if (!isEditMode) { selected = 'auditor'; openDropdownIndex = null; } }}
	tabindex={isEditMode ? -1 : 0}
>
	Auditor
</a>
				</li>
				<li>
<a
	href="#manager"
	class="px-4 text-lg tab-link {selected === 'manager'
		? 'font-bold text-green-700'
		: 'text-black'} {isEditMode ? 'cursor-not-allowed opacity-60 pointer-events-none' : ''}"
	onclick={() => { if (!isEditMode) { selected = 'manager'; openDropdownIndex = null; } }}
	tabindex={isEditMode ? -1 : 0}
>
	Manager
</a>
				</li>
			</ul>
<button
	class="button mb-1.5 w-28 {isEditMode ? 'cursor-not-allowed opacity-60 pointer-events-none bg-gray-300 text-gray-500' : ''}"
	onclick={() => { if (!isEditMode) { isEditMode = true; hasDropdownChanged = false; } }}
	disabled={isEditMode}
>
	Edit
</button>
		</nav>
		<hr class="mb-0 border-gray-300" />

	<!-- permissions section, change roles as needed -->
		<div class="flex flex-wrap gap-5 justify-start">
			{#if selected === 'all' || selected === 'admin' || selected === 'staff' || selected === 'auditor' || selected === 'manager'}
				{#each filteredDetails as detail, idx}
					<div class="mt-8 rounded-lg bg-white p-8 basis-1/7 min-w-[250px] flex-shrink-0">
						<div class="flex flex-col items-center">
							<!-- User ID above full name -->
							<span class="text-xs text-gray-500 mb-2">{detail.userId}</span>
							<span class="text-lg py-2 mb-4">{detail.name}</span>
							<!-- profile pic -->
							<img 
								src={detail.profilePic}
								alt="pfp" 
								class="rounded-full object-cover mb-4"
								style="width:150px; height:150px;"
							/>
							<!-- Username below profile picture -->
							<span class="text-base text-gray-700 mb-2">{detail.user}</span>
							<!-- Join date below username -->
							<span class="text-sm text-gray-400 mb-4 ">{detail.date}</span>
							<!-- position tag with dropdown -->
							<div
								id={getColorId(detail.position)}
								class="relative flex w-fit items-center justify-center gap-1 px-5"
								bind:this={dropdownRef}
							>
								{#if selected == 'all'}
									<button
										class="flex w-full items-center justify-center gap-1 rounded-full px-3 py-1 
										focus:outline-none"
										onclick={() => {
											if (isEditMode) {
												openDropdownIndex === idx
													? (openDropdownIndex = null)
													: (openDropdownIndex = idx);
											}
										}}
										aria-label="Show dropdown"
										style="background: none; border: none;"
										disabled={!isEditMode}
										tabindex={isEditMode ? 0 : -1}
									>
										<p class="mb-0 select-none">{detail.position}</p>
										{#if isEditMode}
											<img
												src="../src/icons/down-black.svg"
												alt="dropdown arrow"
												style="width:16px;"
											/>
										{/if}
									</button>
								{:else}
									<div
										class="flex w-full items-center justify-center gap-1 rounded-full px-3 py-1 focus:outline-none"
										style="background: none; border: none;"
									>
										<p class="mb-0 select-none">{detail.position}</p>
									</div>
								{/if}

								{#if openDropdownIndex === idx && isEditMode}
									<ul
										class="absolute top-full left-0 z-10 mt-1 w-32 rounded border border-gray-200 bg-white shadow"
									>
										{#each dropdownOptions as option}
											<li>
												<button
													class="w-full px-4 py-2 text-left hover:bg-gray-100"
													onclick={() => selectPosition(option, idx)}
													>{option.charAt(0).toUpperCase() + option.slice(1)}</button
												>
											</li>
										{/each}
									</ul>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>

		{#if isEditMode}
			<button
				class="absolute bottom-10 left-70 rounded-full green1 edit-btn"
				onclick={openAddModal}
			>
				<img src="../src/icons/add.svg" alt="Add" style="width: 50px;" />
			</button>
			<div class="fixed right-10 bottom-10 flex gap-4 z-50">
				{#if hasDropdownChanged}
				<button
					class="px-8 py-3 rounded-lg bg-green-700 text-white font-bold shadow-lg hover:bg-green-800 transition-colors duration-150"
					onclick={() => { isEditMode = false; openDropdownIndex = null; hasDropdownChanged = false; }}
					type="button"
				>
					Save
				</button>
				{/if}
				<button
					class="px-8 py-3 rounded-lg bg-gray-500 text-white font-bold shadow-lg hover:bg-gray-400 transition-colors duration-150"
					onclick={() => { isEditMode = false; openDropdownIndex = null; hasDropdownChanged = false; }}
					type="button"
				>
					Cancel
				</button>
			</div>
		{/if}

		<!-- Add Account Modal -->
		{#if showAddModal}
			<div 
				class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" 
				style="background-color: rgba(10, 10, 10, 0.5);"
				onclick={closeAddModal}
				onkeydown={(e) => { if (e.key === 'Enter') closeAddModal(); }}
				role="button"
				tabindex="0"
				aria-label="Close modal"
			>
				<div 
					class="bg-white rounded-lg shadow-lg p-8 w-96 relative"
					onclick={(e) => e.stopPropagation()}
					onkeydown={(e) => { if (e.key === 'Enter') e.stopPropagation(); }}
					role="dialog"
					tabindex="0"
				>
					<h2 class="text-xl font-bold mb-4">Create New Account</h2>
					<form onsubmit={handleAddAccount}>
						<div class="mb-3">
							<label for="newFullName" class="block mb-1 text-sm font-medium">Full Name</label>
							<input
								id="newFullName"
								type="newFullName"
								class="w-full border rounded px-3 py-2"
								bind:value={newFullName}
								required
							/>
						</div>
						<div class="mb-3">
							<label for="newUsername" class="block mb-1 text-sm font-medium">Username</label>
							<input
								id="newUsername"
								type="text"
								class="w-full border rounded px-3 py-2"
								bind:value={newUsername}
								required
							/>
						</div>
						<div class="mb-3">
							<label for="newUserRole" class="block mb-1 text-sm font-medium">User Role</label>
							<input
								id="newUserRole"
								type="text"
								class="w-full border rounded px-3 py-2"
								bind:value={newUserRole}
								required
							/>
						</div>
						<div class="mb-3">
							<label for="newPassword" class="block mb-1 text-sm font-medium">Password</label>
							<input
								id="newPassword"
								type="password"
								class="w-full border rounded px-3 py-2"
								bind:value={newPassword}
								required
							/>
						</div>
						<div class="mb-3">
							<label for="newFullName" class="block mb-1 text-sm font-medium">Full Name</label>
							<input
								id="newFullName"
								type="text"
								class="w-full border rounded px-3 py-2"
								bind:value={newFullName}
								required
							/>
							</div>

							<div class="mb-3">
							<label for="newUserRole" class="block mb-1 text-sm font-medium">Role</label>
							<select
								id="newUserRole"
								class="w-full border rounded px-3 py-2"
								bind:value={newUserRole}
							>
								{#each dropdownOptions as option}
								<option value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
								{/each}
							</select>
						</div>

						<div class="mb-3">
							<label for="newPathName" class="block mb-1 text-sm font-medium">Profile Picture</label>
							<input
								id="newPathName"
								type="text"
								class="w-full border rounded px-3 py-2"
								bind:value={newPathName}
								
							/>
						</div>
						{#if addError}
							<p class="text-red-600 text-sm mb-2">{addError}</p>
						{/if}
						<div class="flex justify-end gap-2 mt-4">
							<button
								type="button"
								class="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
								onclick={closeAddModal}
							>
								Cancel
							</button>
							<button
								type="submit"
								class="px-4 py-2 rounded text-white
									{newFullName.trim() && newUsername.trim() && newUserRole.trim() && newPassword.trim()
									? 'bg-green-700 hover:bg-green-800'
									: 'cursor-not-allowed bg-gray-400'}"
								disabled={!(newFullName.trim() && newUsername.trim() && newUserRole.trim() && newPassword.trim())}
							>
								Create
							</button>
						</div>
					</form>
				</div>
			</div>
		{/if}
	</div>
</div>