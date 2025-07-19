<script lang="ts">
	import {onMount} from 'svelte';
	type TabType =
		| 'Product'
		| 'Orders'
		| 'OrderInfo'
		| 'StockEntry'
		| 'StockWithdrawal'
		| 'ReturnExchange'
		| 'ReturnExchangelnfo';

	let selected: TabType = 'Product';

	const getApiMap: Record<TabType, string> = {
		Product: 'getProducts',
		Orders: 'getOrders',
		OrderInfo: 'getOrderInfo',
		StockEntry: 'getStockEntries',
		StockWithdrawal: 'getStockWithdrawals',
		ReturnExchange: 'getReturnExchanges',
		ReturnExchangelnfo: 'getReturnExchangeInfo'
	};

	const headerMap: Record<TabType, string[]> = {
		Product: [
			'Product ID',
			'Product Name',
			'Category',
			'Descriptions',
			'Supplier',
			'Cost',
			'Retail Price',
			'Stock On Hand',
			'Units',
			'Image', //pathName
			'Last Edited Date',
			'Last Edited User'
		],
		Orders: [
			'Order ID',
			'Discount',
			'Customer',
			'Handled By',
			'Payment Method',
			'Payment Status',
			'Date Ordered',
			'Last Edited Date',
			'Last Edited User'
		],
		OrderInfo: [
			'Order Info ID',
			'Quantity',
			'Order ID',
			'Product ID',
			'Unit Price At Purchase',
			'Last Edited Date',
			'Last Edited User',
		],
		StockEntry: [
			'Entry ID',
			'Branch Name',
			'Date Received',
			'Quantity Received',
			'Delivery Receipt Number',
			'Received By',
			'Product ID',
			'Last Edited Date',
			'Last Edited User'
		],
		StockWithdrawal: [
			'Withdrawal ID',
			'Date Withdrawn',
			'Quantity Withdrawn',
			'Purpose',
			'Entry ID',
			'Withdrawn By',
			'Authorized By',
			'Last Edited Date',
			'Last Edited User'
		],
		ReturnExchange: [
			'Transaction ID',
			'Date Transaction',
			'Transaction Status',
			'Order ID',
			'Handled By',
			'Approved By',
			'Last Edited Date',
			'Last Edited User'
		],
		ReturnExchangelnfo: [
			'Detail ID',
			'Returned Product ID',
			'Returned Quantity',
			'Exchange Product ID',
			'Exchange Quantity',
			'Reason',
			'Transaction ID',
			'Return Type',
			'Last Edited Date',
			'Last Edited User'
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
	
	let ready = false;
	onMount(()=>{
		ready = true;
	});

	$: if(ready && selected){
		fetchTabData(selected);
	}

	async function fetchTabData(tab: TabType){
		try{
			const token = localStorage.getItem('token');
			const endpoint = getApiMap[tab];
			const res = await fetch(`http://localhost:5000/api/${endpoint}`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			const data = await res.json();
        	console.log('Fetched data:', data);

			if(tab === "Product"){
				rows = data.products.map((item: any) =>({
					'Product ID': item.productId,
					'Product Name': item.productName,
					'Category': item.category,
					'Descriptions': item.descriptions,
					'Supplier': item.supplier,
					'Cost': item.cost,
					'Retail Price': item.retailPrice,
					'Stock On Hand': item.stockOnHand.toString(),
					'Units': item.units,
					'Image': item.pathName,
					'Last Edited Date': new Date(item.lastEditedDate).toLocaleString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Last Edited User': item.lastEditedUser
        		}));
			}
			else if(tab === "Orders"){
				rows = data.orders.map((item: any) =>({
					'Order ID': item.orderId,
					'Discount': item.discount,
					'Customer': item.customer,
					'Handled By': item.handledBy,
					'Payment Method': item.paymentMethod,
					'Payment Status': item.paymentStatus,
					'Date Ordered': new Date(item.dateOrdered).toLocaleDateString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Last Edited Date': new Date(item.lastEditedDate).toLocaleString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Last Edited User': item.lastEditedUser
				}));
			}
			else if(tab === "OrderInfo"){
				rows = data.orderInfo.map((item: any) =>({
					'Order Info ID': item.orderInfoId,
					'Quantity': item.quantity,
					'Order ID': item.orderId,
					'Product ID': item.productId,
					'Unit Price At Purchase': item.unitPriceAtPurchase,
					'Last Edited Date': new Date(item.lastEditedDate).toLocaleString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Last Edited User': item.lastEditedUser
				}));
			}
			else if(tab === "StockEntry"){
				rows = data.stockEntries.map((item: any) =>({
					'Entry ID': item.entryId,
					'Branch Name': item.branchName,
					'Date Received': new Date(item.dateReceived).toLocaleDateString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Quantity Received': item.quantityReceived,
					'Delivery Receipt Number': item.deliveryReceiptNumber,
					'Received By': item.receivedBy,
					'Product ID': item.productId,
					'Last Edited Date': new Date(item.lastEditedDate).toLocaleString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Last Edited User': item.lastEditedUser
				}));
			}
			else if(tab === "StockWithdrawal"){
				rows = data.stockWithdrawals.map((item: any) =>({
					'Withdrawal ID': item.withdrawalId,
					'Date Withdrawn': new Date(item.dateWithdrawn).toLocaleDateString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Quantity Withdrawn': item.quantityWithdrawn,
					'Purpose': item.purpose,
					'Entry ID': item.entryId,
					'Withdrawn By': item.withdrawnBy,
					'Authorized By': item.authorizedBy,
					'Last Edited Date': new Date(item.lastEditedDate).toLocaleString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Last Edited User': item.lastEditedUser
				}));
			}
			else if(tab === "ReturnExchange"){
				rows = data.returnExchanges.map((item: any) =>({
					'Transaction ID': item.transactionId,
					'Date Transaction': new Date(item.dateTransaction).toLocaleDateString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Transaction Status': item.transactionStatus,
					'Order ID': item.orderId,
					'Handled By': item.handledBy,
					'Approved By': item.approvedBy,
					'Last Edited Date': new Date(item.lastEditedDate).toLocaleString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Last Edited User': item.lastEditedUser
				}));
			}
			else if(tab === "ReturnExchangelnfo"){
				rows = data.returnExchangeInfo.map((item: any) =>({
					'Detail ID': item.detailId,
					'Returned Product ID': item.returnedProductId,
					'Returned Quantity': item.returnedQuantity,
					'Exchange Product ID': item.exchangeProductId,
					'Exchange Quantity': item.exchangeQuantity,
					'Reason': item.reason,
					'Transaction ID': item.transactionId,
					'Return Type': item.returnType,
					'Last Edited Date': new Date(item.lastEditedDate).toLocaleString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Last Edited User': item.lastEditedUser
				}));
			}
			originalRows = [...rows];
		}catch(err){
			console.error("Error fetching tab data: ", err);
		}
	}

	// store default order for reset
	let originalRows = [...rows];

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

	// constant column headers
	// headerMap.Product.push('Last Updated', 'Edited By');
	// headerMap.Orders.push('Last Updated', 'Edited By');
	// headerMap.OrderInfo.push('Last Updated', 'Edited By');
	// headerMap.StockEntry.push('Last Updated', 'Edited By');
	// headerMap.StockWithdrawal.push('Last Updated', 'Edited By');
	// headerMap.ReturnExchange.push('Last Updated', 'Edited By');
	// headerMap.ReturnExchangelnfo.push('Last Updated', 'Edited By');

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
		currentHeaders.forEach((h) => (addForm[h] = ''));
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
		if (Object.values(addForm).some((v) => v.trim() !== '')) {
			rows = [...rows, { ...addForm }];
			isAddForm = false;
			showModal = false;
		}
	}

	function handleDeleteSelectedRows() {
		if (
			selectedRows.length > 0 &&
			confirm(`Are you sure you want to delete ${selectedRows.length} selected row(s)?`)
		) {
			rows = rows.filter((_, idx) => !selectedRows.includes(idx));
			selectedRows = [];
		}
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
				class="buttonss flex w-full items-center justify-center text-center transition-all duration-150
					{selected === tab ? 'selected bg-white font-bold' : 'mr-2 truncate bg-gray-100'}"
				style={selected === tab ? '' : 'max-width: 12ch; min-width: 0;'}
				on:click={() => (selected = tab as TabType)}
				title={tab}
			>
				<span class="w-full text-center">
					{selected === tab ? tab : tab.length > 6 ? tab.slice(0, 6) + '...' : tab}
				</span>
			</button>
		{/each}
	</div>
	<!-- buttons for actions -->
	<div class="ml-auto flex gap-5 p-2.5 pr-10">
		<button
			class="flex w-28 items-center justify-center gap-2 rounded-lg font-bold
				{selectedRows.length === 0
				? 'cursor-not-allowed bg-gray-400 text-gray-200'
				: 'red1 text-white hover:bg-red-700'}"
			disabled={selectedRows.length === 0}
			on:click={handleDeleteSelectedRows}
		>
			Delete
		</button>
		<button
			class="green1 flex w-28 items-center justify-center gap-2 rounded-lg font-bold text-white hover:bg-green-900"
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
						{#if head === "Image"}
							{#if row[head]}
								<img src = {row[head]} alt="" class="mx-auto max-h-16 max-w-[100px] object-contain"/>
							{:else}
								<span class="text-gray-400 italic">Null</span>
							{/if}
						{:else}
							{row[head]}
						{/if}
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
								{Object.values(addForm).some((v) => v.trim() !== '')
								? 'bg-green-600 hover:bg-green-700'
								: 'cursor-not-allowed bg-gray-400'}"
							disabled={!Object.values(addForm).some((v) => v.trim() !== '')}
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
						<label class="mb-1 block font-bold" for={'cell-edit-' + modalColumn}
							>{modalColumn}</label
						>
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