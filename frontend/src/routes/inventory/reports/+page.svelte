<script lang="ts">
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
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
	// store default order for reset
	let originalRows = [...rows];

	let sentinel: HTMLDivElement;

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
			const token = localStorage.getItem('token');
			const res = await fetch(`${PUBLIC_API_BASE_URL}/api/getAuditJoinedInformation?offset=${offset}&limit=${ITEMS_PER_PAGE}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			const data = await res.json();
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
	}

	function applyFilter() {
		const val = filterValue.trim().toLowerCase();
		if (!val) {
			filteredRows = [...rows];
			return;
		}
		filteredRows = rows.filter(row =>
			Object.values(row).some(cell => String(cell).toLowerCase().includes(val))
		);
	}
</script>

<header class="flex justify-between p-7">
	<h1>Activity Logs</h1>
	<div class="flex gap-3">
		<div class="flex w-fit rounded-4xl bg-white px-3">
			<input
				type="text"
				placeholder="Search"
				class="w-55 p-1"
				style="outline:none"
				bind:value={filterValue}
				on:input={applyFilter}
			/>
			<img src="../src/icons/search.svg" alt="search" style="width:15px;" />
		</div>
		<div class="flex w-fit rounded-4xl bg-white px-3">
			<select class="w-35 p-1 outline-none" bind:value={sortColumn} on:change={() => sortBy(sortColumn)}>
				<option value="">Filter By User</option>
				{#each header as head}
					<option value={head}>{head}</option>
				{/each}
			</select>
		</div>
	</div>
</header>

<!-- Table -->
<div class="w-full overflow-x-auto">
	<table class="w-full table-fixed border-collapse">
		<thead class="border-b border-black bg-white">
			<tr>
				{#each header as head}
					<th class="px-4 py-5 text-center">{head}</th>
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