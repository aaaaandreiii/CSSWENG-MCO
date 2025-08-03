<script lang="ts">
	// import { PUBLIC_API_BASE_URL } from '$env/static/public';    //replaced by privateClient and publicClient
    import { publicClient } from '$lib/api/public.client';
    import privateClient   from '$lib/api/private.client';
	import { goto } from '$app/navigation';		
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
		Orders: 'getMergeOrders',
		OrderInfo: 'getOrderInfo',
		StockEntry: 'getStockEntries',
		StockWithdrawal: 'getStockWithdrawals',
		ReturnExchange: 'getMergeReturnExchanges',
		ReturnExchangelnfo: 'getReturnExchangeInfo'
	};

	const createApiMap: Record<TabType, string> = {
		Product: 'createProduct',
		Orders: 'createOrder',
		OrderInfo: 'createOrderInfo', // X
		StockEntry: 'createStockEntry',
		StockWithdrawal: 'createStockWithdrawal',
		ReturnExchange: 'createReturnExchange',
		ReturnExchangelnfo: 'createReturnExchangeInfo' // X
	};

	const updateApiMap: Record<TabType, string> = {
		Product: 'updateProduct',
		Orders: 'updateMergedOrder',
		OrderInfo: 'updateOrderInfo',
		StockEntry: 'updateStockEntry',
		StockWithdrawal: 'updateStockWithdrawal',
		ReturnExchange: 'updateMergedReturn',
		ReturnExchangelnfo: 'updateReturnExchangeInfo'
	};

	const deleteApiMap: Record<TabType, string> = {
		Product: 'deleteProduct',
		Orders: 'deleteOrder',
		OrderInfo: 'deleteOrderInfo',
		StockEntry: 'deleteStockEntry',
		StockWithdrawal: 'deleteStockWithdrawal',
		ReturnExchange: 'deleteReturnExchange',
		ReturnExchangelnfo: 'deleteReturnExchangeInfo'
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
			'Payment Status': 'paymentStatus',
			'Quantity': 'quantity',
			'Product ID': 'productId',
			'Unit Price At Purchase': 'unitPriceAtPurchase'
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
		StockWithdrawal: {
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
			'Approved By': 'approvedBy',
			'Returned Product ID': 'returnedProductId',
			'Returned Quantity': 'returnedQuantity',
			'Exchange Product ID': 'exchangeProductId',
			'Exchange Quantity': 'exchangeQuantity',
			'Reason': 'reason',
			'Return Type': 'returnType'
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
			{field: 'Handled By', endpoint: 'getUserById'},
			{field: 'Product ID', endpoint: 'getProductById'}
		],
		OrderInfo: [
			{field: 'Order ID', endpoint: 'getOrderById'},
			{field: 'Product ID', endpoint: 'getProductById'}
		],
		StockEntry: [
			{field: 'Received By', endpoint: 'getUserById'},
			{field: 'Product ID', endpoint: 'getProductById'}
		],
		StockWithdrawal: [
			{field: 'Entry ID', endpoint: 'getStockEntryById'},
			{field: 'Withdrawn By', endpoint: 'getUserById'},
			{field: 'Authorized By', endpoint: 'getUserById'}
		],
		ReturnExchange: [
			{field: 'Order ID', endpoint: 'getOrderById'},
			{field: 'Handled By', endpoint: 'getUserById'},
			{field: 'Approved By', endpoint: 'getUserById'},
			{field: 'Returned Product ID', endpoint: 'getProductById'},
			{field: 'Exchange Product ID', endpoint: 'getProductById'}
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
		StockWithdrawal: 'Withdrawal ID',
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
		Orders: [
			'Order ID',
			'Discount',
			'Customer',
			'Handled By',
			'Payment Method',
			'Payment Status',
			'Date Ordered',
			'Order Last Edited Date',
			'Order Last Edited User',
			'Order Info ID',
			'Quantity',
			'Product ID',
			'Unit Price At Purchase',
			'Info Last Edited Date',
			'Info Last Edited User'
		],
		// Orders1: [
		// 	'Order ID',
		// 	'Discount',
		// 	'Customer',
		// 	'Handled By',
		// 	'Payment Method',
		// 	'Payment Status',
		// 	'Date Ordered',
		// 	'Last Edited Date',
		// 	'Last Edited User'
		// ],
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
			'Transaction Last Edited Date',
			'Transaction Last Edited User',
			'Detail ID',
			'Returned Product ID',
			'Returned Quantity',
			'Exchange Product ID',
			'Exchange Quantity',
			'Reason',
			'Return Type',
			'Detail Last Edited Date',
			'Detail Last Edited User'
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

	let ready = false;
	
	// inf scroll
	let sentinel: HTMLDivElement;

	let searchQuery = '';
	function handleSearch() {
		if (searchQuery.trim()) {
			goto(`/search?q=${encodeURIComponent(searchQuery)}`);
		}
	}

	onMount(() => {
		ready = true;
		fetchAllUsers();
		// fetchAllProducts();
		// fetchAllOrders();
		// fetchAllTransactions();
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting && hasMoreData && !isLoading) {
				loadMoreData();
			}
		}, {
			root: null,
			rootMargin: '0px',
			threshold: 1.0
		});

		if (sentinel) observer.observe(sentinel);

		return () => observer.disconnect();
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

			if(tab === "Product"){
				// const filteredProducts = data.products.filter((item: any) => item.deleteFlag === 0);
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
					'Last Edited User': (() => {
						const user = userDetails.find(u => u.userId === item.lastEditedUser);
						if (!user || user.deleteFlag) return `Deleted User: ${item.lastEditedUser}`;
						return item.lastEditedUser;
					})()
					// 'Deleted': item.deleteFlag
        		}));
			}
			else if(tab === "Orders"){
				newRows = data.orders.map((item: any) =>({
					'Order ID': item.orderId,
					'Discount': item.discount,
					'Customer': item.customer,
					'Handled By': (() => {
						const user = userDetails.find(u => u.userId === item.handledBy);
						if (!user || user.deleteFlag === 1) return `Deleted User: ${item.handledBy}`;
						return item.handledBy;
					})(),
					'Payment Method': item.paymentMethod,
					'Payment Status': item.paymentStatus,
					'Date Ordered': new Date(item.dateOrdered).toLocaleDateString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Order Last Edited Date': new Date(item.lastEditedDate).toLocaleString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Order Last Edited User': (() => {
						const user = userDetails.find(u => u.userId === item.lastEditedUser);
						if (!user || user.deleteFlag) return `Deleted User: ${item.lastEditedUser}`;
						return item.lastEditedUser;
					})(),
					'Order Info ID': item.orderInfoId,
					'Quantity': item.quantity,
					// 'Order ID': item.orderId,
					'Product ID': item.productId,
					'Unit Price At Purchase': item.unitPriceAtPurchase,
					'Info Last Edited Date': new Date(item.lastEditedDate).toLocaleString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Info Last Edited User': (() => {
						const user = userDetails.find(u => u.userId === item.lastEditedUser);
						if (!user || user.deleteFlag) return `Deleted User: ${item.lastEditedUser}`;
						return item.lastEditedUser;
					})()
					// 'Deleted': item.deleteFlag
				}));
			}
			// else if(tab === "Orders"){
			// 	newRows = data.orders.map((item: any) =>({
			// 		'Order ID': item.orderId,
			// 		'Discount': item.discount,
			// 		'Customer': item.customer,
			// 		'Handled By': (() => {
			// 			const user = userDetails.find(u => u.userId === item.handledBy);
			// 			if (!user || user.deleteFlag === 1) return `Deleted User: ${item.handledBy}`;
			// 			return item.handledBy;
			// 		})(),
			// 		'Payment Method': item.paymentMethod,
			// 		'Payment Status': item.paymentStatus,
			// 		'Date Ordered': new Date(item.dateOrdered).toLocaleDateString('en-PH', {
			// 			timeZone: 'Asia/Manila'
			// 		}),
			// 		'Last Edited Date': new Date(item.lastEditedDate).toLocaleString('en-PH', {
			// 			timeZone: 'Asia/Manila'
			// 		}),
			// 		'Last Edited User': (() => {
			// 			const user = userDetails.find(u => u.userId === item.lastEditedUser);
			// 			if (!user || user.deleteFlag) return `Deleted User: ${item.lastEditedUser}`;
			// 			return item.lastEditedUser;
			// 		})()
			// 		// 'Deleted': item.deleteFlag
			// 	}));
			// }
			else if(tab === "OrderInfo"){
				newRows = data.orderInfo.map((item: any) =>({
					'Order Info ID': item.orderInfoId,
					'Quantity': item.quantity,
					'Order ID': item.orderId,
					// (() => {
					// 	const order = orderDetails.find(o => o.orderId === item.orderId);
					// 	if (!order || order.deleteFlag) return `[Deleted]`;
					// 	return item.orderId;
					// })(),
					'Product ID': item.productId,
					// (() => {
					// 	const product = productDetails.find(p => p.productId === item.productId);
					// 	if (!product || product.deleteFlag) return `[Deleted]`;
					// 	return item.productId;
					// })(),
					'Unit Price At Purchase': item.unitPriceAtPurchase,
					'Last Edited Date': new Date(item.lastEditedDate).toLocaleString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Last Edited User': (() => {
						const user = userDetails.find(u => u.userId === item.lastEditedUser);
						if (!user || user.deleteFlag) return `Deleted User: ${item.lastEditedUser}`;
						return item.lastEditedUser;
					})()
					// 'Deleted': item.deleteFlag
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
					'Received By': (() => {
						const user = userDetails.find(u => u.userId === item.receivedBy);
						if (!user || user.deleteFlag) return `Deleted User: ${item.receivedBy}`;
						return item.receivedBy;
					})(),
					'Product ID': item.productId,
					// (() => {
					// 	const product = productDetails.find(p => p.productId === item.productId);
					// 	if (!product || product.deleteFlag) return `[Deleted]`;
					// 	return item.productId;
					// })(),
					'Last Edited Date': new Date(item.lastEditedDate).toLocaleString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Last Edited User': (() => {
						const user = userDetails.find(u => u.userId === item.lastEditedUser);
						if (!user || user.deleteFlag) return `Deleted User: ${item.lastEditedUser}`;
						return item.lastEditedUser;
					})()
					// 'Deleted': item.deleteFlag
				}));
			}
			else if(tab === "StockWithdrawal"){
				newRows = data.stockWithdrawals.map((item: any) =>({
					'Withdrawal ID': item.withdrawalId,
					'Date Withdrawn': new Date(item.dateWithdrawn).toLocaleDateString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Quantity Withdrawn': item.quantityWithdrawn,
					'Purpose': item.purpose,
					'Entry ID': item.entryId,
					'Withdrawn By': (() => {
						const user = userDetails.find(u => u.userId === item.withdrawnBy);
						if (!user || user.deleteFlag) return `Deleted User: ${item.withdrawnBy}`;
						return item.withdrawnBy;
					})(),
					'Authorized By': (() => {
						const user = userDetails.find(u => u.userId === item.authorizedBy);
						if (!user || user.deleteFlag) return `Deleted User: ${item.authorizedBy}`;
						return item.authorizedBy;
					})(),
					'Last Edited Date': new Date(item.lastEditedDate).toLocaleString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Last Edited User': (() => {
						const user = userDetails.find(u => u.userId === item.lastEditedUser);
						if (!user || user.deleteFlag) return `Deleted User: ${item.lastEditedUser}`;
						return item.lastEditedUser;
					})()
					// 'Deleted': item.deleteFlag
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
					// (() => {
					// 	const order = orderDetails.find(o => o.orderId === item.orderId);
					// 	if (!order || order.deleteFlag) return `[Deleted]`;
					// 	return item.orderId;
					// })(),
					'Handled By': (() => {
						const user = userDetails.find(u => u.userId === item.handledBy);
						if (!user || user.deleteFlag) return `Deleted User: ${item.handledBy}`;
						return item.handledBy;
					})(),
					'Approved By': (() => {
						const user = userDetails.find(u => u.userId === item.approvedBy);
						if (!user || user.deleteFlag) return `Deleted User: ${item.approvedBy}`;
						return item.approvedBy;
					})(),
					'Transaction Last Edited Date': new Date(item.lastEditedDate).toLocaleString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Transaction Last Edited User': (() => {
						const user = userDetails.find(u => u.userId === item.lastEditedUser);
						if (!user || user.deleteFlag) return `Deleted User: ${item.lastEditedUser}`;
						return item.lastEditedUser;
					})(),
					'Detail ID': item.detailId,
					'Returned Product ID': item.returnedProductId,
					'Returned Quantity': item.returnedQuantity,
					'Exchange Product ID': item.exchangeProductId,
					'Exchange Quantity': item.exchangeQuantity,
					'Reason': item.reason,
					'Return Type': item.returnType,
					'Detail Last Edited Date': new Date(item.lastEditedDate).toLocaleString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Detail Last Edited User': (() => {
						const user = userDetails.find(u => u.userId === item.lastEditedUser);
						if (!user || user.deleteFlag) return `Deleted User: ${item.lastEditedUser}`;
						return item.lastEditedUser;
					})()
				}));
			}
			else if(tab === "ReturnExchangelnfo"){
				newRows = data.returnExchangeInfo.map((item: any) =>({
					'Detail ID': item.detailId,
					'Returned Product ID': item.returnedProductId,
					// (() => {
					// 	const product = productDetails.find(p => p.productId === item.returnedProductId);
					// 	if (!product || product.deleteFlag) return `[Deleted]`;
					// 	return item.returnedProductId;
					// })(),
					'Returned Quantity': item.returnedQuantity,
					'Exchange Product ID': item.exchangeProductId,
					// (() => {
					// 	const product = productDetails.find(p => p.productId === item.exchangeProductId);
					// 	if (!product || product.deleteFlag) return `[Deleted]`;
					// 	return item.exchangeProductId;
					// })(),
					'Exchange Quantity': item.exchangeQuantity,
					'Reason': item.reason,
					'Transaction ID': item.transactionId,
					// (() => {
					// 	const transaction = transactionDetails.find(t => t.transactionId === item.transactionId);
					// 	if (!transaction || transaction.deleteFlag) return `[Deleted]`;
					// 	return item.transactionId;
					// })(),
					'Return Type': item.returnType,
					'Last Edited Date': new Date(item.lastEditedDate).toLocaleString('en-PH', {
						timeZone: 'Asia/Manila'
					}),
					'Last Edited User': (() => {
						const user = userDetails.find(u => u.userId === item.lastEditedUser);
						if (!user || user.deleteFlag) return `Deleted User: ${item.lastEditedUser}`;
						return item.lastEditedUser;
					})()
					// 'Deleted': item.deleteFlag
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
	
	type UserDetails = { 
		userId: number; 
		name: string; //fullName
		user: string; //username
		deleteFlag: number;
	};
	let userDetails: UserDetails[] = [];

	async function fetchAllUsers() {
		try {
			const token = localStorage.getItem('token');
			const res = await fetch(`${PUBLIC_API_BASE_URL}/api/getAllUsers`, {
			headers: { Authorization: `Bearer ${token}` }
			});
			const data = await res.json();
        	console.log('Fetched data:', data);
			userDetails = data.users.map((item: any) => ({
				userId: Number(item.userId),
				name: item.fullName,
				user: item.username,
				deleteFlag: Number(item.deleteFlag)
			}));
		} catch (err) {
			console.error('Error fetching user lists:', err);
		}
	}

	// type ProductDetails = { 
	// 	productId: number; 
	// 	deleteFlag: number;
	// };
	// let productDetails: ProductDetails[]= [];
	// async function fetchAllProducts() {
	// 	try {
	// 		const token = localStorage.getItem('token');
	// 		const res = await fetch(`${PUBLIC_API_BASE_URL}/api/getAllProducts`, {
	// 		headers: { Authorization: `Bearer ${token}` }
	// 		});
	// 		const data = await res.json();
    //     	console.log('Fetched data:', data);
	// 		productDetails = data.products.map((item: any) => ({
	// 			productId: Number(item.productId),
	// 			deleteFlag: Number(item.deleteFlag)
	// 		}));
	// 	} catch (err) {
	// 		console.error('Error fetching user lists:', err);
	// 	}
	// }

	// type OrderDetails = { 
	// 	orderId: number; 
	// 	deleteFlag: number;
	// };
	// let orderDetails: OrderDetails[]= [];
	// async function fetchAllOrders() {
	// 	try {
	// 		const token = localStorage.getItem('token');
	// 		const res = await fetch(`${PUBLIC_API_BASE_URL}/api/getAllOrders`, {
	// 		headers: { Authorization: `Bearer ${token}` }
	// 		});
	// 		const data = await res.json();
    //     	console.log('Fetched data:', data);
	// 		orderDetails = data.orders.map((item: any) => ({
	// 			orderId: Number(item.orderId),
	// 			deleteFlag: Number(item.deleteFlag)
	// 		}));
	// 	} catch (err) {
	// 		console.error('Error fetching user lists:', err);
	// 	}
	// }

	// type TransactionDetails = { 
	// 	transactionId: number; 
	// 	deleteFlag: number;
	// };
	// let transactionDetails: TransactionDetails[]= [];
	// async function fetchAllTransactions() {
	// 	try {
	// 		const token = localStorage.getItem('token');
	// 		const res = await fetch(`${PUBLIC_API_BASE_URL}/api/getAllReturnExchanges`, {
	// 		headers: { Authorization: `Bearer ${token}` }
	// 		});
	// 		const data = await res.json();
    //     	console.log('Fetched data:', data);
	// 		transactionDetails = data.returnExchanges.map((item: any) => ({
	// 			transactionId: Number(item.transactionId),
	// 			deleteFlag: Number(item.deleteFlag)
	// 		}));
	// 	} catch (err) {
	// 		console.error('Error fetching user lists:', err);
	// 	}
	// }

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

	let editForm: { [key: string]: string } = {};
	let isEditForm = false;

	let cellEditForm: { value: string } = { value: '' };
	let isCellEditForm = false;

	// func to handle saving the edit form
	async function handleEditFormSave() {
		if (modalRowIndex !== -1) {
			const token = localStorage.getItem('actkn');
			const endpoint = updateApiMap[selected];
			const primaryKey = primaryKeyMap[selected];
			let rowId = rows[modalRowIndex][primaryKey];
			const finalForm: {[key: string]: any} = {};
			const varKey = keyMap[selected];

			const validations = idValidationMap[selected] || [];
				for(const {field, endpoint: idEndpoint} of validations){
					const raw = editForm[field];
					const trim = typeof raw === 'string' ? raw.trim(): raw;
					if ((field === 'Exchange Product ID' || field === 'Exchange Quantity') && raw === '') continue;
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
				let res;
				if(primaryKey === 'Transaction ID'){
					rowId = editForm['Detail ID'];
					console.log(rowId);
					console.log(editForm['Transaction ID']);
					res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}/${rowId}/${editForm['Transaction ID']}`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify(finalForm)
					});
				}
				else if(primaryKey === 'Order ID'){
					rowId = editForm['Order Info ID'];
					console.log(rowId);
					console.log(editForm['Order ID']);
					res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}/${rowId}/${editForm['Order ID']}`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify(finalForm)
					});
				}
				else{
					res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}/${rowId}`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify(finalForm)
					});
				}
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
			const token = localStorage.getItem('actkn');
			const endpoint = updateApiMap[selected];
			const primaryKey = primaryKeyMap[selected];
			let rowId = rows[modalRowIndex][primaryKey]; //primary key: id
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
				if ((field === 'Exchange Product ID' || field === 'Exchange Quantity') && trim === '') {
					const finalKey = varKey[field];
					if (finalKey) {
						finalForm[finalKey] = null;
					}
				}
				else{
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
				let res;
				if(primaryKey === 'Transaction ID'){
					rowId = rowData['Detail ID'];
					console.log(rowData['Transaction ID']);
					console.log(rowId);
					res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}/${rowId}/${rowData['Transaction ID']}`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify(finalForm)
					});
				}
				else if(primaryKey === 'Order ID'){
					rowId = rowData['Order Info ID'];
					console.log(rowId);
					res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}/${rowId}/${rowData['Order ID']}`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify(finalForm)
					});
				}
				else{
					res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}/${rowId}`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify(finalForm)
					});
				}
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
			const token = localStorage.getItem('actkn');
			const endpoint = createApiMap[selected];
			try{
				const finalForm: {[key: string]: any} = {};
				const varKey = keyMap[selected];
				
				const validations = idValidationMap[selected] || [];
				for(const {field, endpoint: idEndpoint} of validations){
					const raw = addForm[field]?.trim();
					if ((field === 'Exchange Product ID' || field === 'Exchange Quantity') && raw === '') continue;
					if(!raw || isNaN(Number(raw))){
						alert(`${field} must be a number.`);
						return;
					}
					const id = Number(raw);
					const exists = await validate(idEndpoint, id);
				
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
				if (selected === 'Orders') {
					const item = {
						productId: finalForm.productId,
						quantity: finalForm.quantity,
						unitPriceAtPurchase: finalForm.unitPriceAtPurchase
					};

					// Remove from finalForm to avoid duplication
					delete finalForm.productId;
					delete finalForm.quantity;
					delete finalForm.unitPriceAtPurchase;

					finalForm.items = [item];
				}
				if (selected === 'ReturnExchange') {
					const item = {
						returnedProductId: finalForm.returnedProductId,
						returnedQuantity: finalForm.returnedQuantity, 
						exchangeProductId: finalForm.exchangeProductId, 
						exchangeQuantity: finalForm.exchangeQuantity, 
						reason: finalForm.reason,  
						returnType: finalForm.returnType
					};

					// Remove from finalForm to avoid duplication
					delete finalForm.returnedProductId;
					delete finalForm.returnedQuantity;
					delete finalForm.exchangeProductId;
					delete finalForm.exchangeQuantity;
					delete finalForm.reason;
					delete finalForm.returnType;
					finalForm.transactions = [item];
				}


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
		if (selectedRows.length === 0) return;

		if (!confirm(`Are you sure you want to delete ${selectedRows.length} selected row(s)?`)) {
			return;
		}

		const token = localStorage.getItem('actkn');
		const failedDeletes: number[] = []; 
		const endpoint   = deleteApiMap[selected];
		const primaryKey = primaryKeyMap[selected];
		const failed: any[] = [];

		for (const idx of selectedRows) {
			const row   = rows[idx];
    		const rowId = row[primaryKey];

			if (!rowId) {
				console.warn(`No primary key (“${primaryKey}”) found on row`, row);
				failed.push(`#${idx}`);
				continue;
			}

			try {
					//fix: uses privateClient
					// const res = await fetch(`${PUBLIC_API_BASE_URL}/api/deleteProduct/${productId}`, {
					// 	method: "DELETE",
					// 	headers: {
					// 		"Content-Type": "application/json",
					// 		Authorization: `Bearer ${token}`
					// 	}
					// });

					// if (!res.ok) {
					// 	const err = await res.json();
					// 	console.error(`Failed to delete product ${productId}:`, err.message || err);
					// 	failedDeletes.push(productId);
					// }

					await privateClient.delete(`/api/deleteProduct/${productId}`);

				} catch (err) {
					console.error(`Failed to delete ${selected} ${rowId}:`, err);
					failed.push(rowId);
				}

			// clear selection, reload
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
</script>

<!-- header w/ search bar and filter-->
<header class="flex justify-between p-7 fixed gray1 pr-70" style="width: 100%; z-index: 10;">
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
				: 'red1 text-white hover:bg-[#8a0000]'}"
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
					<!-- <tr class={`border-b border-black ${i % 2 === 0 ? 'bg-[#eeeeee]' : 'bg-white'} ${row['Deleted'] === 1 ? 'text-red-500 italic bg-red-50' : ''}`}> -->
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
						<!-- {:else if head === "Product Name" && row['Deleted'] === 1}
							<span class="text-red-500 italic">[Deleted] {row[head]}</span> -->
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
	<div bind:this={sentinel}></div>
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
					{#each currentHeaders.filter(h => h !== primaryKeyMap[selected] && !(selected === 'Orders' && h.replace(/\s+/g, '').toLowerCase() === 'orderinfoid') && !(selected === 'ReturnExchange' && h.replace(/\s+/g, '').toLowerCase() === 'detailid')&& !/^date/i.test(h) && !['Last Edited Date', 'Last Edited User', 'Order Last Edited Date', 'Order Last Edited User', 'Info Last Edited Date', 'Info Last Edited User', 'Transaction Last Edited Date', 'Transaction Last Edited User', 'Detail Last Edited Date', 'Detail Last Edited User'].includes(h)) as head}
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
					{#each currentHeaders.filter(h => h !== primaryKeyMap[selected] && !(selected === 'Orders' && h.replace(/\s+/g, '').toLowerCase() === 'orderinfoid') && !(selected === 'ReturnExchange' && h.replace(/\s+/g, '').toLowerCase() === 'detailid') && !/^date/i.test(h) && !['Last Edited Date', 'Last Edited User', 'Order Last Edited Date', 'Order Last Edited User', 'Info Last Edited Date', 'Info Last Edited User', 'Transaction Last Edited Date', 'Transaction Last Edited User', 'Detail Last Edited Date', 'Detail Last Edited User'].includes(h)) as head}
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
								(selected === 'Orders' && modalColumn.replace(/\s+/g, '').toLowerCase() === 'orderinfoid') ||
								(selected === 'ReturnExchange' && modalColumn.replace(/\s+/g, '').toLowerCase() === 'detailid') ||
								/^date/i.test(modalColumn) ||
								modalColumn === 'Last Edited Date' ||
								modalColumn === 'Last Edited User' ||
								modalColumn === 'Order Last Edited Date' ||
								modalColumn === 'Order Last Edited User' ||
								modalColumn === 'Info Last Edited Date' ||
								modalColumn === 'Info Last Edited User' ||
								modalColumn === 'Transaction Last Edited Date' ||
								modalColumn === 'Transaction Last Edited User' ||
								modalColumn === 'Detail Last Edited Date' ||
								modalColumn === 'Detail Last Edited User'
							}
						/>
					</div>
					<div class="mt-4 flex gap-2">
						{#if !(
							modalColumn === primaryKeyMap[selected] ||
							(selected === 'Orders' && modalColumn.replace(/\s+/g, '').toLowerCase() === 'orderinfoid') ||
							(selected === 'ReturnExchange' && modalColumn.replace(/\s+/g, '').toLowerCase() === 'detailid') ||
							/^date/i.test(modalColumn) ||
							modalColumn === 'Last Edited Date' ||
							modalColumn === 'Last Edited User' ||
							modalColumn === 'Order Last Edited Date' ||
							modalColumn === 'Order Last Edited User' ||
							modalColumn === 'Info Last Edited Date' ||
							modalColumn === 'Info Last Edited User' ||
							modalColumn === 'Transaction Last Edited Date' ||
							modalColumn === 'Transaction Last Edited User' ||
							modalColumn === 'Detail Last Edited Date' ||
							modalColumn === 'Detail Last Edited User'
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