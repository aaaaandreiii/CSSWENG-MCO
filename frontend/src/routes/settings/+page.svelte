<script lang="ts">
	let selected = 'all'; // default selected tab = profile

	let hasDropdownChanged = false;
	
	let details = [
		{ userId: 'U001', name: 'Full Name', user: 'Username123', date: 'January 19, 2955', position: 'Admin', profilePic: '../src/images/jett.png' },
		{ userId: 'U002', name: 'Staff User', user: 'Staff123', date: 'February 10, 2955', position: 'Staff', profilePic: '../src/images/lemon.png' },
		{ userId: 'U003', name: 'Auditor User', user: 'AuditGuy', date: 'March 5, 2955', position: 'Auditor', profilePic: '../src/images/cat.png' },
		{ userId: 'U004', name: 'Manager User', user: 'ManagerX', date: 'April 1, 2955', position: 'Manager', profilePic: '../src/images/sage.png' }
	];


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

	import { onMount } from 'svelte';

	let dropdownRef: HTMLDivElement | null = null;

	// function handleClickOutside(event: MouseEvent) { 
	// // doesnt update dropdownindex to new selection, 
	// //instead it closes dropdown by becoming null (retains old index in the process)
	// 	if (openDropdownIndex !== null && dropdownRef && !dropdownRef.contains(event.target as Node)) {
	// 		openDropdownIndex = null;
	// 	}
	// }

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

</script>

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
			<ul class="flex space-x-4 self-end">
				<li>
<a
	href="#all"
	class="px-4 text-lg {selected === 'all'
		? 'border-b-4 border-green-700 font-bold text-green-700'
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
	class="px-4 text-lg {selected === 'admin'
		? 'border-b-4 border-green-700 font-bold text-green-700'
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
	class="px-4 text-lg {selected === 'staff'
		? 'border-b-4 border-green-700 font-bold text-green-700'
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
	class="px-4 text-lg {selected === 'auditor'
		? 'border-b-4 border-green-700 font-bold text-green-700'
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
	class="px-4 text-lg {selected === 'manager'
		? 'border-b-4 border-green-700 font-bold text-green-700'
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
			>
				<img src="../src/icons/add.svg" alt="Add" style="width: 50px;" />
			</button>
		{/if}
		{#if isEditMode}
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
	</div>
</div>
