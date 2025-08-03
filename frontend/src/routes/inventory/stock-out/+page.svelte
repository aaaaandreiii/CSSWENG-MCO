<script lang="ts">
	// import { PUBLIC_API_BASE_URL } from '$env/static/public';    //replaced by privateClient and publicClient
    import { publicClient } from '$lib/api/public.client';
    import privateClient   from '$lib/api/private.client';
	import { goto } from '$app/navigation';		
	import {onMount} from 'svelte';

	type TabType =
		| 'StockOutExpanded';

	let selected: TabType = 'StockOutExpanded';

	const getApiMap: Record<TabType, string> = {
		StockOutExpanded: 'getStockOutExpanded'
	};

	const createApiMap: Record<TabType, string> = {
		StockOutExpanded: 'createStockOutExpanded'
	};

	const updateApiMap: Record<TabType, string> = {
		StockOutExpanded: 'updateStockOutExpanded'
	};
	const deleteApiMap: Record<TabType, string> = {
		StockOutExpanded: "deleteStockOutExpanded"
	};

	const keyMap: Record<TabType, Record<string, string>> = {
		StockOutExpanded: {
			'Withdrawal ID': 'withdrawalId',
			'Entry ID': 'entryId',
			'Date Withdrawn': 'dateWithdrawn',
			'Quantity Withdrawn': 'quantityWithdrawn',
			'Purpose': 'purpose',
			'Branch Name': 'branchName',
			'Product Name': 'productName',
			'Withdrawn By': 'withdrawnBy',
			'Authorized By': 'authorizedBy',
			'Last Edited By': 'lastEditedBy',
			'Last Edited Date': 'lastEditedDate'
		}	
	}

	const foreignKeyNameMap: Record<string, Record<string, string>> = {
		StockOutExpanded: {
			withdrawnBy: 'users',
			authorizedBy: 'users',
			lastEditedUser: 'users',
			entryId: 'stockentry',
			productName: 'products'
		},
	};

	const idValidationMap: Record<TabType, {field: string; endpoint: string}[]> = {
	
		StockOutExpanded: [
			{ field: 'withdrawnBy', endpoint: 'users' },
			{ field: 'authorizedBy', endpoint: 'users' },
			{ field: 'entryId', endpoint: 'stockentry' },
			{ field: 'productName', endpoint: 'products' },
		]
	};

	const primaryKeyMap: Record<TabType, string> = {
		StockOutExpanded: 'Withdrawal ID'
	};

	const headerMap: Record<TabType, string[]> = {
		StockOutExpanded: [
		'Withdrawal ID',
		'Entry ID',
		'Date Withdrawn',
		'Quantity Withdrawn',
		'Purpose',
		'Branch Name',
		'Product Name',
		'Withdrawn By',
		'Authorized By',
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

	let searchQuery = '';
	function handleSearch() {
		if (searchQuery.trim()) {
			goto(`/search?q=${encodeURIComponent(searchQuery)}`);
		}
	}

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
		
		try{
			//fix: uses privateClient
			// const token = localStorage.getItem('token');
			const endpoint = getApiMap[tab];
			// const res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}?offset=${offset}&limit=${ITEMS_PER_PAGE}`, {
			// 	headers: {
			// 		Authorization: `Bearer ${token}`
			// 	}
			// });
			// const data = await res.json();

			const { data } = await privateClient.get(`/api/${endpoint}`, {
				params: { offset, limit: ITEMS_PER_PAGE }
			});

        	console.log('Fetched data:', data);

			let newRows: { [key: string]: string }[] = [];

			if (tab === "StockOutExpanded") {
				newRows = data.stockOut.map((item: any) => ({
					'Withdrawal ID': item['Withdrawal ID'],
					'Entry ID': item['Entry ID'],
					'Date Withdrawn': new Date(item['Date Withdrawn']).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' }),
					'Quantity Withdrawn': item['Quantity Withdrawn'],
					'Purpose': item['Purpose'],
					'Branch Name': item['Branch Name'],
					'Product Name': item['Product Name'],
					'Withdrawn By': item['Withdrawn By'],
					'Authorized By': item['Authorized By'],
					'Last Edited By': item['Last Edited By'],
					'Last Edited Date': new Date(item['Last Edited Date']).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })
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

	function handleEditFormCancel() {
		isEditForm = false;
		showModal = false;
	}

	let editForm: { [key: string]: string } = {};
	let isEditForm = false;

	let cellEditForm: { value: string } = { value: '' };
	let isCellEditForm = false;

	async function getForeignKeyId(field: string, value: string, token: string, foreignKeyMap: Record<string, string>): Promise<number | null> {
		const endpoint = foreignKeyMap[field];
		if (!endpoint) return null;

		//fix: uses privateClient
		// const res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}`, {
		// 	headers: { Authorization: `Bearer ${token}` }
		// });
		// const data = await res.json();

		const { data } = await privateClient.get(`/api/${endpoint}`);

		// Match either by `label` or `name` (adjust if needed)
		const match = data.find((item: any) => item.name === value || item.label === value);
		return match ? match.id : null;
	}


	async function resolveForeignKeyId(
		field: string,
		value: string,
		selectedTab: string,
		token: string
	): Promise<number> {
		const fkMap = foreignKeyNameMap[selectedTab];
		if (!fkMap || !fkMap[field]) {
			throw new Error(`Missing foreign key mapping for field '${field}'`);
		}

		const endpoint = fkMap[field];

		//fix: uses privateClient
		// const res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}`, {
		// 	headers: {
		// 		Authorization: `Bearer ${token}`
		// 	}
		// });
		// if (!res.ok) throw new Error(`Failed to fetch foreign key list from /api/${endpoint}`);
		// const data = await res.json();

		const { data } = await privateClient.get(`/api/${endpoint}`);

		const match = data.find((item: any) =>
			item.name === value || item.label === value || item.username === value || item.fullName === value
		);
		if (!match || typeof match.id !== 'number') {
			throw new Error(`Cannot resolve ID for '${value}' in '${field}'`);
		}

		return match.id;
	}

	
	function toMySQLDate(date: string | Date): string {
		const d = new Date(date);
		return d.toISOString().split('T')[0]; // 'YYYY-MM-DD'
	}

	function toMySQLDateTime(date: string | Date): string {
		const d = new Date(date);
		return d.toISOString().slice(0, 19).replace('T', ' '); // 'YYYY-MM-DD HH:MM:SS'
	}

	function getUserIdFromToken(token: string): number | null {
		try {
			const payload = JSON.parse(atob(token.split('.')[1]));
			return payload.userId || null; // change to payload.id or payload.sub if needed
		} catch (err) {
			console.error("Failed to decode token:", err);
			return null;
		}
	}

export async function getEntryIdByWithdrawalId(withdrawalId: number): Promise<number | null> {
	try {
		//fix: uses privateClient
// 		const token = localStorage.getItem("token");
// 		const res = await fetch(`${PUBLIC_API_BASE_URL}/api/stockWithdrawal/entryId/${withdrawalId}`, {
// 			headers: {
// 				Authorization: `Bearer ${token}`
// 			}
// 		});
// 		if (!res.ok) throw new Error("Failed to fetch entry ID");
// 		const data = await res.json();
// 		return data.entryId ?? null;
		const { data } = await privateClient.get(`/api/stockWithdrawal/entryId/${withdrawalId}`);
		return data.entryId ?? null;
	} catch (err) {
		console.error("getEntryIdByWithdrawalId error:", err);
		return null;
	}
}

export async function getAuthorizedByById(withdrawalId: number): Promise<number | null> {
	try {
		//fix: uses privateClient
		// const token = localStorage.getItem("token");
		// const res = await fetch(`${PUBLIC_API_BASE_URL}/api/stockWithdrawal/authorizedBy/${withdrawalId}`, {
		// 	headers: {
		// 		Authorization: `Bearer ${token}`
		// 	}
		// });
		// if (!res.ok) throw new Error("Failed to fetch authorizedBy");
		// const data = await res.json();
		const { data } = await privateClient.get(`/api/stockWithdrawal/authorizedBy/${withdrawalId}`);
		return data.authorizedBy ?? null;
	} catch (err) {
		console.error("getAuthorizedByById error:", err);
		return null;
	}
}

export async function getWithdrawnByById(withdrawalId: number): Promise<number | null> {
	try {
		//fix: uses privateClient
		// const token = localStorage.getItem("token");
		// const res = await fetch(`${PUBLIC_API_BASE_URL}/api/stockWithdrawal/withdrawnBy/${withdrawalId}`, {
		// 	headers: {
		// 		Authorization: `Bearer ${token}`
		// 	}
		// });
		// if (!res.ok) throw new Error("Failed to fetch withdrawnBy");
		// const data = await res.json();
		const { data } = await privateClient.get(`/api/stockWithdrawal/withdrawnBy/${withdrawalId}`);
		return data.withdrawnBy ?? null;
	} catch (err) {
		console.error("getWithdrawnByById error:", err);
		return null;
	}
}

export async function getLastEditedUserByWithdrawalId(withdrawalId: number): Promise<number | null> {
	try {
		//fix: uses privateClient
		// const token = localStorage.getItem("token");
		// const res = await fetch(`${PUBLIC_API_BASE_URL}/api/stockWithdrawal/lastEditedUser/${withdrawalId}`, {
		// 	headers: {
		// 		Authorization: `Bearer ${token}`
		// 	}
		// });
		// if (!res.ok) throw new Error("Failed to fetch lastEditedUser");
		// const data = await res.json();
		const { data } = await privateClient.get(`/api/stockWithdrawal/lastEditedUser/${withdrawalId}`);
		return data.lastEditedUser ?? null;
	} catch (err) {
		console.error("getLastEditedUserByWithdrawalId error:", err);
		return null;
	}
}

async function handleCellEditFormSave() {
	if (modalRowIndex !== -1 && modalColumn) {
		const token = localStorage.getItem("token");
		const endpoint = updateApiMap[selected];
		const primaryKey = primaryKeyMap[selected];
		const rowId = rows[modalRowIndex][primaryKey];
		const rowData = rows[modalRowIndex];
		const varKey = keyMap[selected];

		const id = Number(rowId);

		const [entryId, withdrawnBy, authorizedBy, lastEditedUser] = await Promise.all([
			getEntryIdByWithdrawalId(id),
			getWithdrawnByById(id),
			getAuthorizedByById(id),
			getLastEditedUserByWithdrawalId(id)
		]);

		console.log({ entryId, withdrawnBy, authorizedBy, lastEditedUser });



		const updatedRow = {
			...rowData,
			[modalColumn]: cellEditForm.value,
			entryId,
			withdrawnBy,
			lastEditedUser
		};

		const validations = idValidationMap[selected] || [];
		const foreignIds = validations.map(v => v.field);

		const convertedRow: Record<string, any> = {};
		for (const displayKey in updatedRow) {
			const bKey = varKey[displayKey];
			if (bKey) {
				let value = updatedRow[displayKey];
				if (foreignIds.includes(bKey)) {
					value = Number(value);
				} else if (typeof value === "string") {
					value = value.trim();
				}
				convertedRow[bKey] = value;
			}
		}

		if (typeof convertedRow.quantityWithdrawn === "string") {
			convertedRow.quantityWithdrawn = Number(convertedRow.quantityWithdrawn);
		}
		if (convertedRow.dateWithdrawn) {
			convertedRow.dateWithdrawn = toMySQLDate(convertedRow.dateWithdrawn);
		}
		if (convertedRow.lastEditedDate) {
			convertedRow.lastEditedDate = toMySQLDateTime(convertedRow.lastEditedDate);
		}

		const finalForm = { ...convertedRow };

		const field = modalColumn;
		const raw = cellEditForm.value;
		const trim = typeof raw === "string" ? raw.trim() : raw;
		const validation = validations.find(v => v.field === field);

		if (validation) {
			if (trim === "" || isNaN(Number(trim))) {
				alert(`${field} must be a number.`);
				return;
			}
			const id = Number(trim);
			const exists = await validate(validation.endpoint, id);
			if (!exists) {
				alert(`${field} ${id} does not exist in the database.`);
				return;
			}
			const finalKey = varKey[field];
			if (finalKey) {
				finalForm[finalKey] = id;
			}
		} else {
			const bKey = varKey[field];
			if (bKey === "pathName") {
				finalForm[bKey] = trim === "" ? null : trim;
			} else if (trim !== "" && trim !== null && trim !== undefined) {
				if (["quantityWithdrawn"].includes(bKey)) {
					const num = Number(trim);
					if (isNaN(num) || num < 0) {
						alert(`${bKey} must be a valid number`);
						return;
					}
					finalForm[bKey] = num;
				} else {
					finalForm[bKey] = trim;
				}
			}
		}

		const withdrawalId = Number(rowId);
		if (isNaN(withdrawalId)) {
			console.error("Invalid withdrawal ID:", rowId);
			return;
		}

		// Parse foreign key display strings to IDs
		if ("entryId" in finalForm) {
			finalForm.entryId = Number(finalForm.entryId);
		}
		if ("withdrawnBy" in finalForm && typeof finalForm.withdrawnBy === "string") {
			const match = finalForm.withdrawnBy.match(/(\d+)/);
			if (match) {
				finalForm.withdrawnBy = parseInt(match[1], 10);
			}
		}
		if ("authorizedBy" in finalForm && typeof finalForm.authorizedBy === "string") {
			const match = finalForm.authorizedBy.match(/(\d+)/);
			if (match) {
				finalForm.authorizedBy = parseInt(match[1], 10);
			}
		}
		if ("lastEditedBy" in finalForm) {
			finalForm.lastEditedUser = Number(finalForm.lastEditedBy);
			delete finalForm.lastEditedBy;
		}

		// Fallback: fetch missing foreign keys
		if (typeof finalForm.entryId !== "number" || isNaN(finalForm.entryId)) {
			finalForm.entryId = await getEntryIdByWithdrawalId(withdrawalId);
		}
		if (typeof finalForm.withdrawnBy !== "number" || isNaN(finalForm.withdrawnBy)) {
			finalForm.withdrawnBy = await getWithdrawnByById(withdrawalId);
		}
		if (typeof finalForm.authorizedBy !== "number" || isNaN(finalForm.authorizedBy)) {
			finalForm.authorizedBy = await getAuthorizedByById(withdrawalId);
		}
		if (typeof finalForm.lastEditedUser !== "number" || isNaN(finalForm.lastEditedUser)) {
			finalForm.lastEditedUser = await getLastEditedUserByWithdrawalId(withdrawalId);
		}

		// Set timestamp + user from token
		finalForm.lastEditedDate = toMySQLDateTime(new Date());
		const userId = getUserIdFromToken(token);
		if (userId !== null) {
			finalForm.lastEditedUser = userId;
		} else {
			console.warn("Could not determine lastEditedUser from token");
		}

		console.log("Final form to be submitted:", finalForm);

		try {
			//fix: uses privateClient
			// const res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}/${withdrawalId}`, {
			// 	method: "PUT",
			// 	headers: {
			// 		"Content-Type": "application/json",
			// 		Authorization: `Bearer ${token}`
			// 	},
			// 	body: JSON.stringify(finalForm)
			// });

			// if (!res.ok) {
			// 	alert("Error updating!");
			// 	return;
			// }
			
			await privateClient.put(`/api/${endpoint}/${withdrawalId}`, finalForm);

			await fetchTabData(selected);
			currentOffset = 0;
			hasMoreData = true;
			rows = [];
			await fetchTabData(selected);

			isCellEditForm = false;
			showModal = false;
		} catch (err) {
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
			const token = localStorage.getItem('actkn');
			const endpoint = createApiMap[selected];
			try {
				const finalForm: { [key: string]: any } = {};
				const varKey = keyMap[selected];

				// Attempt to decode user ID from JWT (assuming payload includes userId)
				let currentUserId: number | null = null;
				try {
					const payload = JSON.parse(atob(token.split('.')[1]));
					currentUserId = payload.userId || payload.id || null;
				} catch (err) {
					console.warn("Failed to decode JWT", err);
				}

				const validations = idValidationMap[selected] || [];
				for (const { field, endpoint: idEndpoint } of validations) {
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
					if (finalKey) {
						finalForm[finalKey] = id;
					}
				}

				for (const key in addForm) {
					const bKey = varKey[key];
					if (!bKey || finalForm.hasOwnProperty(bKey)) continue;
					const value = addForm[key]?.trim();

					if (bKey === 'pathName') {
						finalForm[bKey] = value === '' ? null : value;
					}
					else if (['dateWithdrawn', 'lastEditedDate'].includes(bKey)) {
						// Auto-fill below if missing
						continue;
				}
					else if (value !== '') {
						if (['cost', 'retailPrice', 'stockOnHand', 'safeStockCount', 'restockFlag', 'discount', 'quantity', 'unitPriceAtPurchase', 'quantityReceived', 'deliveryReceiptNumber', 'quantityWithdrawn', 'returnedQuantity', 'exchangeQuantity'].includes(bKey)) {
							const num = Number(value);
							if (isNaN(num) || num < 0) {
								alert(`${bKey} must be a valid number`);
								return;
							}
							finalForm[bKey] = num;
						} else {
							finalForm[bKey] = value;
						}
					}
				}

				const now = new Date().toISOString().slice(0, 19).replace("T", " ");
				finalForm.dateWithdrawn = finalForm.dateWithdrawn || now;
				finalForm.lastEditedDate = finalForm.lastEditedDate || now;

				if (currentUserId) {
					finalForm.lastEditedUser = currentUserId;
				} else {
					alert("Cannot determine current user ID. Please log in again.");
					return;
				}

				console.log("Final form to submit:", finalForm);

				// const res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}`, {
				// 	method: 'POST',
				// 	headers: {
				// 		'Content-Type': 'application/json',
				// 		Authorization: `Bearer ${token}`
				// 	},
				// 	body: JSON.stringify(finalForm)
				// });

				// if (!res.ok) {
				// 	const error = await res.json();
				// 	console.error("Backend response:", error);
				// 	alert("Error creating: " + error.message);
				// 	return;
				// }

				await privateClient.post(`/api/${endpoint}`, finalForm);

				await fetchTabData(selected);
				currentOffset = 0;
				hasMoreData = true;
				rows = [];
				await fetchTabData(selected);

				isAddForm = false;
				showModal = false;
				
				alert("New record successfully added.");
			} catch (err) {
				console.error("Error creating: ", err);
			}
		}
	}

	
	//validate if id exists
	async function validate(endpoint: string, id: number){
		//fix: uses privateClient
		// const token = localStorage.getItem('token');
		// const res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}/${id}`, {
		// 	headers: {
		// 		Authorization: `Bearer ${token}`
		// 	}
		// });
		// if(!res.ok) return false;

		try {
			await privateClient.get(`/api/${endpoint}/${id}`);
			return true;
		} catch {
			return false;
		}
	}

async function handleDeleteSelectedRows() {
	if (
		selectedRows.length > 0 &&
		confirm(`Are you sure you want to delete ${selectedRows.length} selected row(s)?`)
	) {
		const token = localStorage.getItem("actkn");
		const failedDeletes: number[] = [];

		const endpoint = deleteApiMap[selected]; // e.g., deleteStockEntryExpanded
		const primaryKey = primaryKeyMap[selected]; // e.g., Entry ID

		console.log("Selected tab:", selected);
		console.log("Delete endpoint:", endpoint);
		console.log("Primary key used:", primaryKey);
		console.log("Selected row indices:", selectedRows);

		const rowIds = selectedRows
			.map((idx) => {
				const row = rows[idx];
				const id = parseInt(row?.[primaryKey] || row?.id);
				console.log(`Row index ${idx} → ID ${id}`);
				return id;
			})
			.filter((id) => !isNaN(id)); // Remove invalid IDs

		console.log("Row IDs to delete:", rowIds);

		for (const rowId of rowIds) {
			try {
				console.log(`Sending DELETE to /api/${endpoint}/${rowId}`);

				//fix: uses privateClient
				// const res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}/${rowId}`, {
				// 	method: "DELETE",
				// 	headers: {
				// 		"Content-Type": "application/json",
				// 		Authorization: `Bearer ${token}`
				// 	}
				// });

				// if (!res.ok) {
				// 	const err = await res.json().catch(() => ({ message: res.statusText }));
				// 	console.error(`Failed to delete row ${rowId}:`, err.message || "Unknown error");
				// 	failedDeletes.push(rowId);
				// } else {
				// 	const result = await res.json();
				// 	console.log(`Successfully deleted row ${rowId}:`, result.message);
				// }

				try {
					await privateClient.delete(`/api/${endpoint}/${rowId}`);
				} catch (e) {
					failedDeletes.push(rowId);
				}
			} catch (err) {
				console.error(`Fetch error while deleting row ${rowId}:`, err);
				failedDeletes.push(rowId);
			}
		}

		// Reset selection and reload data
		selectedRows = [];
		currentOffset = 0;
		hasMoreData = true;
		rows = [];

		console.log("Reloading table after deletion...");
		await fetchTabData(selected);

		if (failedDeletes.length > 0) {
			alert(`Some deletions failed: ${failedDeletes.join(", ")}`);
		} else {
			alert("All selected stock entries were successfully deleted.");
		}
	}
}
</script>

<!-- header w/ search bar and filter-->
<header class="flex justify-between p-7 fixed gray1" style="width: 85%; z-index: 10;">
	<h1>Inventory</h1>

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
	</div>
</header>

<!-- navbar + buttons row -->
<div class="grid grid-cols-2 pt-20">
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
				: 'bg-red-600 text-white hover:bg-red-800'}"
			disabled={selectedRows.length === 0}
			on:click={handleDeleteSelectedRows}
		>
			Delete
		</button>
		<button
			class="w-28 py-2 items-center justify-center gap-2 rounded-lg font-bold bg-[#3d843f] text-white hover:bg-[#3b7f3b]"
			on:click={openAddModal}
		>
			Add
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
				<form on:submit|preventDefault={handleCellEditFormSave}>
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