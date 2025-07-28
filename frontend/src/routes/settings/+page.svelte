<script lang="ts">
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { onMount } from 'svelte';

	let selected = 'all'; // default selected tab = profile
	let hasDropdownChanged = false;
	let showNewPassword = false; //create new pass, show pass

	// frontend 
	//3 dots - menu
	let showMenu: boolean = false;
	let menuRefs: HTMLDivElement[] = [];
	let showMenus: boolean[] = [];

	function toggleMenu(event: MouseEvent): void {
		event.stopPropagation();
		showMenu = !showMenu;
	}
	
	//click out close menu
	function handleClickOutsideMenu(event: MouseEvent): void {
		showMenus.forEach((isOpen, idx) => {
			if (isOpen && menuRefs[idx] && !menuRefs[idx].contains(event.target as Node)) {
				showMenus[idx] = false;
			}
		});
	}
	onMount(() => {
		document.addEventListener('mousedown', handleClickOutsideMenu);
		return () => document.removeEventListener('mousedown', handleClickOutsideMenu);
	});

	//dialogue box for success!/updated!/deleted!
	let dialogMessage = '';
	let showDialog = false;

	function showAck(message: string) {
		dialogMessage = message;
		showDialog = true;
		setTimeout(() => showDialog = false, 5000); // auto-hide after 3s
	}


	//backend
	type UserDetails = { 
		userId: string; 
		name: string; //fullName
		user: string; //username
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
	const dropdownOptions = ['Admin', 'Staff', 'Auditor', 'Manager'];

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
	
	// let newEmail = '';
	
	let addError = '';

	// Modal state and form fields for editing user
	let showEditModal = false;
	let editUserId = '';
	let editFullName = '';
	let editUsername = '';
	let editUserRole = '';
	let editPathName = '';
	let editError = '';
	let editIndex = -1;

	// Modal state for delete confirmation
	let showDeleteModal = false;
	let deleteUserId = '';
	let deleteUserName = '';
	let deleteIndex = -1;

	function openAddModal() {
		showAddModal = true;
		// newEmail = '';
		newFullName = '';
		newUsername = '';
		newUserRole = '';
		newPassword = '';
		addError = '';
	}

	function closeAddModal() {
		showAddModal = false;
		addError = '';
	}

	function openEditModal(idx: number) {
		editIndex = idx;
		const user = details[idx];
		editUserId = user.userId;
		editFullName = user.name;
		editUsername = user.user;
		editUserRole = user.position.toLowerCase();
		editPathName = user.profilePic === "../src/icons/user.svg" ? '' : user.profilePic;
		editError = '';
		showEditModal = true;
		showMenus[idx] = false; // Close the menu
	}

	function closeEditModal() {
		showEditModal = false;
		editError = '';
		editIndex = -1;
	}

	function openDeleteModal(idx: number) {
		deleteIndex = idx;
		const user = details[idx];
		deleteUserId = user.userId;
		deleteUserName = user.name;
		showDeleteModal = true;
		showMenus[idx] = false; // Close the menu
	}

	function closeDeleteModal() {
		showDeleteModal = false;
		deleteIndex = -1;
	}

	async function handleAddAccount(event: SubmitEvent) {
		event.preventDefault();
		addError = '';
		//1. basic validation
		if (!newFullName.trim() || !newUsername.trim() || !newPassword.trim() || !newUserRole.trim()) {
			addError = 'All fields are required.';
			return;
		}
		if(details.find((u: UserDetails) => u.user.toLowerCase() === newUsername.trim().toLowerCase())){
			addError = 'Username already exists.';
			return;
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
			pathName:   	null
		};

		try {
			//TODO: Backend API call to create user
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
			showAck(addError);
			return;
			}

			// on success, close the modal
			closeAddModal();
			
			//used to refresh the user list to see the update
			await fetchUsers();
			showAck('User created successfully.');

		} catch (err) {
			console.error(err);
			addError = 'Network error. Please try again.';
		}
	}

	async function handleEditAccount(event: SubmitEvent) {
		event.preventDefault();
		editError = '';
		
		// Basic validation
		if (!editFullName.trim() || !editUsername.trim() || !editUserRole.trim()) {
			editError = 'Full name, username, and user role are required.';
			return;
		}
		
		// Check if username already exists (excluding current user)
		const existingUser = details.find((u: UserDetails, idx) => 
			idx !== editIndex && u.user.toLowerCase() === editUsername.trim().toLowerCase()
		);
		if (existingUser) {
			editError = 'Username already exists.';
			return;
		}
		
		if (editPathName.trim() !== '') {
			try {
				new URL(editPathName.trim());
			} catch (_) {
				editError = 'Invalid path name.';
				return;
			}
		}
		
		const role = editUserRole.trim().toLowerCase();
		if (!(role === 'admin' || role === 'manager' || role === 'staff' || role === 'auditor')) {
			editError = 'Only admin, manager, staff, auditor are valid user roles';
			return;
		}

		// Build payload
		const payload = {
			userId: editUserId,
			fullName: editFullName.trim(),
			userRole: editUserRole.trim(),
			username: editUsername.trim(),
			pathName: editPathName.trim() || null
		};

		try {
			// TODO for backend: API call to update user

			// const token = localStorage.getItem('token');
			// const res = await fetch(`${PUBLIC_API_BASE_URL}/api/updateUser`, {
			// 	method: 'PUT',
			// 	headers: {
			// 		'Content-Type': 'application/json',
			// 		Authorization: `Bearer ${token}`
			// 	},
			// 	body: JSON.stringify(payload)
			// });

			// TODO for backend: if response = not ok, return error message
			// const result = await res.json();
			// if (!res.ok) {
			// 	editError = result.message || 'Failed to update user.';
			// 	return;
			// }

			// Success: close modal, reload list
			closeEditModal();
			await fetchUsers();
			showAck('User updated successfully.');

		} catch (err) {
			console.error(err);
			editError = 'Network error. Please try again.';
		}
	}

	async function handleDeleteAccount() {
		try {
			// TODO for backend: API call to delete user
			// const token = localStorage.getItem('token');
			// const res = await fetch(`${PUBLIC_API_BASE_URL}/api/deleteUser`, {
			// 	method: 'DELETE',
			// 	headers: {
			// 		'Content-Type': 'application/json',
			// 		Authorization: `Bearer ${token}`
			// 	},
			// 	body: JSON.stringify({ userId: deleteUserId })
			// });
			
			// TODO for backend: if response = not ok, return error message
			// const result = await res.json();
			// if (!res.ok) {
			// 	showAck(result.message || 'Failed to delete user.');
			// 	return;
			// }

			// Success: close modal, reload list
			closeDeleteModal();
			await fetchUsers();
			showAck('User deleted successfully.');

		} catch (err) {
			console.error(err);
			showAck('Network error. Please try again.');
		}
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

<!-- header -->
<header class="mb-4 flex items-center justify-between p-7 fixed gray1" style="width: 85%; z-index: 10;">
	<h1>Settings</h1>
	<div class="flex w-fit rounded-4xl bg-white px-3">
		<input type="text" placeholder="Search" class="w-55 p-1" style="outline:none" />
		<img src="../src/icons/search.svg" alt="search" style="width:15px; " />
	</div>
</header>

<div class="flex pt-15">
	<div class="flex-1 p-7">
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
					<div class="mt-8 rounded-lg bg-white p-8 basis-1/7 min-w-[250px] flex-shrink-0 relative " 
					bind:this={menuRefs[idx]}

>
						<!-- 3 dots button menu-->
						{#if isEditMode}
							<button
								class="absolute top-3 right-3 w-6 h-6"
								onclick={() => showMenus[idx] = !showMenus[idx]}
								aria-label="Options menu"
							>
								<img src="./src/icons/menu-dots.svg" alt="menu" class="w-full h-full" />
							</button>

							<!-- Dropdown -->
							{#if showMenus[idx]}
								<div class="absolute top-10 right-3 bg-white shadow-md rounded-md w-24 z-50 py-1">
									<button 
										class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
										onclick={() => openEditModal(idx)}
									>
										Edit
									</button>
									<button 
										class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
										onclick={() => openDeleteModal(idx)}
									>
										Delete
									</button>
								</div>
							{/if}
						{/if}

						
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
				class="fixed bottom-10 left-70 rounded-full green1 edit-btn"
				onclick={openAddModal}
			>
				<img src="../src/icons/add.svg" alt="Add" style="width: 50px;" />
			</button>
			<div class="fixed right-10 bottom-10 flex gap-4 z-50">
				{#if hasDropdownChanged}
				<button
					class="px-8 py-3 rounded-lg bg-green-700 text-white font-bold shadow-lg hover:bg-green-800 transition-colors duration-150"
					onclick={() => { isEditMode = false; openDropdownIndex = null; hasDropdownChanged = false; showAck('Successfully changed roles!');
}}
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

		<!-- add account modal -->
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
							<label for="newPassword" class="block mb-1 text-sm font-medium">Password</label>
							<input
								id="newPassword"
								type="password"
								class="w-full border rounded px-3 py-2"
								bind:value={newPassword}
								required
							/>
						</div>
						{#if addError}
							<p class="text-[#de0101] text-sm mb-2">{addError}</p>
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

		<!-- edit account modal -->
		{#if showEditModal}
			<div 
				class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" 
				style="background-color: rgba(10, 10, 10, 0.5);"
				onclick={closeEditModal}
				onkeydown={(e) => { if (e.key === 'Enter') closeEditModal(); }}
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
					<h2 class="text-xl font-bold mb-4">Edit Account</h2>
					<form onsubmit={handleEditAccount}>
						<div class="mb-3">
							<label for="editFullName" class="block mb-1 text-sm font-medium">Full Name</label>
							<input
								id="editFullName"
								type="text"
								class="w-full border rounded px-3 py-2"
								bind:value={editFullName}
								required
							/>
						</div>
						<div class="mb-3">
							<label for="editUsername" class="block mb-1 text-sm font-medium">Username</label>
							<input
								id="editUsername"
								type="text"
								class="w-full border rounded px-3 py-2"
								bind:value={editUsername}
								required
							/>
						</div>
						<div class="mb-3">
							<label for="editUserRole" class="block mb-1 text-sm font-medium">User Role</label>
							<select
								id="editUserRole"
								class="w-full border rounded px-3 py-2"
								bind:value={editUserRole}
							>
								{#each dropdownOptions as option}
								<option value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
								{/each}
							</select>
						</div>
						<!-- <div class="mb-3">
							<label for="editPathName" class="block mb-1 text-sm font-medium">Profile Picture URL</label>
							<input
								id="editPathName"
								type="text"
								class="w-full border rounded px-3 py-2"
								bind:value={editPathName}
								placeholder="Optional - leave empty for default"
							/>
						</div> -->
						{#if editError}
							<p class="text-[#de0101] text-sm mb-2">{editError}</p>
						{/if}
						<div class="flex justify-end gap-2 mt-4">
							<button
								type="button"
								class="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
								onclick={closeEditModal}
							>
								Cancel
							</button>
							<button
								type="submit"
								class="px-4 py-2 rounded text-white
									{editFullName.trim() && editUsername.trim() && editUserRole.trim()
									? 'bg-green-700 hover:bg-green-800'
									: 'cursor-not-allowed bg-gray-400'}"
								disabled={!(editFullName.trim() && editUsername.trim() && editUserRole.trim())}
							>
								Update
							</button>
						</div>
					</form>
				</div>
			</div>
		{/if}

		<!-- Delete Confirmation Modal -->
		{#if showDeleteModal}
			<div 
				class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" 
				style="background-color: rgba(10, 10, 10, 0.5);"
				onclick={closeDeleteModal}
				onkeydown={(e) => { if (e.key === 'Enter') closeDeleteModal(); }}
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
					<h2 class="text-xl font-bold mb-4 text-[#de0101]">Confirm Delete</h2>
					<p class="mb-6">
						Are you sure you want to delete the account for <strong>{deleteUserName}</strong>? 
						This action cannot be undone.
					</p>
					<div class="flex justify-end gap-2">
						<button
							type="button"
							class="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
							onclick={closeDeleteModal}
						>
							Cancel
						</button>
						<button
							type="button"
							class="px-4 py-2 rounded bg-[#de0101] hover:bg-[#a30000] text-white"
							onclick={handleDeleteAccount}
						>
							Delete
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- dialogue box: success!eror! -->
		{#if showDialog}
			<div class="fixed top-4 right-4 z-50 px-4 py-2 bg-green-700 text-white rounded shadow-lg transition-opacity duration-300">
				{dialogMessage}
			</div>
		{/if}


	</div>
</div>