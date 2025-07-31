<script lang="ts">

    import { PUBLIC_API_BASE_URL } from '$env/static/public';
    import { items } from '$lib/index.js';
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
	import { goto } from '$app/navigation';	
    import Chart from 'chart.js/auto';
    import StockDetail from '$lib/StockDetail.svelte';

	//search
	let isSearching = false;
	let searchError: string | null = null;
	let originalRows: Record<string,string>[] = [];

	let chartEl:    HTMLCanvasElement;
    let chart:      Chart | null = null;
	
    // ——— State ———
    let filterStart = '';
    let filterEnd   = '';
    let lowThreshold  = 0;
    let overThreshold = 0;

    let turnoverData:   Array<{productName:string; total_cogs:number; turnoverRate:number}> = [];
    let statusItems:    Array<{
        productId:      number;
        productName:    string;
        category:       string;
        supplier:       string;
        units:          string;
        stockOnHand:    number;
        safeStockCount: number;
        avgDailySales:  number;
        daysCover:      number;
        reorderQty:     number;
        status:         'low'|'out'|'over'|'ok';
    }> = [];

    let currentMonetaryValue = 0;
    let totalItemsInStock    = 0;
    let lowStockAlerts:      Array<{productId:number; productName:string; stockOnHand:number}> = [];
    let outOfStockItems:     Array<{productId:number; productName:string}> = [];
    let overstockItems:      Array<{productId:number; productName:string; stockOnHand:number}> = [];
    $: alertItems = statusItems.filter(item => item.status !== 'ok');   // only show items that are not 'ok'


    let infos: Array<{value:string; label:string; color:string}> = [];

    // ——— Sales carousel state (static) ———
    let dropdownOpenSales  = false;
    let selectedRangeSales = '10 days';
    let isChosen           = false;
    const rangesSales      = ['10 days', '1 month', '1 year'];

    function handleDropdownClickSales() {
        dropdownOpenSales = !dropdownOpenSales;
        isChosen          = true;
    }
    function selectRangeSales(range: string) {
        selectedRangeSales = range;
        dropdownOpenSales  = false;
        isChosen           = true;
    }


    // custom date range filter validation for item sales 
    let customStart   = '';
    let customEnd     = '';
    $: endDateInvalid = customEnd && customStart && customEnd < customStart;

    
    // ——— Annual stats filters ——— (dropdown logic for orderby annual statistics (years only))
    let dropdownOpenAnnual          = false;
    let selectedRangeAnnual         = new Date().getFullYear().toString();
    let annualMode: 'last'|'custom' = 'last';
    const rangesAnnual              = ['10 years','5 years','1 year'];
    let annualStart                 = '';
    let annualEnd                   = '';
    $: annualEndDateInvalid         = annualEnd && annualStart && annualEnd < annualStart;

    // dropdown logic for orderby itemsales
    function handleDropdownClickAnnual() {
        dropdownOpenAnnual = !dropdownOpenAnnual;
        annualMode = 'last';
        isChosenB = true;
    }
    function selectRangeAnnual(range: string) {
        selectedRangeAnnual = range;
        dropdownOpenAnnual  = false;
        annualMode         = 'last';
        const years = parseInt(range,10);
        const end   = new Date();
        const start = new Date();
        start.setFullYear(end.getFullYear() - years);
        filterStart = start.toISOString().slice(0,10);
        filterEnd   = end.toISOString().slice(0,10);
        loadData();
    }
    function switchToCustomAnnual() {
        annualMode = 'custom';
    }


    // ——— Utility functions ———
    function formatCurrency(n: number) {
        return new Intl.NumberFormat('en-PH',{
        style:'currency', currency:'PHP', minimumFractionDigits:2
        }).format(n);
    }
    function scrollNext() { 
        scrollRef?.scrollBy({ left:1200, behavior:'smooth' }); 
    }
    function scrollPrev() {
        scrollRef?.scrollBy({ left:-1200, behavior:'smooth' }); 
    }

    // outside‐click to close dropdowns
    function handleClickOutside(evt: MouseEvent) {
    // Cast evt.target to Element
    const targetElement = evt.target as Element;

    if (dropdownOpenSales && !targetElement.closest('#sales-dropdown-trigger')) {
        dropdownOpenSales = false;
    }
    if (dropdownOpenAnnual && !targetElement.closest('#annual-dropdown-trigger')) {
        dropdownOpenAnnual = false;
    }
}


    // ——— Main loader ———
    async function loadData() {
        // if (!filterStart || !filterEnd) return;

        const url = new URL(`${PUBLIC_API_BASE_URL}/api/dataAnalysisController`);
        url.searchParams.set('startDate',    filterStart);
        url.searchParams.set('endDate',      filterEnd);
        url.searchParams.set('lowThreshold',  lowThreshold.toString());
        url.searchParams.set('overThreshold', overThreshold.toString());

        const res     = await fetch(url.toString());
        const payload = await res.json();

        // grab *all* of it in one shot:
        turnoverData         = payload.top10;
        statusItems          = payload.statusItems;
        currentMonetaryValue = payload.currentMonetaryValue;
        totalItemsInStock    = payload.totalItemsInStock;
        lowStockAlerts       = payload.lowStockAlerts;
        outOfStockItems      = payload.outOfStockItems;
        overstockItems       = payload.overstockItems;
        lowThreshold         = payload.lowThreshold;
        overThreshold        = payload.overThreshold;

        infos = [
        { value: formatCurrency(currentMonetaryValue),      label:'Stock Value',   color:'#AECABD' },
        { value: totalItemsInStock.toLocaleString(),       label:'Total Units',   color:'#AEDFF7' },
        { value: lowStockAlerts.length.toString(),         label:'Low-Stock',     color:'#F4C0C0' },
        { value: outOfStockItems.length.toString(),        label:'Out-of-Stock',  color:'#F7D6A5' },
        { value: overstockItems.length.toString(),         label:'Overstock',     color:'#C8E6C9' },
        ];

        // chart
        const labels = turnoverData.map(d => d.productName);
        const data   = turnoverData.map(d => +d.turnoverRate.toFixed(2));

        if (!chart) {
        chart = new Chart(chartEl, {
            type: 'bar',
            data: { labels, datasets:[{ label:'Inventory Turnover Rate', data }] },
            options:{ responsive:true, scales:{ x:{ticks:{autoSkip:false}}, y:{beginAtZero:true}}}
        });
        } else {
        chart.data.labels            = labels;
        chart.data.datasets[0].data = data;
        chart.update();
        }
    }

    onMount(() => {
        if (!browser) return;
        // default to last 30 days
        const today = new Date();
        const prior = new Date();
        prior.setDate(today.getDate() - 30);
        filterStart = prior.toISOString().slice(0,10);
        filterEnd   = today.toISOString().slice(0,10);

        loadData();
        document.addEventListener('mousedown', handleClickOutside);
    });
     onDestroy(() => {
        if (!browser) return;
        document.removeEventListener('mousedown', handleClickOutside);
        chart?.destroy();
    });



    let scrollRef: HTMLDivElement | null = null;
    let dropdownRefSales: HTMLDivElement | null = null;

    let dropdownRefAnnual: HTMLButtonElement | null = null;
    // Only years for annual statistics
    const currentYear = new Date().getFullYear();


    // dropdown logic for ordering, asc/desc
    let orderDropdownOpen = false;
    let returnDropdownOpen = false;
    let orderBy = 'Order by';
    let returnBy = "Returns";

    let isChosenB = false; // for annual statistics
    // true = last, false = custom date range

    function setOrder(order: string) {
        orderBy = order;
        orderDropdownOpen = false;
    }

    function setReturn(returns: string) {
        returnBy = returns;
        returnDropdownOpen = false;
    }

    // track which row is expanded
    let expanded = new Set<number>();
    function toggle(id: number) {
        expanded.has(id)? expanded.delete(id) : expanded.add(id);
    }

    let showOrderModal = false;
    let orderProduct: typeof statusItems[0] | null = null;
    let orderQty = 0;

    function orderNow(productId: number) {
    // find the row
    orderProduct = statusItems.find(p => p.productId === productId) ?? null;
    if (!orderProduct) return;
    // default to the computed reorderQty
    orderQty = orderProduct.reorderQty;
    showOrderModal = true;
    }

    async function placeOrder() {
        if (!orderProduct) return;
        try {
            const res = await fetch(`${PUBLIC_API_BASE_URL}/api/reorders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: orderProduct.productId,
                quantity: orderQty
            })
            });
            if (!res.ok) throw new Error(await res.text());
            // success UX
            alert(`Order placed for ${orderQty} × ${orderProduct.productName}`);
            showOrderModal = false;
            await loadData();    // refresh the stock‑status table
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error(err);
                alert('Failed to place order: ' + err.message);
            } else {
                // Handle cases where the thrown value is not an Error object
                console.error('An unknown error occurred:', err);
                alert('Failed to place order: An unknown error occurred.');
            }
        }
    }
	type TabType =
		| 'Product'
		| 'Orders'
		| 'OrderInfo'
		| 'StockEntry'
		| 'Users'
		| 'ReturnExchange'
		| 'ReturnExchangelnfo';

	let selected: TabType = 'Product';

	const getApiMap: Record<TabType, string> = {
		Product: 'getProducts',
		Orders: 'getOrders',
		OrderInfo: 'getOrderInfo',
		StockEntry: 'getStockEntries',
		Users: 'getUserss',
		ReturnExchange: 'getReturnExchanges',
		ReturnExchangelnfo: 'getReturnExchangeInfo'
	};

	const createApiMap: Record<TabType, string> = {
		Product: 'createProduct',
		Orders: 'createOrder',
		OrderInfo: 'createOrderInfo', // X
		StockEntry: 'createStockEntry',
		Users: 'createUsers',
		ReturnExchange: 'createReturnExchange',
		ReturnExchangelnfo: 'createReturnExchangeInfo' // X
	};

	const updateApiMap: Record<TabType, string> = {
		Product: 'updateProduct',
		Orders: 'updateOrder',
		OrderInfo: 'updateOrderInfo',
		StockEntry: 'updateStockEntry',
		Users: 'updateUsers',
		ReturnExchange: 'updateReturnExchange',
		ReturnExchangelnfo: 'updateReturnExchangeInfo'
	};

	const keyMap: Record<TabType, Record<string, string>> = {
		Product: {
			'Product Name': 'productName',
			'Category': 'category',
			'Descriptions': 'descriptions',
			'Supplier': 'supplier',
			'Cost': 'cost',
			'Retail Price': 'retailPrice',
			'Stock On Hand': 'stockOnHand',
			'Units': 'units',
			'Image': 'pathName',
			'Safe Stock Count': 'safeStockCount',
			'Restock Flag': 'restockFlag'
		},
		Orders: {
			'Discount': 'discount',
			'Customer': 'customer',
			'Handled By': 'handledBy',
			'Payment Method': 'paymentMethod',
			'Payment Status': 'paymentStatus'
		},
		OrderInfo: {
			'Quantity': 'quantity',
			'Order ID': 'orderId',
			'Product ID': 'productId',
			'Unit Price At Purchase': 'unitPriceAtPurchase'
		},
		StockEntry: {
			'Branch Name': 'branchName',
			'Quantity Received': 'quantityReceived',
			'Delivery Receipt Number': 'deliveryReceiptNumber',
			'Received By': 'receivedBy',
			'Product ID': 'productId'
		},
		Users: {
			'Quantity Withdrawn': 'quantityWithdrawn',
			'Purpose': 'purpose',
			'Entry ID': 'entryId',
			'Withdrawn By': 'withdrawnBy',
			'Authorized By': 'authorizedBy'
		},
		ReturnExchange: {
			'Transaction Status': 'transactionStatus',
			'Order ID': 'orderId',
			'Handled By': 'handledBy',
			'Approved By': 'approvedBy'
		},
		ReturnExchangelnfo: {
			'Returned Product ID': 'returnedProductId',
			'Returned Quantity': 'returnedQuantity',
			'Exchange Product ID': 'exchangeProductId',
			'Exchange Quantity': 'exchangeQuantity',
			'Reason': 'reason',
			'Transaction ID': 'transactionId',
			'Return Type': 'returnType'
		}
	}

	const idValidationMap: Record<TabType, {field: string; endpoint: string}[]> = {
		Product: [],
		Orders: [
			{field: 'Handled By', endpoint: 'getUserById'}
		],
		OrderInfo: [
			{field: 'Order ID', endpoint: 'getOrderById'},
			{field: 'Product ID', endpoint: 'getProductById'}
		],
		StockEntry: [
			{field: 'Received By', endpoint: 'getUserById'},
			{field: 'Product ID', endpoint: 'getProductById'}
		],
		Users: [
			{field: 'Entry ID', endpoint: 'getStockEntryById'},
			{field: 'Withdrawn By', endpoint: 'getUserById'},
			{field: 'Authorized By', endpoint: 'getUserById'}
		],
		ReturnExchange: [
			{field: 'Order ID', endpoint: 'getOrderById'},
			{field: 'Handled By', endpoint: 'getUserById'},
			{field: 'Approved By', endpoint: 'getUserById'}
		],
		ReturnExchangelnfo: [
			{field: 'Returned Product ID', endpoint: 'getProductById'},
			{field: 'Exchange Product ID', endpoint: 'getProductById'},
			{field: 'Transaction ID', endpoint: 'getReturnExchangeById'}
		]
	};

	const primaryKeyMap: Record<TabType, string> = {
		Product: 'Product ID',
		Orders: 'Order ID',
		OrderInfo: 'Order Info ID',
		StockEntry: 'Entry ID',
		Users: 'Withdrawal ID',
		ReturnExchange: 'Transaction ID',
		ReturnExchangelnfo: 'Detail ID'
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
			'Safe Stock Count',
			'Restock Flag',
			'Last Edited Date',
			'Last Edited User'
		],
		Users: [ //change to users
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

	// pagination and infinite scroll state
	let currentOffset = 0;
	let isLoading = false;
	let hasMoreData = true;
	const ITEMS_PER_PAGE = 100;

	let searchQuery = '';

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

			if(tab === "Product"){
				newRows = data.products.map((item: any) =>({
					'Product ID': item.productId,
					'Product Name': item.productName,
					'Category': item.category,
					'Descriptions': item.descriptions,
					'Supplier': item.supplier,
					'Cost': item.cost,
					'Retail Price': item.retailPrice,
					'Stock On Hand': item.stockOnHand,
					'Units': item.units,
					'Image': item.pathName,
					'Safe Stock Count': item.safeStockCount,
					'Restock Flag': item.restockFlag,
					'Last Edited Date': new Date(item.lastEditedDate).toLocaleString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Last Edited User': item.lastEditedUser
        		}));
			}
			else if(tab === "Orders"){
				newRows = data.orders.map((item: any) =>({
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
				newRows = data.orderInfo.map((item: any) =>({
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
				newRows = data.stockEntries.map((item: any) =>({
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
			else if(tab === "Users"){
				newRows = data.Userss.map((item: any) =>({
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
				newRows = data.returnExchanges.map((item: any) =>({
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
				newRows = data.returnExchangeInfo.map((item: any) =>({
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
	originalRows = [...rows];

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
		// Only add if at least one field is filled
		if (Object.values(addForm).some((v) => v?.trim() !== '')) {
			const token = localStorage.getItem('token');
			const endpoint = createApiMap[selected];
			try{
				const finalForm: {[key: string]: any} = {};
				const varKey = keyMap[selected];
				
				const validations = idValidationMap[selected] || [];
				for(const {field, endpoint: idEndpoint} of validations){
					const raw = addForm[field]?.trim();
					if(!raw || isNaN(Number(raw))){
						alert(`${field} must be a number.`);
						return;
					}
					const id = Number(raw);
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

				for(const key in addForm){
					const bKey = varKey[key];
					if (!bKey || finalForm.hasOwnProperty(bKey)) continue;
					const value = addForm[key]?.trim();
					if(bKey === 'pathName'){
						finalForm[bKey] = value === '' ? null: value;
					}
					else if(value !== ''){
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
				// console.log("Final form to submit:", finalForm);

				const res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify(finalForm)
				});
				// const data = await res.json();
				// console.log("data: ", data);
				if(!res.ok){
					alert("Error creating!");
					return;
				}

				await fetchTabData(selected);
				
				// Reset pagination and reload from beginning after add
				currentOffset = 0;
				hasMoreData = true;
				rows = [];
				await fetchTabData(selected);
				
				// rows = [...rows, { ...addForm }];
				isAddForm = false;
				showModal = false;
			}catch(err){
				console.error("Error creating: ", err);
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
		if (
			selectedRows.length > 0 &&
			confirm(`Are you sure you want to delete ${selectedRows.length} selected row(s)?`)
		) {
			const token = localStorage.getItem('token');
			const failedDeletes: number[] = []; 

			for (const idx of selectedRows) {
				const row = rows[idx];
				const productId= row["Product ID"] || row.productId || row.id; // might need to change datatype to any to remove error

				if (!productId) {
					console.warn("No product ID found in row:", row);
					failedDeletes.push(-1);
					continue;
				}

				try {
					const res = await fetch(`${PUBLIC_API_BASE_URL}/api/deleteProduct/${productId}`, {
						method: "DELETE",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`
						}
					});

					if (!res.ok) {
						const err = await res.json();
						console.error(`Failed to delete product ${productId}:`, err.message || err);
						failedDeletes.push(productId);
					}
				} catch (err) {
					console.error(`Error deleting product ${productId}:`, err);
					failedDeletes.push(productId);
				}
			}

			selectedRows = [];

			// Reset pagination and reload from beginning after delete
			currentOffset = 0;
			hasMoreData = true;
			rows = [];
			await fetchTabData(selected);

			if (failedDeletes.length > 0) {
				alert(`Some deletions failed: ${failedDeletes.join(", ")}`);
			} else {
				alert("Deletion successful.");
			}
		}
	}

	//andrei implementation hehe: new tab for querying all tables
	function openSearchTab() {
		if (!searchQuery.trim()) return;
		window.open(`/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
	}

	//lance implementation: table‑specific search in‑place
	async function searchInPlace() {
		//if the box is empty, clear the filter and re‐load full data
		if (!searchQuery.trim()) {
			// if empty --> load full data
			// currentOffset = 0;
			// rows = [];
			await fetchTabData(selected);
			hasMoreData = true;
			return;
		}

		isSearching = true;
		searchError = null;

		try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${PUBLIC_API_BASE_URL}/api/search?table=${selected}&q=${encodeURIComponent(searchQuery)}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.ok) { throw new Error('Search failed'); }

            const data = await response.json();
			const items = Array.isArray(data) ? data : data.products;
			rows = items.map(item => ({
				'Product ID':         item.productId,
				'Product Name':       item.productName,
				'Category': item.category,
				'Descriptions': item.descriptions,
				'Supplier': item.supplier,
				'Cost': item.cost,
				'Retail Price': item.retailPrice,
				'Stock On Hand': item.stockOnHand,
				'Units': item.units,
				'Image': item.pathName,
				'Safe Stock Count': item.safeStockCount,
				'Restock Flag': item.restockFlag,
				'Last Edited Date': item.lastEditedDate ? new Date(item.lastEditedDate).toLocaleString('en-PH', {
					timeZone: 'Asia/Manila'
				}) : '',
				'Last Edited User': item.lastEditedUser
			}));
            hasMoreData = false; //disable infinite scroll while in search
        } catch (err: any) {
			searchError = err.message;
            rows = [];
        } finally {
            isSearching = false;
        }
	}

	//lmfao kaya pala
	let debounceTimer: ReturnType<typeof setTimeout>;		//for quick input
	$: if (ready && selected) {
		//reset state
		currentOffset = 0;
		hasMoreData   = true;
		rows          = [];
		originalRows  = [];
		// searchQuery   = '';

		// initial load
		fetchTabData(selected);

		// now wire up the keystroke-driven search (debounced)
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(searchInPlace, 200);
	}

	// debounce “search as you type”
	$: if (ready && selected && searchQuery !== undefined) {
		clearTimeout(debounceTimer);
	    debounceTimer = setTimeout(searchInPlace, 200);
	}
</script>

<!-- header w/ search bar and filter-->
<header class="flex justify-between p-7">
	<h1>Returns & Exchanges</h1>
</header>

<!-- return or exchange -->
<div class = "w-full p-5">
    <div class = " h-auto rounded-lg bg-white p-5">
        <div class = "flex-col items-center gap-5">

            <!-- title header -->
            <div class = "flex justify-between items-start">
                <!-- first part -->
                <div class="flex items-center gap-5 pb-1 m-2 mb-5">
                    <!-- return dropdown -->
                    <div class="flex px-3 relative">
                        <button type="button" class="flex text-start text-base font-bold flex items-center" on:click={() => returnDropdownOpen = !returnDropdownOpen}>
                            {returnBy}
                            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                        </button>
                        {#if returnDropdownOpen}
                        <div class="absolute z-20 mt-8 w-28 bg-white border border-gray-200 rounded shadow-lg">
                            <button class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" on:click={() => setReturn('Returns')}>Returns</button>
                            <button class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" on:click={() => setReturn('Exchanges')}>Exchanges</button>
                        </div>
                        {/if}
                    </div>
					<div class="search flex px-3">
						<input 
							type="text" 
							placeholder="Search" 
							class="w-35 flex items-center justify-between px-2 py-1 text-sm" 
							style="outline:none" 
							bind:value={searchQuery}
							on:input={() => {
								clearTimeout(debounceTimer);
								debounceTimer = setTimeout(searchInPlace, 200);
							}}
							on:keydown={(e) => e.key === 'Enter' && openSearchTab()}
							/>
						<button 
							on:click={openSearchTab}
							class="flex items-center"
							disabled={isSearching}
						>
							{#if isSearching}
								<span class="loading-spinner"></span>
							{:else}
								<img src="../src/icons/search.svg" alt="search" style="width:15px;" />
							{/if}
						</button>
					</div>
                    <!-- orderby dropdown -->
                    <div class="search flex px-3 relative">
                        <button type="button" class="w-30 flex items-center justify-between order border-gray-300 rounded px-2 py-1 text-sm" on:click={() => orderDropdownOpen = !orderDropdownOpen}>
                            {orderBy}
                            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                        </button>
                        {#if orderDropdownOpen}
                        <div class="absolute z-20 mt-8 w-28 bg-white border border-gray-200 rounded shadow-lg">
                            <button class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" on:click={() => setOrder('Ascending')}>Ascending</button>
                            <button class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" on:click={() => setOrder('Descending')}>Descending</button>
                        </div>
                        {/if}
                    </div>
                </div>


                <!--2nd part -->
                <div class= "flex border-1 rounded-xl border-gray-200 gray1"> 
                <!-- Last __ -->
                    <div class = "flex items-center px-5 p-2 rounded-xl {isChosen ? 'bg-white' : ''}">
                        <p>Last&nbsp</p>
                        <div class="relative inline-block text-left" bind:this={dropdownRefSales}>
                            <div>
                                <button type="button" class="inline-flex w-full justify-center gap-x-1.3 rounded-3xl
                                bg-transparent px-3 py-1.5 text-sm font-semibold text-gray-900 
                                ring-0 ring-gray-300 ring-inset hover:bg-gray-50" 
                                id="menu-button-sales" aria-expanded={dropdownOpenSales} aria-haspopup="true" 
                                on:click={handleDropdownClickSales}>
                                {selectedRangeSales}
                                <svg class="-mr-1 size-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                                    <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                </svg>
                                </button>
                            </div>
                            {#if dropdownOpenSales}
                            <!-- dropdown -->
                            <div class="absolute z-10 mt-2 w-30 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden" role="menu" aria-orientation="vertical" aria-labelledby="menu-button-sales" tabindex="-1">
                                <div class="py-1" role="none">
                                    {#each rangesSales as range}
                                        <button type="button" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabindex="-1" on:click={() => selectRangeSales(range)}>{range}</button>
                                    {/each}
                                </div>
                            </div>
                            {/if}
                        </div>        
                    </div>

                    <!-- Custom date range -->
                    <div class = "flex items-center px-5 rounded-xl {isChosen ? '' : 'bg-white'}">
                        <p>From&nbsp</p>
                        <div>
                            <!-- open calendar (from date)-->
                            <input type="date"
                                class="border-gray-300 rounded px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-0 ring-gray-300 ring-inset hover:bg-gray-50 focus:outline-none"
                                bind:value={customStart}
                                max={customEnd || undefined}
                                on:focus={() => isChosen = false}
                            />
                        </div>
                        <p class = "px-2">to</p>
                        <div>
                            <!-- open calendar (to date)-->
                            <input type="date"
                                class="border-gray-300 rounded px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-0 ring-gray-300 ring-inset hover:bg-gray-50 focus:outline-none"
                                bind:value={customEnd}
                                min={customStart || undefined}
                                on:focus={() => isChosen = false}
                            />
                        </div>
                    {#if endDateInvalid}
                        <div class="text-red-600 text-xs mt-1">End date cannot be before start date.</div>
                    {/if}
                
                    </div>
                </div>
            </div>

            <!-- items -->
            <div class="relative">
            <!-- scrollable container -->
            

            </div>

        </div>
    </div>
</div>

<!-- entire table -->
<div class = "m-5 border-1 rounded-lg border-gray-400 shadow-lg">
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
                Create Return/Exchange
            </button>
        </div>
    </div>

    <!-- table content -->
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
			{#if searchError}
  <tr><td colspan={currentHeaders.length+2} class="text-red-500 text-center">
    Search error: {searchError}
  </td></tr>
{:else if isSearching}
  <tr><td colspan={currentHeaders.length+2} class="text-center py-4">
    <span class="loading-spinner"></span> Searching…
  </td></tr>
{:else if searchQuery && rows.length === 0}
  <tr><td colspan={currentHeaders.length+2} class="text-gray-500 text-center">
    No results found for "{searchQuery}"
  </td></tr>
{/if}

        </table>
    </div>
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