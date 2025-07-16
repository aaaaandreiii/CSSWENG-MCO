<script lang="ts">
	type TabType =
		| 'Product'
		| 'Orders'
		| 'OrderInfo'
		| 'StockEntry'
		| 'StockWithdrawal'
		| 'ReturnExchange'
		| 'ReturnExchangelnfo';

	let selected: TabType = 'Product';

	const headerMap: Record<TabType, string[]> = {
		Product: [
			'productid',
			'productName',
			'category',
			'descriptions',
			'supplier',
			'productStatus',
			'cost',
			'retailPrice',
			'stockOnHand',
			'units',
			'lastEditedDate',
			'lastEditedUser'
		],
		Orders: [
			'orderld',
			'discount',
			'customer',
			'handledBy',
			'paymentMethod',
			'paymentStatus',
			'lastEditedDate',
			'lastEditedUser',
			'dateOrdered'
		],
		OrderInfo: [
			'orderinfoID',
			'quantity INT',
			'orderld',
			'productid',
			'unitPriceAtPurchase',
			'lastEditedDate',
			'lastEditedUser',
			'delete Flag'
		],
		StockEntry: [
			'entryld',
			'branchName',
			'dateReceived',
			'quantityReceived',
			'deliveryReceiptNumber',
			'receivedBy',
			'productld',
			'lastEditedDate',
			'lastEditedUser'
		],
		StockWithdrawal: [
			'withdrawalld',
			'dateWithdrawn',
			'quantityWithdrawn',
			'purpose',
			'entryld',
			'withdrawnBy',
			'authorizedBy',
			'lastEditedDate',
			'lastEditedUser'
		],
		ReturnExchange: [
			'transactionid',
			'dateTransaction',
			'transactionStatus',
			'orderld',
			'handledBy',
			'approvedBy',
			'lastEditedDate',
			'lastEditedUser'
		],
		ReturnExchangelnfo: [
			'detailld INT',
			'returnedProductId',
			'retunedQuantity',
			'exchangeProductld',
			'exchangeQuantity',
			'reason',
			'transactionid',
			'retumType',
			'lastEditedDate',
			'lastEditedUser'
		]
	};

	$: currentHeaders = headerMap[selected];

	// init selected rows
	let selectedRows: number[] = [];

	// modal states
	let showModal = false;
	let modalContent = '';

	// sorting states
	let sortColumn: string = '';
	let sortDirection: 'asc' | 'desc' = 'asc';

	// table data rows, can fill with dummy data
	let rows: { [key: string]: string }[] = [];
	
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
	headerMap.Product.push('Last Updated', 'Edited By');
	headerMap.Orders.push('Last Updated', 'Edited By');
	headerMap.OrderInfo.push('Last Updated', 'Edited By');
	headerMap.StockEntry.push('Last Updated', 'Edited By');
	headerMap.StockWithdrawal.push('Last Updated', 'Edited By');
	headerMap.ReturnExchange.push('Last Updated', 'Edited By');
	headerMap.ReturnExchangelnfo.push('Last Updated', 'Edited By');

	// edit button in popup
	let showEditButton = false;
	let modalRowIndex = -1;
	let modalColumn = '';
	function openModal(content: string, rowIndex = -1, column = '') {
		modalContent = content;
		showModal = true;
		showEditButton = false;
		modalRowIndex = rowIndex;
		modalColumn = column;
		if (rowIndex !== -1 && column) {
			cellEditForm = { value: rows[rowIndex][column] };
			isCellEditForm = true;
			isEditForm = false;
		} else {
			isCellEditForm = false;
		}
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

	let cellEditForm: { value: string } = { value: '' };
	let isCellEditForm = false;

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
		isCellEditForm = false;
		showModal = false;
	}

	// func to handle saving the cell edit form
	function handleCellEditFormSave() {
		if (modalRowIndex !== -1 && modalColumn) {
			rows[modalRowIndex][modalColumn] = cellEditForm.value;
			isCellEditForm = false;
			showModal = false;
		}
	}

	let addForm: { [key: string]: string } = {};
	let isAddForm = false;

	function openAddModal() {
		addForm = {};
		currentHeaders.forEach(h => addForm[h] = '');
		isAddForm = true;
		showModal = true;
		modalContent = '';
		isEditForm = false;
		isCellEditForm = false;
	}

	function handleAddFormCancel() {
		isAddForm = false;
		showModal = false;
	}

	function handleAddFormSave() {
		// Only add if at least one field is filled
		if (Object.values(addForm).some(v => v.trim() !== '')) {
			rows = [...rows, { ...addForm }];
			isAddForm = false;
			showModal = false;
		}
	}

	function handleDeleteSelectedRows() {
		// Remove rows whose index is in selectedRows
		rows = rows.filter((_, idx) => !selectedRows.includes(idx));
		selectedRows = [];
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
	<div class="flex w-full">
		{#each Object.keys(headerMap) as tab, idx (tab)}
			<button
				class="buttonss flex items-center justify-center transition-all duration-150 w-full text-center
					{selected === tab
						? 'selected font-bold bg-white'
						: 'bg-gray-100 truncate mr-2'}"
				style="{selected === tab ? '' : 'max-width: 7ch; min-width: 0;'}"
				on:click={() => (selected = tab as TabType)}
				title={tab}
			>
				<span class="w-full text-center">
					{selected === tab
						? tab
						: tab.length > 5 ? tab.slice(0, 5) + '...' : tab}
				</span>
			</button>
		{/each}
	</div>
	<!-- buttons for actions -->
	<div class="ml-auto flex gap-5 p-2.5 pr-10">
		<button 
			class="flex w-28 items-center justify-center gap-2 rounded-lg font-bold
				{selectedRows.length === 0 ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'red1 text-white hover:bg-red-700'}"
			disabled={selectedRows.length === 0}
			on:click={handleDeleteSelectedRows}
		>
			Delete
		</button>
		<button
			class="flex w-28 items-center justify-center gap-2 rounded-lg green1 text-white hover:bg-green-900 font-bold"
			on:click={openAddModal}
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
						style="width: calc({head.length}ch + 40px);"
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
							class="overflow-hidden px-4 py-5 text-center text-ellipsis whitespace-nowrap"
							style="width: calc({head.length}ch + 40px);"
							title={row[head]}
							on:click={() => openModal(row[head], i, head)}
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
		on:click={() => {
			if (isAddForm) handleAddFormCancel();
			else handleEditFormCancel();
		}}
		on:keydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				if (isAddForm) handleAddFormCancel();
				else handleEditFormCancel();
			}
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
			{#if isAddForm}
				<!-- add popup form for new row -->
				<form on:submit|preventDefault={handleAddFormSave}>
					{#each currentHeaders as head}
						<div class="mb-2">
							<label class="mb-1 block" for={'add-' + head}>{head}</label>
							<input
								id={'add-' + head}
								class="w-full rounded border px-2 py-1"
								type="text"
								bind:value={addForm[head]}
							/>
						</div>
					{/each}
					<div class="mt-4 flex gap-2">
						<button
							type="submit"
							class="rounded px-4 py-2 text-white
								{Object.values(addForm).some(v => v.trim() !== '') ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}"
							disabled={!Object.values(addForm).some(v => v.trim() !== '')}
						>
							Add
						</button>
						<button
							type="button"
							class="rounded bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
							on:click={handleAddFormCancel}>Cancel</button
						>
					</div>
				</form>
			{:else if isEditForm}
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
			{:else if isCellEditForm}
				<!-- edit popup form for individual cell -->
				<form on:submit|preventDefault={handleCellEditFormSave}>
					<div class="mb-2">
						<label class="mb-1 block font-bold" for={'cell-edit-' + modalColumn}>{modalColumn}</label>
						<input
							id={'cell-edit-' + modalColumn}
							class="w-full rounded border px-2 py-1"
							type="text"
							bind:value={cellEditForm.value}
						/>
					</div>
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
				<!-- fallback, should not be shown -->
				<div class="mb-4">{modalContent}</div>
			{/if}
		</div>
	</div>
{/if}
