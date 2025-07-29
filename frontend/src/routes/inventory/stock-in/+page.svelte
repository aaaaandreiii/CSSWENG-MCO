<script lang="ts">
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	
	import {onMount} from 'svelte';
	type TabType =
		| 'StockEntryExpanded';

	let selected: TabType = 'StockEntryExpanded';

	const getApiMap: Record<TabType, string> = {
		StockEntryExpanded: 'getStockEntryExpanded'
	};

	const createApiMap: Record<TabType, string> = {
		StockEntryExpanded: 'createStockEntryExpanded'
	};

	const updateApiMap: Record<TabType, string> = {
		StockEntryExpanded: 'getStockEntryExpanded'
	};
	const deleteApiMap: Record<TabType, string> = {
		StockEntryExpanded: "deleteStockEntryExpanded"
	};

	const keyMap: Record<TabType, Record<string, string>> = {
		StockEntryExpanded: {
			'Entry ID': 'entryId',
			'Branch Name': 'branchName',
			'Date Received': 'dateReceived',
			'Quantity Received': 'quantityReceived',
			'Delivery Receipt Number': 'deliveryReceiptNumber',
			'Product Name': 'productName',
			'Received By': 'receivedBy',
			'Last Edited By': 'lastEditedBy',
			'Last Edited Date': 'lastEditedDate'
		}
	}

	const idValidationMap: Record<TabType, { field: string; endpoint: string }[]> = {
		StockEntryExpanded: [ 
			{ field: 'Received By', endpoint: 'getUserById' },
			{ field: 'Last Edited By', endpoint: 'getUserById' },
			{ field: 'Product Name', endpoint: 'getProductById' } // Optional: Only if needed
		],
	};


	const primaryKeyMap: Record<TabType, string> = {
		StockEntryExpanded: 'Entry ID'
	};


	const headerMap: Record<TabType, string[]> = {
		StockEntryExpanded: [
			'Entry ID',
			'Branch Name',
			'Date Received',
			'Quantity Received',
			'Delivery Receipt Number',
			'Product Name',
			'Received By',
			'Last Edited By',
			'Last Edited Date'
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

	// pagination and infinite scroll state
	let currentOffset = 0;
	let isLoading = false;
	let hasMoreData = true;
	const ITEMS_PER_PAGE = 100;

	let ready = false;
	onMount(()=>{
		ready = true;
	});

	$: if (ready && selected) {
		(async () => {
			// Reset pagination when tab changes
			currentOffset = 0;
			hasMoreData = true;
			rows = [];
			await fetchTabData(selected);
		})();
	}

	async function fetchTabData(tab: TabType, offset = 0, append = false){
		if (isLoading) return;
		isLoading = true;

		console.log('Selected Tab:', tab);
	// console.log('Raw API response:', data);

		try{
			const token = localStorage.getItem('token');
			const endpoint = getApiMap[tab];
			const res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}?offset=${offset}&limit=${ITEMS_PER_PAGE}`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			const data = await res.json();
        	console.log('Fetched data:', data);

			let newRows: { [key: string]: string }[] = [];

			if(tab === "StockEntryExpanded"){
				newRows = data.stockEntryExpanded.map((item: any) => ({
					'Entry ID': item['Entry ID'],
					'Branch Name': item['Branch Name'],
					'Date Received': new Date(item['Date Received']).toLocaleDateString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Quantity Received': item['Quantity Received'],
					'Delivery Receipt Number': item['Delivery Receipt Number'],
					'Product Name': item['Product Name'],
					'Received By': item['Received By'],
					'Last Edited By': item['Last Edited By'],
					'Last Edited Date': new Date(item['Last Edited Date']).toLocaleString('en-PH', {
						timeZone: 'Asia/Manila'
					})
				}));
			}


			// Check if we have more data
			hasMoreData = newRows.length === ITEMS_PER_PAGE;

			if (append) {
				rows = [...rows, ...newRows];
			} else {
				rows = newRows;
			}
			
			if (!append) {
				originalRows = [...rows];
			} else {
				originalRows = [...originalRows, ...newRows];
			}
		}catch(err){
			console.error("Error fetching tab data: ", err);
		} finally {
			isLoading = false;
		}
	}

	async function loadMoreData() {
		if (!hasMoreData || isLoading) return;
		
		currentOffset += ITEMS_PER_PAGE; //increments the offset by 100 per page, so it doesn't display the same 100 rows per refresh
		await fetchTabData(selected, currentOffset, true);
	}

	function handleScroll(event: Event) {
		const target = event.target as HTMLElement;
		const { scrollTop, scrollHeight, clientHeight } = target;
		
		// Load more when user is near the bottom (within 200px)
		if (scrollHeight - scrollTop - clientHeight < 200 && hasMoreData && !isLoading) {
			loadMoreData();
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
	// headerMap.Users.push('Last Updated', 'Edited By');

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
	async function handleEditFormSave() {
		if (modalRowIndex !== -1) {
			const token = localStorage.getItem('token');
			const endpoint = updateApiMap[selected];
			const primaryKey = primaryKeyMap[selected];
			const rowId = rows[modalRowIndex][primaryKey];
			const finalForm: {[key: string]: any} = {};
			const varKey = keyMap[selected];

			const validations = idValidationMap[selected] || [];
				for(const {field, endpoint: idEndpoint} of validations){
					const raw = editForm[field];
					const trim = typeof raw === 'string' ? raw.trim(): raw;
					if(trim === '' || isNaN(Number(trim))){
						alert(`${field} must be a number.`);
						return;
					}
					const id = Number(trim);
					const exists = await validate(idEndpoint, id)
					if(!exists){
						alert(`${field} ${id} does not exist in the database.`);
						return;
					}
					const finalKey = varKey[field];
					if(finalKey) {
						finalForm[finalKey] = id;
					}
				}

			for(const key in editForm){
				const bKey = varKey[key];
				if (!bKey || finalForm.hasOwnProperty(bKey)) continue;
				const raw = editForm[key];
				const value = typeof raw === 'string'? raw.trim(): raw;
				if(bKey === 'pathName'){
					finalForm[bKey] = value === '' ? null: value;
				}
				else if(value !== '' && value !== null && value !== undefined){
					if(['cost', 'retailPrice', 'stockOnHand', 'safeStockCount', 'restockFlag', 'discount', 'quantity', 'unitPriceAtPurchase', 'quantityReceived', 'deliveryReceiptNumber', 'quantityWithdrawn', 'returnedQuantity', 'exchangeQuantity'].includes(bKey)){
						const num = Number(value);
						if(isNaN(num) || num < 0){
							alert(`${bKey} must be a valid number`);
							return;
						}
							finalForm[bKey] = num;
					}
					else{
						finalForm[bKey] = value;
					}
				}
			}
			try{
				const res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}/${rowId}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify(finalForm)
				});
				// const data = await res.json();
				if(!res.ok){
					alert("Error updating!");
					return;
				}
				await fetchTabData(selected);
				
				// Reset pagination and reload from beginning after edit
				currentOffset = 0;
				hasMoreData = true;
				rows = [];
				await fetchTabData(selected);
				
				// rows[modalRowIndex] = { ...editForm };
				isEditForm = false;
				showModal = false;
			}catch(err){
				console.error("Error updating: ", err);
			}
		}
	}

	// func to handle canceling the edit form
	function handleEditFormCancel() {
		isEditForm = false;
		isCellEditForm = false;
		showModal = false;
	}

	// func to handle saving the cell edit form
	async function handleCellEditFormSave() {
		if (modalRowIndex !== -1 && modalColumn) {
			const token = localStorage.getItem('token');
			const endpoint = updateApiMap[selected];
			const primaryKey = primaryKeyMap[selected];
			const rowId = rows[modalRowIndex][primaryKey]; //primary key: id
			const rowData = rows[modalRowIndex]; //data before update
			const varKey = keyMap[selected];

			const updatedRow = {...rowData, [modalColumn]: cellEditForm.value}; 
			
			const validations = idValidationMap[selected] || [];
			const foreignIds = validations.map(v => v.field);

			const convertedRow: Record<string, any> = {}; //convert datatype
			for(const displayKey in updatedRow){
				const bKey = varKey[displayKey]; //converts Product Name to productName(match backend)
				if(bKey){ 
					let value = updatedRow[displayKey] as string | number;
					if(foreignIds.includes(bKey)){ //if foreign Id
						const num = Number(value);
						value = num;
					}
					else if (typeof value === 'string') {
						value = value.trim();
					}	
					convertedRow[bKey] = value;
				}
			}
			if(typeof convertedRow.cost === 'string'){
				convertedRow.cost = Number(convertedRow.cost);
			}
			if(typeof convertedRow.retailPrice === 'string'){
				convertedRow.retailPrice = Number(convertedRow.retailPrice);
			}
			if(typeof convertedRow.stockOnHand === 'string'){
				convertedRow.stockOnHand = Number(convertedRow.stockOnHand);
			}
			if(typeof convertedRow.safeStockCount === 'string'){
				convertedRow.safeStockCount = Number(convertedRow.safeStockCount);
			}
			if(typeof convertedRow.restockFlag === 'string'){
				convertedRow.restockFlag = Number(convertedRow.restockFlag);
			}
			if(typeof convertedRow.discount === 'string'){
				convertedRow.discount = Number(convertedRow.discount);
			}
			if(typeof convertedRow.quantity === 'string'){
				convertedRow.quantity = Number(convertedRow.quantity);
			}
			if(typeof convertedRow.unitPriceAtPurchase === 'string'){
				convertedRow.unitPriceAtPurchase = Number(convertedRow.unitPriceAtPurchase);
			}
			if(typeof convertedRow.quantityReceived === 'string'){
				convertedRow.quantityReceived = Number(convertedRow.quantityReceived);
			}
			if(typeof convertedRow.deliveryReceiptNumber === 'string'){
				convertedRow.deliveryReceiptNumber = Number(convertedRow.deliveryReceiptNumber);
			}
			if(typeof convertedRow.quantityWithdrawn === 'string'){
				convertedRow.quantityWithdrawn = Number(convertedRow.quantityWithdrawn);
			}
			if(typeof convertedRow.returnedQuantity === 'string'){
				convertedRow.returnedQuantity = Number(convertedRow.returnedQuantity);
			}
			if(typeof convertedRow.exchangeQuantity === 'string'){
				convertedRow.exchangeQuantity = Number(convertedRow.exchangeQuantity);
			}

			const finalForm: Record<string, any> ={
				...convertedRow
			};
			
			const field = modalColumn;
			const raw = cellEditForm.value;
			const trim = typeof raw === 'string' ? raw.trim(): raw;		
			const validation = validations.find(v => v.field === field);
			if(validation){
				if(trim === '' || isNaN(Number(trim))){
					alert(`${field} must be a number.`);
					return;
				}
				const id = Number(trim);
				const exists = await validate(validation.endpoint, id)
				if(!exists){
					alert(`${field} ${id} does not exist in the database.`);
					return;
				}
				const finalKey = varKey[field];
				if(finalKey) {
					finalForm[finalKey] = id;
				}
			}
			else{
				const bKey = varKey[field];
				if(bKey === 'pathName'){
					finalForm[bKey] = trim === '' ? null: trim;
				}
				else if(trim !== '' && trim !== null && trim !== undefined){
					if(['cost', 'retailPrice', 'stockOnHand', 'safeStockCount', 'restockFlag', 'discount', 'quantity', 'unitPriceAtPurchase', 'quantityReceived', 'deliveryReceiptNumber', 'quantityWithdrawn', 'returnedQuantity', 'exchangeQuantity'].includes(bKey)){
						const num = Number(trim);
						if(isNaN(num) || num < 0){
							alert(`${bKey} must be a valid number`);
							return;
						}
							finalForm[bKey] = num;
					}
					else{
						finalForm[bKey] = trim;
					}
				}
			}
			// console.log("finalForm", finalForm);
			// console.log("updatedRow", updatedRow);
			try{
				const res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}/${rowId}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify(finalForm)
				});
				// const data = await res.json();
				if(!res.ok){
					alert("Error updating!");
					return;
				}
				await fetchTabData(selected);
		
				// Reset pagination and reload from beginning after edit
				currentOffset = 0;
				hasMoreData = true;
				rows = [];
				await fetchTabData(selected);

				// rows[modalRowIndex][modalColumn] = cellEditForm.value;
				isCellEditForm = false;
				showModal = false;
			}catch(err){
			console.error("Error updating: ", err);
			}
		}
	}

	let addForm: { [key: string]: string | null } = {};
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

async function handleAddFormSave() {
	if (Object.values(addForm).some((v) => v?.trim() !== '')) {
		const token = localStorage.getItem('token');
		const endpoint = createApiMap[selected];
		const finalForm: { [key: string]: any } = {};
		const varKey = keyMap[selected];
		const validations = idValidationMap[selected] || [];

		// Get user ID from token
		let currentUserId: number | null = null;
		try {
			const payload = JSON.parse(atob(token.split('.')[1]));
			currentUserId = payload.userId || payload.id || null;
		} catch (err) {
			alert("Login session invalid. Please log in again.");
			return;
		}

		// Validate foreign key IDs
		for (const { field, endpoint: idEndpoint } of validations) {
			if (field === "productId") continue; // handled below

			const raw = addForm[field]?.trim();
			if (!raw || isNaN(Number(raw))) {
				alert(`${field} must be a number.`);
				return;
			}
			const id = Number(raw);
			const exists = await validate(idEndpoint, id);
			if (!exists) {
				alert(`${field} ${id} does not exist in the database.`);
				return;
			}
			const finalKey = varKey[field];
			if (finalKey) finalForm[finalKey] = id;
		}

		// Handle productId from input ("Product Name" column)
		const rawProductId = addForm['Product Name']?.trim();
		if (!rawProductId || isNaN(Number(rawProductId))) {
			alert("Product ID must be a valid number.");
			return;
		}
		finalForm.productId = Number(rawProductId);

		// Map remaining fields
		for (const key in addForm) {
			if (key === 'Product Name' || key === 'productId') continue;

			const bKey = varKey[key];
			if (!bKey || finalForm.hasOwnProperty(bKey)) continue;

			const value = addForm[key]?.trim();
			if (value === '') continue;

			if (['quantityReceived', 'deliveryReceiptNumber'].includes(bKey)) {
				const num = Number(value);
				if (isNaN(num)) {
					alert(`${bKey} must be a number.`);
					return;
				}
				finalForm[bKey] = num;
			} else if (bKey === 'dateReceived') {
				// Only accept valid date
				const date = new Date(value);
				if (isNaN(date.getTime())) {
					alert("Invalid date for dateReceived.");
					return;
				}
				finalForm[bKey] = value;
			} else {
				finalForm[bKey] = value;
			}
		}

		// Auto-fill metadata
		const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
		finalForm.lastEditedUser = currentUserId;
		finalForm.lastEditedDate = now;

		// Fallback: auto-fill today's dateReceived if still missing
		if (!finalForm.dateReceived) {
			finalForm.dateReceived = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
		}

		console.log("[DEBUG] Final form to submit:", finalForm);

		try {
			const res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(finalForm)
			});

			if (!res.ok) {
				const error = await res.json();
				alert("Error creating: " + (error.message || res.statusText));
				console.error("[ERROR] Backend response:", error);
				return;
			}

			await fetchTabData(selected);
			currentOffset = 0;
			hasMoreData = true;
			rows = [];
			await fetchTabData(selected);
			isAddForm = false;
			showModal = false;
			alert("Stock entry created successfully!");
		} catch (err) {
			console.error("Error creating StockEntry:", err);
			alert("Unexpected error while creating stock entry.");
		}
	}
}

	//validate if id exists
	async function validate(endpoint: string, id: number){
		const token = localStorage.getItem('token');
		const res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}/${id}`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
		if(!res.ok) return false;
		// const data = await res.json();
		return true;
	}

	async function handleDeleteSelectedRows() {
		if (selectedRows.length === 0) return;

		if (!confirm(`Delete ${selectedRows.length} selected row(s)?`)) return;

		const token = localStorage.getItem('token');
		const endpoint = deleteApiMap[selected];
		const primaryKey = primaryKeyMap[selected];
		const failedDeletes: number[] = [];

		const rowIds = selectedRows.map(idx => {
			const row = rows[idx];
			return parseInt(row?.[primaryKey] || row?.id);
		}).filter(id => id);

		for (const rowId of rowIds) {
			try {
				const res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}/${rowId}`, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`
					}
				});
				if (!res.ok) {
					const err = await res.json().catch(() => ({ message: res.statusText }));
					console.error(`Failed to delete row ${rowId}:`, err.message);
					failedDeletes.push(rowId);
				}
			} catch (err) {
				console.error(`Error deleting row ${rowId}:`, err);
				failedDeletes.push(rowId);
			}
		}

		selectedRows = [];
		currentOffset = 0;
		hasMoreData = true;
		rows = [];
		await fetchTabData(selected);

		if (failedDeletes.length > 0) {
			alert(`Some deletions failed: ${failedDeletes.join(", ")}`);
		} else {
			alert("Successfully deleted all selected stock entries.");
		}
	}


