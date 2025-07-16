<script lang="ts">
	type TabType = 'returns' | 'completed' | 'stocks';
	let selected: TabType = 'stocks';

	const headerMap: Record<TabType, string[]> = {
		returns: [
			'Transaction ID',
			'Product/s Returned',
			'Reason for Return',
			'Date Returned',
			'Resolution Status',
			'Approved By',
			'Qty Returned'
		],
		completed: [
			'Transaction ID',
			'Products Purchased',
			'Qty Purchased',
			'Date Purchased',
			'Date Delivered',
			'Address Delivered',
			'Buyer Name'
		],
		stocks: [
			'Product ID',
			'Product Name',
			'Product Type',
			'Product Description',
			'Product Manufacturer',
			'Current Warehouse',
			'Stock Amt'
		]
	};

	$: currentHeaders = headerMap[selected];

	let rows: { [key: string]: string }[] = [
		{
			'Product ID': '1',
			'Product Name': 'A',
			'Product Type': 'Gadget',
			'Product Description': 'Description A',
			'Product Manufacturer': 'Manufacturer A',
			'Current Warehouse': 'Warehouse 1',
			'Stock Amt': '100'
		},
		{
			'Product ID': '2',
			'Product Name': 'B',
			'Product Type': 'Gadget',
			'Product Description': 'Description B',
			'Product Manufacturer': 'Manufacturer B',
			'Current Warehouse': 'Warehouse 2',
			'Stock Amt': '50'
		}
		// add more dummy entries as needed
	];

	// init selected rows
	let selectedRows = [];

	// modal states
	let showModal = false;
	let modalContent = '';

	// sorting states
	let sortColumn: string = '';
	let sortDirection: 'asc' | 'desc' = 'asc';

	// store default order for reset
	const originalRows = [...rows];

	// sortby function for col heads
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
			if (a[column] < b[column]) return sortDirection === 'asc' ? -1 : 1;
			if (a[column] > b[column]) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});
	}

	// constant column headers
	headerMap.returns.push('Last Updated', 'Edited By');
	headerMap.completed.push('Last Updated', 'Edited By');
	headerMap.stocks.push('Last Updated', 'Edited By');

	// edit button in popup
	let showEditButton = false;
	let modalRowIndex = -1;
	function openModal(content: string, rowIndex = -1) {
		modalContent = content;
		showModal = true;
		showEditButton = rowIndex !== -1;
		modalRowIndex = rowIndex;
	}

	// func to close popup
	function closeModal() {
		showModal = false;
		modalContent = '';
	}

	// func to handle edit in cell popup
	function handleEdit(rowIndex: number) {
		// impl edit func here
		alert('Edited row: ' + rowIndex);
	}

	// func to open edit popup for entire row
	function openEditModal(rowIndex: number) {
		modalRowIndex = rowIndex;
		showModal = true;
		showEditButton = false;
		modalContent = '';
		editForm = { ...rows[rowIndex] };
		isEditForm = true;
	}

	let editForm: { [key: string]: string } = {};
	let isEditForm = false;

	// func to handle saving the edit form
	function handleEditFormSave() {
		if (modalRowIndex !== -1) {
			rows[modalRowIndex] = { ...editForm };
			isEditForm = false;
			showModal = false;
		}
	}

	// func to handle canceling the edit form
	function handleEditFormCancel() {
		isEditForm = false;
		showModal = false;
	}
</script>

