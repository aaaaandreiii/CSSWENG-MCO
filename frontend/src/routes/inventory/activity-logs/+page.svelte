<script lang="ts">
	// import { PUBLIC_API_BASE_URL } from '$env/static/public';    //replaced by privateClient and publicClient
    import { publicClient } from '$lib/api/public.client';
    import privateClient   from '$lib/api/private.client';
	import { goto } from '$app/navigation';	
	import { onMount } from 'svelte';

	const header = [
		'Audit ID',
		'Action Type',
		'Description',
		'Timestamp',
		'User ID',
		'Performed By',
		'Username',
		'User Role'
	];

	let rows: { [key: string]: string }[] = [];
	let filteredRows: { [key: string]: string }[] = [];
	let sortColumn = '';
	let sortDirection: 'asc' | 'desc' = 'asc';
	let isLoading = false;
	let hasMoreData = true;
	let currentOffset = 0;
	const ITEMS_PER_PAGE = 100;
	let filterValue = '';
	let selectedUser = ''; // For dropdown selection
	// store default order for reset
	let originalRows = [...rows];

	// Get unique usernames for dropdown
	$: uniqueUsernames = [...new Set(rows.map(row => row['Username']))].filter(Boolean).sort();

	let sentinel: HTMLDivElement;

	let searchQuery = '';
	function handleSearch() {
		if (searchQuery.trim()) {
			goto(`/search?q=${encodeURIComponent(searchQuery)}`);
		}
	}

	onMount(() => {
		fetchData(0, false);

		const observer = new IntersectionObserver(([entry]) => {
		if (entry.isIntersecting && hasMoreData && !isLoading) {
			fetchData(currentOffset, true);
		}
		}, {
		root: null,            // uses the scrolling container
		rootMargin: '0px',
		threshold: 0.1
		});

		observer.observe(sentinel);
		return () => observer.disconnect();
	});

	async function fetchData(offset = 0, append = false) {
		if (isLoading) return;
		isLoading = true;
		try {
			// const token = localStorage.getItem('token');
			// const res = await fetch(`${PUBLIC_API_BASE_URL}/api/getAuditJoinedInformation?offset=${offset}&limit=${ITEMS_PER_PAGE}`, {
			// 	headers: { Authorization: `Bearer ${token}` }
			// });
			// const data = await res.json();
			const { data } = await privateClient.get('/api/getAuditJoinedInformation', {
				params: { offset, limit: ITEMS_PER_PAGE }
			});
			const newRows = data.auditJoinedInformation.map((item: any) => ({
				'Audit ID': item.auditId,
				'Action Type': item.actionType,
				'Description': item.description,
				'Timestamp': new Date(item.timestamp).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
				'User ID': item.userId,
				'Performed By': item.performedBy,
				'Username': item.username,
				'User Role': item.userRole
			}));
			hasMoreData = newRows.length === ITEMS_PER_PAGE;
			rows = append ? [...rows, ...newRows] : newRows;
			currentOffset = offset + newRows.length;

			if (!append) originalRows = [...rows];	//capture default ordering on first load
			applyFilter();
		} catch (err) {
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	function sortBy(column: string) {
		if (sortColumn === column) {
			if (sortDirection === 'asc') {
				sortDirection = 'desc';
			} else if (sortDirection === 'desc') {
				// if clicked a 3rd time, it goes back to defualt order
				sortColumn = '';
				sortDirection = 'asc';
				rows = [...originalRows];
				applyFilter(); 
				return;
			}
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}
		rows = [...rows].sort((a, b) => {
			let aVal = a[column];
			let bVal = b[column];

			//Special case for Image column lol
			if (column === "Image") {
				aVal = aVal?.split('/').pop() ?? '';
				bVal = bVal?.split('/').pop() ?? '';
			}

			if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});
		applyFilter(); 
	}

	function applyFilter() {
		const searchVal = filterValue.trim().toLowerCase();
		
		let filtered = [...rows];
		
		// Apply dropdown filter first
		if (selectedUser) {
			filtered = filtered.filter(row => row['Username'] === selectedUser);
		}
		
		// Then apply search filter
		if (searchVal) {
			filtered = filtered.filter(row =>
				String(row['Username']).toLowerCase().includes(searchVal)
			);
		}
		
		filteredRows = filtered;
	}

	// Update filter when dropdown selection changes
	function handleUserSelection() {
		applyFilter();
	}
</script>

<header class="flex justify-between p-7 fixed gray1 pr-70" style="width: 100%; z-index: 10;">
	<h1>Activity Logs</h1>
	<div class="flex gap-3">
		<div class="flex w-fit rounded-4xl bg-white px-3">
			<input 
				type="text" 
				placeholder="Search" 
				class="w-55 p-1" 
				style="outline:none" 
				bind:value={searchQuery}
				on:keydown={(e) => e.key === 'Enter' && handleSearch()}
			/>
			<button on:click={handleSearch}>
				<img src="../src/icons/search.svg" alt="search" style="width:15px;" />
			</button>
		</div>

		<div class="w-35 p-1 outline-none flex items-center justify-end">Filter By User</div>
		<!-- TODO: change this function to filter by user -->
		<div class="flex w-fit rounded-4xl bg-white px-3">
			<select
				class="w-35 p-1 outline-none"
				bind:value={selectedUser}
				on:change={handleUserSelection}
			>
				<option value="">All Users</option>
				{#each uniqueUsernames as username}
					<option value={username}>{username}</option>
				{/each}
			</select>
		</div>
	</div>
</header>

<div class = "pt-17"></div>

<!-- entire table -->
<div class = "m-5 border-1 rounded-lg border-gray-400 shadow-lg">
	<!-- Table -->
	<div class="w-full overflow-x-auto rounded-lg">
		<table class="w-full table-fixed border-collapse">
			<thead class="border-b border-black bg-white">
				<tr>
					{#each header as head}
						<th class="px-4 py-5 text-center">
							<button
								class="flex w-full items-center justify-center gap-1 font-bold"
								on:click={() => sortBy(head)}
							>
								<span class="w-full break-words whitespace-normal">{head}</span>
								<span class="inline-block w-4 min-w-[1rem] text-center align-middle"
									>{sortColumn === head
										? sortDirection === 'asc'
											? '▲'
											: sortDirection === 'desc'
												? '▼'
												: ''
										: ''}</span
								>
							</button>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each filteredRows as row, i}
					<tr class="border-b border-black {i % 2 === 0 ? 'bg-[#eeeeee]' : 'bg-white'}">
						{#each header as head}
							<td class="px-4 py-5 text-center">{row[head]}</td>
						{/each}
					</tr>
				{/each}
				{#if isLoading}
					<tr><td colspan={header.length} class="py-8 text-center">Loading...</td></tr>
				{/if}
				{#if !hasMoreData && filteredRows.length > 0}
					<tr><td colspan={header.length} class="py-4 text-center text-gray-500">No more data to load</td></tr>
				{/if}
			</tbody>
		</table>
		<div bind:this={sentinel}></div>
	</div>
</div>