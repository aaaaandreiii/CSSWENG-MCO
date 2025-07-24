<script lang="ts">
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { onMount } from 'svelte';

	const header = [
		'Withdrawal ID',
		'Date Withdrawn',
		'Quantity Withdrawn',
		'Purpose',
		'Entry ID',
		'Withdrawn By',
		'Authorized By',
		'Last Edited Date',
		'Last Edited User'
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

	onMount(() => {
		fetchData();
	});

	async function fetchData(offset = 0, append = false) {
		if (isLoading) return;
		isLoading = true;
		try {
			const token = localStorage.getItem('token');
			const res = await fetch(`${PUBLIC_API_BASE_URL}/api/getStockWithdrawals?offset=${offset}&limit=${ITEMS_PER_PAGE}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			const data = await res.json();
			const newRows = data.stockWithdrawals.map((item: any) => ({
				'Withdrawal ID': item.withdrawalId,
				'Date Withdrawn': new Date(item.dateWithdrawn).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' }),
				'Quantity Withdrawn': item.quantityWithdrawn,
				'Purpose': item.purpose,
				'Entry ID': item.entryId,
				'Withdrawn By': item.withdrawnBy,
				'Authorized By': item.authorizedBy,
				'Last Edited Date': new Date(item.lastEditedDate).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
				'Last Edited User': item.lastEditedUser
			}));
			hasMoreData = newRows.length === ITEMS_PER_PAGE;
			rows = append ? [...rows, ...newRows] : newRows;
			applyFilter();
		} catch (err) {
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	function sortBy(column: string) {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? '' : 'asc';
			if (!sortDirection) return;
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}
		filteredRows = [...filteredRows].sort((a, b) => {
			const aVal = a[column];
			const bVal = b[column];
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
</div>
