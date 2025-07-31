<script lang="ts">
	import { SystemDrive } from '$env/static/private';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { userProfile } from '$lib/stores/user';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let selected = 'all'; // default selected tab = profile
	let hasDropdownChanged = false;
	let showNewPassword = false; //create new pass, show pass
	let showConfirmPassword = false;

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
		userId: number; 
		name: string; //fullName
		user: string; //username
		date: string; 
		position: string; 
		password: string;
		profilePic: string;
	};
	let details: UserDetails[] = [];
	// let profile: UserDetails;

	async function fetchUsers() {
		try {
			const token = localStorage.getItem('token');
			const res = await fetch(`${PUBLIC_API_BASE_URL}/api/getUsers`, {
			headers: { Authorization: `Bearer ${token}` }
			});
			const data = await res.json();
        	console.log('Fetched data:', data);
			details = data.users.map((item: any) => ({
				userId: Number(item.userId),
				name: item.fullName,
				user: item.username,
				date: new Date(item.dateAdded).toLocaleDateString('en-PH', {
					timeZone: 'Asia/Manila'
				}),
				position: item.userRole,
				password: item.userPassword,
				profilePic: item.pathName || "../src/icons/user.svg"
			}));
		} catch (err) {
			console.error('Error fetching user lists:', err);
		}
	}

	// async function fetchProfile(){
	// 	try{
	// 		const token = localStorage.getItem('token');
	// 		const res = await fetch(`${PUBLIC_API_BASE_URL}/api/getUserProfile`, {
	// 			headers: {
	// 				Authorization: `Bearer ${token}`
	// 			}
	// 		});
	// 		const data = await res.json();
	// 		profile = {
	// 			userId: Number(data.user.userId),
	// 			name: data.user.fullName,
	// 			user: data.user.username,
	// 			date: new Date(data.user.dateAdded).toLocaleDateString('en-PH', {
	// 				timeZone: 'Asia/Manila'
	// 			}),
	// 			position: data.user.userRole,
	// 			password: data.user.userPassword,
	// 			profilePic: data.user.pathName || "../src/icons/user.svg" 
	// 		}
	// 	}catch(err){
	// 		console.error("Error fetching user data: ", err);
	// 	}
	// }

	onMount(async() =>{
		// fetchProfile();
		fetchUsers();
	});

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
			case 'manager':
				return 'blue';
			default:
				return '';
		}
	}

	// Dropdown state: track open dropdown by user index
	let showDropdown = false;
	let openDropdownIndex: number | null = null;
	const dropdownOptions = ['admin', 'staff', 'manager'];

	function selectPosition(option: string, idx: number) {
		const newPosition = option.charAt(0).toUpperCase() + option.slice(1);
		if (details[idx].position !== newPosition) {
			details[idx].position = newPosition;
			hasDropdownChanged = true;
			// editRoleId = details[idx].user
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
	let newConfirmPassword = '';
	let newPathName = '';
	
	let addError = '';

	// Modal state and form fields for editing user
	let showEditModal = false;
	let editUserId: number;
	let editFullName = '';
	let editUsername = '';
	let editUserRole = '';
	let editPassword = '';
	let editConfirmPassword = '';
	let editPathName = '';
	let editError = '';
	let editIndex = -1;

	let editRoleId: number;

	// Modal state for delete confirmation
	let showDeleteModal = false;
	let deleteUserId: number;
	let deleteUserName = '';
	let deleteIndex = -1;

	function openAddModal() {
		showAddModal = true;
		newFullName = '';
		newUsername = '';
		newUserRole = '';
		newPassword = '';
		newConfirmPassword = '';
		newPathName = '';
		addError = '';
	}

	function closeAddModal() {
		showAddModal = false;
		addError = '';
	}

	function openEditModal(userId: number, idx: number) {
		editIndex = idx;
		const user = details.find((u) => u.userId === userId);
		if(!user){
			console.warn(`User with ID ${userId} not found.`);
			return;
		}
		editUserId = user.userId;
		editFullName = user.name;
		editUsername = user.user;
		editUserRole = user.position.toLowerCase();
		editPassword = '';
		editConfirmPassword = '';
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

	function canUpdate(userId: number){
		const user = details.find((u) => u.userId === userId);
		if(!user){
			console.warn(`User with ID ${userId} not found.`);
			return;
		}
		//if you are staff and not yourself
		if($userProfile.role === 'staff' && user.userId !== $userProfile.userId)
			return false;
		//if you are a manager, you cannot update manager, admin, unless yourself
		if((user.position === 'admin' || (user.position === 'manager' && user.userId !== $userProfile.userId)) && ($userProfile.role === 'manager')) 
			return false;
		//if you the only admin left, you cannot change ur role to anything else
		if(user.position === 'admin' && user.userId === $userProfile.userId && details.filter(u => u.position === 'admin').length === 1)
			return false;
		return true;
	}

	function canDelete(userId: number){
		const user = details.find((u) => u.userId === userId);
		if(!user){
			console.warn(`User with ID ${userId} not found.`);
			return;
		}
		//cannot delete yourself
		if(user.userId === $userProfile.userId) 
			return false;
		//if you are staff
		if($userProfile.role === 'staff')
			return false;
		//cannot delete manager, admin, if you are a manager
		if((user.position === 'manager' || user.position === 'admin') && ($userProfile.role === 'manager'))
			return false;
		//if deleting admin but you are not admin
		if(user.position === 'admin' && $userProfile.role !== 'admin') 
			return false;
		//need at least 1 admin present
		if(user.position === 'admin' && details.filter(u => u.position === 'admin').length === 1)
			return false;
		return true;
	}

	function openDeleteModal(userId: number, idx: number) {
		deleteIndex = idx;
		const user = details.find((u) => u.userId === userId);
		if(!user){
			console.warn(`User with ID ${userId} not found.`);
			return;
		}
		// const user = details[idx];
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
		if(!newFullName.trim() || !newUsername.trim() || !newPassword.trim() || !newConfirmPassword.trim() || !newUserRole.trim()){
			addError = 'Missing Fields.';
			return;
		}
		if(details.find((u: UserDetails) => u.user.trim().toLowerCase() === newUsername.trim().toLowerCase())){
			addError = 'Username already exists.';
			return;
		}
		if(!((!newPassword.trim() && !newConfirmPassword.trim()) || (newPassword.trim() && newConfirmPassword.trim()))){
			addError = 'Please confirm your password.';
			return;
		}
		if(newPassword.trim() !== newConfirmPassword.trim()){
			addError = 'Passwords do not match.';
			return;
		}
		if(newPathName.trim() !== ''){
			try{
				new URL(newPathName.trim());
			}catch(_){
				addError = 'Invalid path name.';
				return;
			}
		}
		const role = newUserRole.trim().toLowerCase();
		if(!(role === 'admin' || role === 'manager' || role === 'staff')){
			addError = 'Only admin, manager, and staff are valid user role';
			return;
		}

		// 2) Build payload
		const payload = {
			fullName: newFullName.trim(),
			userRole: newUserRole.trim(),
			username: newUsername.trim(),
			userPassword: newPassword.trim(),
			pathName: newPathName.trim() || null
		};

		try{
			//TODO: Backend API call to create user
			const token = localStorage.getItem('token');
			const res = await fetch(`${PUBLIC_API_BASE_URL}/api/createUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
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

		}catch(err){
			console.error(err);
			addError = 'Network error. Please try again.';
		}
	}

	async function handleEditAccount(event: SubmitEvent) {
		event.preventDefault();
		editError = '';
		
		// Basic validation
		if(!editFullName.trim() || !editUsername.trim() || !editUserRole.trim()){
			editError = 'Full name, username, and user role are required.';
			return;
		}
		
		// Check if username already exists (excluding current user)
		// const existingUser = details.find((u: UserDetails, idx) => 
		// 	idx !== editIndex && u.user.toLowerCase() === editUsername.trim().toLowerCase()
		// );
		// if(existingUser){
		// 	editError = 'Username already exists.';
		// 	return;
		// }

		if(details && (details.find((u: UserDetails) => u.user.trim().toLowerCase() === editUsername.trim().toLowerCase() && u.userId !== $userProfile.userId))){
			editError = 'Username already exists.';
			return;
		}
			
		if(!((!editPassword.trim() && !editConfirmPassword.trim()) || (editPassword.trim() && editConfirmPassword.trim()))){
			editError = 'Please confirm your password.';
			return;
		}
		if(editPassword.trim() !== editConfirmPassword.trim()){
			editError = 'Passwords do not match.';
			return;
		}
		if(editPathName.trim() !== ''){
			try{
				new URL(editPathName.trim());
			}catch(_){
				editError = 'Invalid path name.';
				return;
			}
		}
		
		const role = editUserRole.trim().toLowerCase();
		if(!(role === 'admin' || role === 'manager' || role === 'staff')){
			editError = 'Only admin, manager, and staff are valid user roles';
			return;
		}

		// Build payload
		const payload: any = {
			userId: Number(editUserId),
			fullName: editFullName.trim(),
			userRole: editUserRole.trim(),
			username: editUsername.trim(),
			pathName: editPathName.trim() || null
		};
		
		if(editPassword.trim()){
			payload.userPassword = editPassword;
		}

		try{
			// TODO for backend: API call to update user
			const token = localStorage.getItem('token');
			const res = await fetch(`${PUBLIC_API_BASE_URL}/api/updateUser/${payload.userId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(payload)
			});

			// TODO for backend: if response = not ok, return error message
			const result = await res.json();
			if(!res.ok){
				editError = result.message || 'Failed to update user.';
				return;
			}
			//update sidebar info
			const currentUser = get(userProfile);
			if(currentUser?.userId === payload.userId){
				userProfile.set({
					userId: payload.userId,
					username: payload.username.trim(),
					role: payload.userRole.trim(),
					profilePic: payload.pathName?.trim() || "../src/icons/user.svg"
				});
			}
			// if(profile.userId === payload.userId){
			// 	userProfile.set({
			// 		userId: payload.userId,
			// 		username: payload.username.trim(),
			// 		role: payload.userRole.trim(),
			// 		profilePic: payload.pathName?.trim() || "../src/icons/user.svg"
			// 	});
			// }

			// Success: close modal, reload list
			closeEditModal();
			await fetchUsers();
			// await fetchProfile();
			showAck('User updated successfully.');

		}catch(err){
			console.error(err);
			editError = 'Network error. Please try again.';
		}
	}
	
	async function saveRoleChanges(userId: number){
		editError = '';		
		console.log(userId);
		const user = details.find((u) => u.userId === userId);
		if(!user){
			console.warn(`User with ID ${userId} not found.`);
			return;
		}

		// Build payload
		const payload: any = {
			userId: Number(user.userId),
			fullName: user.name.trim(),
			userRole: user.position.trim(),
			username: user.user.trim(),
			pathName: user.profilePic.trim() || null
		};

		try{
			const token = localStorage.getItem('token');
			const res = await fetch(`${PUBLIC_API_BASE_URL}/api/updateUser/${payload.userId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(payload)
			});

			// TODO for backend: if response = not ok, return error message
			const result = await res.json();
			if(!res.ok){
				alert('Failed to update role.');
				return;
			}
			//update sidebar info
			const currentUser = get(userProfile);
			if(currentUser?.userId === payload.userId){
				userProfile.set({
					userId: payload.userId,
					username: payload.username.trim(),
					role: payload.userRole.trim(),
					profilePic: payload.pathName?.trim() || "../src/icons/user.svg"
				});
			}

			isEditMode = false; 
			openDropdownIndex = null; 
			hasDropdownChanged = false; 
			await fetchUsers();
			showAck('Successfully changed roles!');
		}catch(err){
			console.error(err);
		}	
	}

	async function handleDeleteAccount() {
		try{
			// TODO for backend: API call to delete user
			const token = localStorage.getItem('token');
			const res = await fetch(`${PUBLIC_API_BASE_URL}/api/deleteUser/${deleteUserId}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});
			
			// TODO for backend: if response = not ok, return error message
			const result = await res.json();
			if(!res.ok){
				showAck(result.message || 'Failed to delete user.');
				return;
			}

			// Success: close modal, reload list
			closeDeleteModal();
			await fetchUsers();
			showAck('User deleted successfully.');

		}catch(err){
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
									<!-- <li>
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
									</li> -->
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
					{#if $userProfile.role === 'admin'}
						<button
							class="button mb-1.5 w-28 {isEditMode ? 'cursor-not-allowed opacity-60 pointer-events-none bg-gray-300 text-gray-500' : ''}"
							onclick={() => { if (!isEditMode) { isEditMode = true; hasDropdownChanged = false; } }}
							disabled={isEditMode}
						>
							Edit
						</button>
					{/if}
		</nav>
		
		<hr class="mb-0 border-gray-300" />
		<!-- permissions section, change roles as needed -->
		<div class="flex flex-wrap gap-5 justify-start">
			{#if selected === 'all' || selected === 'admin' || selected === 'staff' || selected === 'manager'}

				{#each filteredDetails as detail, idx}
					<div class="mt-8 rounded-lg bg-white p-8 basis-1/7 min-w-[250px] flex-shrink-0 relative " 
					bind:this={menuRefs[idx]}

>
						<!-- 3 dots button menu-->
						{#if isEditMode && (canUpdate(detail.userId) || canDelete(detail.userId))}
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
									{#if canUpdate(detail.userId)}
										<button 
											class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
											onclick={() => openEditModal(detail.userId, idx)}
										>
											Edit
										</button>
									{:else}
										<button 
											disabled 
											class="block w-full text-left px-4 py-2 text-gray-400 cursor-not-allowed text-sm"
											title="You cannot edit this user"
										>
											Edit
										</button>
									{/if}
									{#if canDelete(detail.userId)}
										<button 
											class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
											onclick={() => openDeleteModal(detail.userId, idx)}
										>
											Delete
										</button>
									{:else}
										<button 
											disabled 
											class="block w-full text-left px-4 py-2 text-gray-400 cursor-not-allowed text-sm"
											title="You cannot delete this user"
										>
											Delete
										</button>
									{/if}
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
											if (isEditMode && canUpdate(detail.userId)) {
												openDropdownIndex === idx
													? (openDropdownIndex = null)
													: (openDropdownIndex = idx);
											}
										}}
										aria-label="Show dropdown"
										style="background: none; border: none;"
										disabled={!(isEditMode && canUpdate(detail.userId))}
										tabindex={isEditMode ? 0 : -1}
									>
										<p class="mb-0 select-none">{detail.position}</p>
										{#if isEditMode && canUpdate(detail.userId)}
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
			{#if $userProfile.role === 'admin'}
				<button
					class="fixed bottom-10 left-70 rounded-full green1 edit-btn"
					onclick={openAddModal}
				>
					<img src="../src/icons/add.svg" alt="Add" style="width: 50px;" />
				</button>
			{/if}
			<div class="fixed right-10 bottom-10 flex gap-4 z-50">
				{#if hasDropdownChanged}
				<button
					class="px-8 py-3 rounded-lg bg-green-700 text-white font-bold shadow-lg hover:bg-green-800 transition-colors duration-150"
					onclick={() => saveRoleChanges}
					type="button"
				>
				<!-- onclick={() => { isEditMode = false; openDropdownIndex = null; hasDropdownChanged = false; showAck('Successfully changed roles!');}} -->
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
								type={showNewPassword ? "text" : "password"}
								class="w-full border rounded px-3 py-2"
								bind:value={newPassword}
								required
							/>
							<div class="flex items-center mt-2">
								<input
									type="checkbox"
									id="toggle-new-password"
									bind:checked={showNewPassword}
									class="mr-2"
								/>
								<label for="toggle-new-password" class="text-sm select-none">Show password</label>
							</div>
						</div>
						<div class="mb-3">
							<label for="newConfirmPassword" class="block mb-1 text-sm font-medium">Confirm Password</label>
							<input
								id="newConfirmPassword"
								type={showConfirmPassword ? "text" : "password"}
								class="w-full border rounded px-3 py-2"
								bind:value={newConfirmPassword}
								required
							/>
							<div class="flex items-center mt-2">
								<input
									type="checkbox"
									id="toggle-confirm-password"
									bind:checked={showConfirmPassword}
									class="mr-2"
								/>
								<label for="toggle-confirm-password" class="text-sm select-none">Show password</label>
							</div>
						</div>
						<div class="mb-3">
							<label for="newPathName" class="block mb-1 text-sm font-medium">Profile Picture URL</label>
							<input
								id="newPathName"
								type="newPathName"
								class="w-full border rounded px-3 py-2"
								bind:value={newPathName}
								
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
									{newFullName.trim() && newUsername.trim() && newUserRole.trim() && newPassword.trim() && newConfirmPassword
									? 'bg-green-700 hover:bg-green-800'
									: 'cursor-not-allowed bg-gray-400'}"
								disabled={!(newFullName.trim() && newUsername.trim() && newUserRole.trim() && newPassword.trim() && newConfirmPassword)}
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
						<!-- {#if $userProfile.role === 'admin'} -->
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
							<div class="mb-3">
								<label for="editPassword" class="block mb-1 text-sm font-medium">Password</label>
								<input
									id="editPassword"
									type={showNewPassword ? "text" : "password"}
									class="w-full border rounded px-3 py-2"
									bind:value={editPassword}
									placeholder="Leave empty if not changing"
								/>
								<div class="flex items-center mt-2">
									<input
										type="checkbox"
										id="toggle-new-password"
										bind:checked={showNewPassword}
										class="mr-2"
									/>
									<label for="toggle-new-password" class="text-sm select-none">Show password</label>
								</div>
							</div>
							<div class="mb-3">
								<label for="editConfirmPassword" class="block mb-1 text-sm font-medium">Confirm Password</label>
								<input
									id="editConfirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									class="w-full border rounded px-3 py-2"
									bind:value={editConfirmPassword}
									placeholder="Confirm your password if wish to change"
								/>
								<div class="flex items-center mt-2">
									<input
										type="checkbox"
										id="toggle-confirm-password"
										bind:checked={showConfirmPassword}
										class="mr-2"
									/>
									<label for="toggle-confirm-password" class="text-sm select-none">Show password</label>
								</div>
							</div>
						<!-- {/if} -->
						<div class="mb-3">
							<label for="editPathName" class="block mb-1 text-sm font-medium">Profile Picture URL</label>
							<input
								id="editPathName"
								type="text"
								class="w-full border rounded px-3 py-2"
								bind:value={editPathName}
								placeholder="Optional - leave empty for default"
							/>
						</div>
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
									{editFullName.trim() && editUsername.trim() && editUserRole.trim() && ((editPassword.trim() && editConfirmPassword) || (!editPassword.trim() && !editConfirmPassword))
									? 'bg-green-700 hover:bg-green-800'
									: 'cursor-not-allowed bg-gray-400'}"
								disabled={!(editFullName.trim() && editUsername.trim() && editUserRole.trim() && ((editPassword.trim() && editConfirmPassword) || (!editPassword.trim() && !editConfirmPassword)))}
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