<!-- header w/ search bar and filter-->
<header class="flex justify-between p-7">
	<h1>Inventory</h1>

	<div class="flex gap-3">
		<div class="flex w-fit rounded-4xl bg-white px-3">
			<input type="text" placeholder="Search" class="w-55 p-2" style="outline:none" />
			<img src="../src/icons/search.svg" alt="search" style="width:15px; " />
		</div>
		<div class="flex w-fit rounded-4xl bg-white px-3">
			<!-- dropdown for order by, auto includes all col headers -->
			<select
				class="w-35 p-2 outline-none"
				bind:value={sortColumn}
				on:change={() => sortBy(sortColumn)}
			>
				<option value="">All</option>
				{#each currentHeaders as head}
					<option value={head}>{head}</option>
				{/each}
			</select>
		</div>
	</div>
</header>

<!-- navbar + buttons row -->
<div class="grid grid-cols-2">
	<!-- navbar -->
	<div class="flex">
		<button
			class="buttonss flex items-center justify-center {selected === 'stocks' ? 'selected' : ''}"
			on:click={() => (selected = 'stocks')}
		>
			<div class="flex items-center gap-2">
				<img src="../src/icons/box.svg" alt="Stocks" class="w-6" />
				Stocks
			</div>
		</button>
		<button
			class="buttonss flex items-center justify-center {selected === 'completed' ? 'selected' : ''}"
			on:click={() => (selected = 'completed')}
		>
			<div class="flex items-center gap-2">
				<img src="../src/icons/completed.svg" alt="Completed" class="w-6" />
				Completed
			</div>
		</button>
		<button
			class="buttonss flex items-center justify-center {selected === 'returns' ? 'selected' : ''}"
			on:click={() => (selected = 'returns')}
		>
			<div class="flex items-center gap-2">
				<img src="../src/icons/returns.svg" alt="Returns" class="w-6" />
				Returns
			</div>
		</button>
	</div>
	<!-- buttons for actions -->
	<div class="ml-auto flex gap-5 p-2.5 pr-10">
		<!-- absolute top-0 right-0 bg-gray-200 px-4 py-2  -->
		<button 
			class="flex w-28 items-center justify-center gap-2 rounded-lg red1 text-white hover:bg-red-700 font-bold"
		>
			Delete
		</button>
		<button
			class="flex w-28 items-center justify-center gap-2 rounded-lg green1 text-white hover:bg-green-900 font-bold"
		>
			Add
		</button>
	</div>
</div>

<!-- table -->
<div class="w-full overflow-x-auto">
	<table class="w-full table-fixed border-collapse">
		<thead class="border-b border-black bg-white">
			<tr>
				<th class="w-[40px] max-w-[40px] min-w-[40px] py-5 text-center"></th>
				{#each currentHeaders as head}
					<th
						class="px-4 py-5 text-center align-middle break-words whitespace-normal"
						style="width: auto; min-width: 100px; max-width: 400px;"
					>
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
				<th class="w-[40px] max-w-[40px] min-w-[40px] py-5 text-center"></th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row, i}
				<tr class="border-b border-black {i % 2 === 0 ? 'bg-[#eeeeee]' : 'bg-white'}">
					<td class="w-[40px] max-w-[40px] min-w-[40px] py-5 text-center"
						><input type="checkbox" bind:group={selectedRows} value={i} /></td
					>
					{#each currentHeaders as head}
						<td
							class="max-h-[60px] max-w-[400px] min-w-[100px] overflow-hidden px-4 py-5 text-center text-ellipsis whitespace-nowrap"
							title={row[head]}
							on:click={() => openModal(row[head], i)}
						>
							{row[head]}
						</td>
					{/each}
					<td class="w-[40px] max-w-[40px] min-w-[40px] py-5 text-center">
						<button
							type="button"
							class="mx-auto flex h-5 w-5 items-center justify-center"
							aria-label="Edit"
							on:click={() => openEditModal(i)}
						>
							<img src="../src/icons/edit.svg" alt="" class="pointer-events-none h-5 w-5" />
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<!-- modal popup-->
{#if showModal}
	<div
		class="modal-backdrop"
		role="button"
		tabindex="0"
		aria-label="Close modal"
		on:click={closeModal}
		on:keydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') closeModal();
		}}
	>
		<div
			class="modal-box"
			role="dialog"
			aria-modal="true"
			tabindex="0"
			on:click|stopPropagation
			on:keydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
			}}
		>
			{#if isEditForm}
				<!-- edit popup form for entire row -->
				<form on:submit|preventDefault={handleEditFormSave}>
					{#each currentHeaders as head}
						<div class="mb-2">
							<label class="mb-1 block font-bold" for={'edit-' + head}>{head}</label>
							<input
								id={'edit-' + head}
								class="w-full rounded border px-2 py-1"
								type="text"
								bind:value={editForm[head]}
							/>
						</div>
					{/each}
					<div class="mt-4 flex gap-2">
						<button
							type="submit"
							class="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">Save</button
						>
						<button
							type="button"
							class="rounded bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
							on:click={handleEditFormCancel}>Cancel</button
						>
					</div>
				</form>
			{:else}
				<!-- indiv popup for indiv cell content -->
				<div class="mb-4">{modalContent}</div>
				{#if showEditButton}
					<button
						class="mt-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
						on:click={() => handleEdit(modalRowIndex)}
					>
						Edit
					</button>
				{/if}
			{/if}
		</div>
	</div>
{/if}
