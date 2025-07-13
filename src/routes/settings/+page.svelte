<script lang="ts">
	let selected = 'all'; // default selected tab = profile
	// let permissions = [
	// 	{ name: 'Can view', enabled: false },
	// 	{ name: 'Can edit', enabled: false },
	// 	{ name: 'Can approve', enabled: false },
	// 	{ name: 'Can create users', enabled: false }
	// ];
	let details = [
		{ name: 'Full Name', user: 'Useername123', date: 'January 19, 2955', position: 'Admin' },
		{ name: 'Staff User', user: 'Staff123', date: 'February 10, 2955', position: 'Staff' },
		{ name: 'Auditor User', user: 'AuditGuy', date: 'March 5, 2955', position: 'Auditor' },
		{ name: 'Manager User', user: 'ManagerX', date: 'April 1, 2955', position: 'Manager' }
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
		details[idx].position = option.charAt(0).toUpperCase() + option.slice(1);
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
</script>

<div class="flex min-h-screen bg-gray-200">
	<div class="flex-1 p-8">
		<!-- header -->
		<header class="mb-8 flex items-center justify-between">
			<h1 class="text-2xl font-normal">Settings</h1>
			<div class="flex w-fit rounded-4xl bg-white px-3">
				<input type="text" placeholder="Search" class="w-55 p-2" style="outline:none" />
				<img src="../src/icons/search.svg" alt="search" style="width:15px; " />
			</div>
		</header>

		<!-- settings nav bar -->
		<nav class="mb-0.">
			<ul class="flex space-x-4">
				<li>
					<a
						href="#all"
						class="px-4 text-lg {selected === 'all'
							? 'border-b-4 border-green-700 font-bold text-green-700'
							: 'text-black'}"
						onclick={() => { selected = 'all'; openDropdownIndex = null; }}
					>
						All
					</a>
				</li>
				<li>
					<a
						href="#admin"
						class="px-4 text-lg {selected === 'admin'
							? 'border-b-4 border-green-700 font-bold text-green-700'
							: 'text-black'}"
						onclick={() => { selected = 'admin'; openDropdownIndex = null; }}
					>
						Admin
					</a>
				</li>
				<li>
					<a
						href="#staff"
						class="px-4 text-lg {selected === 'staff'
							? 'border-b-4 border-green-700 font-bold text-green-700'
							: 'text-black'}"
						onclick={() => { selected = 'staff'; openDropdownIndex = null; }}
					>
						Staff
					</a>
				</li>
				<li>
					<a
						href="#auditor"
						class="px-4 text-lg {selected === 'auditor'
							? 'border-b-4 border-green-700 font-bold text-green-700'
							: 'text-black'}"
						onclick={() => { selected = 'auditor'; openDropdownIndex = null; }}
					>
						Auditor
					</a>
				</li>
				<li>
					<a
						href="#manager"
						class="px-4 text-lg {selected === 'manager'
							? 'border-b-4 border-green-700 font-bold text-green-700'
							: 'text-black'}"
						onclick={() => { selected = 'manager'; openDropdownIndex = null; }}
					>
						Manager
					</a>
				</li>
			</ul>
		</nav>
		<hr class="mb-8 border-gray-300" />

	<!-- permissions section, change roles as needed -->
		<div class=" grid grid-flow-col grid-cols-4 gap-5">
			{#if selected === 'all' || selected === 'admin' || selected === 'staff' || selected === 'auditor' || selected === 'manager'}
				{#each filteredDetails as detail, idx}
					<div class="mt-8 w-fit rounded-lg bg-white p-8">
						<div class="flex flex-col items-center">
							<span class="text-lg">{detail.name}</span>
							<img src="../src/images/logo.png" alt="pfp" />
							<!-- position tag with dropdown -->
							<div
								id={getColorId(detail.position)}
								class="relative flex w-fit items-center justify-center gap-1 px-5"
								bind:this={dropdownRef}
							>
								{#if selected == 'all'}
									<button
										class="flex w-full items-center justify-center gap-1 rounded-full px-3 py-1 focus:outline-none"
										onclick={() =>
											openDropdownIndex === idx
												? (openDropdownIndex = null)
												: (openDropdownIndex = idx)}
											
										aria-label="Show dropdown"
										style="background: none; border: none; cursor: pointer;"
									>
										<p class="mb-0 select-none">{detail.position}</p>
										<img
											src="../src/icons/down-black.svg"
											alt="dropdown arrow"
											style="width:16px;"
										/>
									</button>
								{:else}
									<div
										class="flex w-full items-center justify-center gap-1 rounded-full px-3 py-1 focus:outline-none"
										style="background: none; border: none; cursor: pointer;"
									>
										<p class="mb-0 select-none">{detail.position}</p>
									</div>
								{/if}

								{#if openDropdownIndex === idx}
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
	</div>
</div>