</script>

<!-- header w/ search bar and filter-->
<header class="flex justify-between p-7">
	<h1>Stock In</h1>

	<div class="flex gap-3">
		
		<div class="flex w-fit rounded-4xl bg-white px-3">
			<!-- dropdown for order by, auto includes all col headers -->
			<select
				class="w-35 p-1 outline-none"
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
			class="w-28 py-2 items-center justify-center gap-2 rounded-lg font-bold
				{selectedRows.length === 0
				? 'cursor-not-allowed bg-gray-400 text-gray-200'
				: 'red1 text-white hover:bg-red-700'}"
			disabled={selectedRows.length === 0}
			on:click={handleDeleteSelectedRows}
		>
			Delete
		</button>
		<button
			class="w-fit p-2 items-center justify-center gap-2 rounded-lg font-bold bg-[#3d843f] text-white hover:bg-[#3b7f3b]"
			on:click={openAddModal}
		>
			Add New Shipment
		</button>
	</div>
</div>

<!-- table -->
<div class="w-full overflow-x-auto" on:scroll={handleScroll}>
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
			
			<!-- Loading indicator -->
			{#if isLoading}
				<tr>
					<td colspan={currentHeaders.length + 2} class="py-8 text-center">
						<div class="flex items-center justify-center gap-2">
							<div class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
							<span>Loading more data...</span>
						</div>
					</td>
				</tr>
			{/if}
			
			<!-- End of data indicator -->
			{#if !hasMoreData && rows.length > 0}
				<tr>
					<td colspan={currentHeaders.length + 2} class="py-4 text-center text-gray-500">
						No more data to load
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>

<!-- modal popup-->
{#if showModal}
	<div
		class="modal-backdrop backdrop-blur-sm"
		style="background-color: rgba(10, 10, 10, 0.5);"
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
					{#each currentHeaders.filter(h => h !== primaryKeyMap[selected] && !/^date/i.test(h) && !['Last Edited Date', 'Last Edited User'].includes(h)) as head}
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
								{Object.values(addForm).some((v) => v?.trim() !== '')
								? 'bg-green-600 hover:bg-green-700'
								: 'cursor-not-allowed bg-gray-400'}"
							disabled={!Object.values(addForm).some((v) => v?.trim() !== '')}
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
					{#each currentHeaders.filter(h => h !== primaryKeyMap[selected] && !/^date/i.test(h) && !['Last Edited Date', 'Last Edited User'].includes(h)) as head}
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
							readonly={ //primary key, date_, last edited fields
								modalColumn === primaryKeyMap[selected] ||
								/^date/i.test(modalColumn) ||
								modalColumn === 'Last Edited Date' ||
								modalColumn === 'Last Edited User'
							}
						/>
					</div>
					<div class="mt-4 flex gap-2">
						{#if !(
							modalColumn === primaryKeyMap[selected] ||
							/^date/i.test(modalColumn) ||
							modalColumn === 'Last Edited Date' ||
							modalColumn === 'Last Edited User'
						)}
							<button
								type="submit"
								class="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">Save</button
							>
						{/if}
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