<script lang="ts">
  import { PUBLIC_API_BASE_URL } from '$env/static/public';
  import { onMount } from 'svelte';

  // Table columns
  const headerMap = [
    'Order ID',
    // 'Customer',
    'Date Ordered',
    'Discount',
    'Handled By',
    'Payment Method',
    'Payment Status',
	'Order Info ID',
    'Product ID',
    'Product Name',
    'Units',
    'Category',
    'Quantity',
    'Unit Price At Purchase',
    'Returned Quantity',
    'Exchange Product ID',
    'Reason',
    'Return Type'
  ];

  let collapsedOrders = new Set<string>(); // Track collapsed order IDs
  let selectedOrders = new Set<string>(); // For full-order selection

  // Table state
  let selectedRows: number[] = [];
  let rows: { [key: string]: string }[] = [];
  let isLoading = false;
  let hasMoreData = true;
  const ITEMS_PER_PAGE = 100;
  let currentOffset = 0;

  // Sorting
  let sortColumn: string = '';
  let sortDirection: 'asc' | 'desc' = 'asc';
  let originalRows: { [key: string]: string }[] = [];

  // Modal states
  let showModal = false;
  let showAddModal = false;
  let modalContent = '';
  let modalRowIndex = -1;
  let modalColumn = '';

  // Form states
  let editForm: { [key: string]: string } = {};
  let isEditForm = false;
  let cellEditForm: { value: string } = { value: '' };
  let isCellEditForm = false;
  let addForm: { [key: string]: string | null } = {};
  let isAddForm = false;
  let selectedIndividualRows = new Set<string>(); // Track individual row selections using orderInfoId

  // API endpoints
  const apiMaps = {
    get: 'getFullOrderDetails',
    create: 'createOrder',
    update: 'updateOrder',
    delete: 'deleteOrder'
  };

  // Key mapping for API fields
  const keyMap = {
    'Order ID': 'orderId',
    'Customer': 'customer',
    'Date Ordered': 'dateOrdered',
    'Discount': 'discount',
    'Handled By': 'handledBy',
    'Payment Method': 'paymentMethod',
    'Payment Status': 'paymentStatus',
	'Order Info ID': 'orderInfoId',
    'Product ID': 'productId',
    'Product Name': 'productName',
    'Units': 'units',
    'Category': 'category',
    'Quantity': 'quantity',
    'Unit Price At Purchase': 'unitPriceAtPurchase',
    'Returned Quantity': 'returnedQuantity',
    'Exchange Product ID': 'exchangeProductId',
    'Reason': 'reason',
    'Return Type': 'returnType'
  };

  // ID validation fields
  const idValidationMap = [
    { field: 'Handled By', endpoint: 'getUserById' },
    { field: 'Product ID', endpoint: 'getProductById' },
    { field: 'Exchange Product ID', endpoint: 'getProductById' }
  ];
  
  // format date
  function formatDate(dateString: string) {
	if (!dateString) return 'No Date';
	try {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
		});
	} catch {
		return 'Invalid Date';
	}
  }

  	function toggleOrderCollapse(orderId: string) {
		const idStr = orderId.toString();
		collapsedOrders.has(idStr) 
			? collapsedOrders.delete(idStr)
			: collapsedOrders.add(idStr);
		collapsedOrders = new Set(collapsedOrders);
	}

	function toggleIndividualRowSelection(orderInfoId: string) {
		selectedIndividualRows.has(orderInfoId)
			? selectedIndividualRows.delete(orderInfoId)
			: selectedIndividualRows.add(orderInfoId);
		selectedIndividualRows = new Set(selectedIndividualRows);
	}

	function toggleOrderSelection(orderId: string) {
		const idStr = orderId.toString();
		selectedOrders.has(idStr)
			? selectedOrders.delete(idStr)
			: selectedOrders.add(idStr);
		selectedOrders = new Set(selectedOrders); // Trigger reactivity
	}

  // Fetch data
  async function fetchFullOrderData(offset = 0, append = false) {
    if (isLoading) return;
    isLoading = true;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${PUBLIC_API_BASE_URL}/api/${apiMaps.get}?offset=${offset}&limit=${ITEMS_PER_PAGE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { data } = await res.json();
      
      const newRows = data.map((item: any) => ({
        'Order ID': item.orderId,
        'Customer': item.customer,
        'Date Ordered': item.orderDate,
        'Discount': item.discount,
        'Handled By': item.handledBy,
        'Payment Method': item.paymentMethod,
        'Payment Status': item.paymentStatus,
		'Order Info ID': item.orderInfoId,
        'Product ID': item.productId,
        'Product Name': item.productName,
        'Units': item.units,
        'Category': item.category,
        'Quantity': item.quantity,
        'Unit Price At Purchase': item.unitPriceAtPurchase,
        'Returned Quantity': item.returnedQuantity || '',
        'Exchange Product ID': item.exchangeProductId || '',
        'Reason': item.reason || '',
        'Return Type': item.returnType || ''
      }));
	  console.log(newRows[0]?.orderInfoId);

      hasMoreData = newRows.length === ITEMS_PER_PAGE;

      if (append) {
        rows = [...rows, ...newRows];
      } else {
        rows = newRows;
      }
      
      originalRows = append ? [...originalRows, ...newRows] : [...newRows];
    } catch(err) {
      console.error("Error fetching order details:", err);
    } finally {
      isLoading = false;
    }
	
  }

  // Load more data for infinite scroll
  async function loadMoreData() {
    if (!hasMoreData || isLoading) return;
    currentOffset += ITEMS_PER_PAGE;
    await fetchFullOrderData(currentOffset, true);
  }

  function handleScroll(event: Event) {
    const target = event.target as HTMLElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    
    if (scrollHeight - scrollTop - clientHeight < 200 && hasMoreData && !isLoading) {
      loadMoreData();
    }
  }

  // Sorting function
  function sortBy(column: string) {
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      sortDirection = 'asc';
    }
    
     rows = [...rows].sort((a, b) => {
		const aVal = a[column];
		const bVal = b[column];

		// Try to parse numbers or dates
		const aParsed = !isNaN(Number(aVal))
		? Number(aVal)
		: Date.parse(aVal) || aVal.toString().toLowerCase();
		const bParsed = !isNaN(Number(bVal))
		? Number(bVal)
		: Date.parse(bVal) || bVal.toString().toLowerCase();

		if (aParsed < bParsed) return sortDirection === 'asc' ? -1 : 1;
		if (aParsed > bParsed) return sortDirection === 'asc' ? 1 : -1;
		return 0;
    });
  }

  // CRUD Operations
  async function validate(endpoint: string, id: number) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${PUBLIC_API_BASE_URL}/api/${endpoint}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.ok;
  }

  // Delete functionality
async function handleDeleteSelected() {
    const itemsToDelete = [...selectedIndividualRows];
    const ordersToDelete = [...selectedOrders];
    
    if (itemsToDelete.length === 0 && ordersToDelete.length === 0) return;
    
    const confirmMessage = ordersToDelete.length > 0
        ? `Delete ${ordersToDelete.length} entire order(s) and ${itemsToDelete.length} item(s)?`
        : `Delete ${itemsToDelete.length} selected item(s)?`;
    
    if (!confirm(confirmMessage)) return;

    const token = localStorage.getItem('token');
    const failedDeletes: string[] = [];

    // Debug: Log what we're trying to delete
    console.log('Deleting items:', itemsToDelete);
    console.log('Deleting orders:', ordersToDelete);

    // Delete entire orders first
    for (const orderId of ordersToDelete) {
        try {
            const res = await fetch(`${PUBLIC_API_BASE_URL}/api/deleteOrder/${orderId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                console.error('Failed to delete order', orderId, res.status);
                failedDeletes.push(`Order ${orderId}`);
            }
        } catch (err) {
            console.error('Error deleting order', orderId, err);
            failedDeletes.push(`Order ${orderId}`);
        }
    }

    // Only delete individual items if we're not deleting their parent orders
    if (ordersToDelete.length === 0 && itemsToDelete.length > 0) {
        for (const orderInfoId of itemsToDelete) {
            try {
                console.log('Deleting item with orderInfoId:', orderInfoId);
                const res = await fetch(`${PUBLIC_API_BASE_URL}/api/deleteOrderItem/${orderInfoId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (!res.ok) {
                    console.error('Failed to delete item', orderInfoId, res.status);
                    failedDeletes.push(`Item ${orderInfoId}`);
                }
            } catch (err) {
                console.error('Error deleting item', orderInfoId, err);
                failedDeletes.push(`Item ${orderInfoId}`);
            }
        }
    }

    // Clear selections and refresh
    selectedRows = [];
    selectedIndividualRows.clear(); // Add this line
    selectedOrders.clear();
    currentOffset = 0;
    await fetchFullOrderData();

    if (failedDeletes.length > 0) {
        alert(`Failed to delete: ${failedDeletes.join(', ')}`);
    } else {
        alert('Deletion successful!');
    }
}

  // Open edit modal for cell
  function openModal(value: string, rowIndex: number, column: string) {
	modalContent = value;
	showModal = true;
	modalRowIndex = rowIndex;
	modalColumn = column;
	if (rowIndex !== -1 && column) {
		cellEditForm = { value };
		isCellEditForm = true;
		isEditForm = false;
	}
  }


  // Open add modal
  function openAddModal() {
    addForm = {};
    headerMap.forEach((h) => (addForm[h] = ''));
    isAddForm = true;
    showModal = true;
    modalContent = '';
    isEditForm = false;
    isCellEditForm = false;
  }

  // Close modal
  function closeModal() {
    showModal = false;
    modalContent = '';
    isAddForm = false;
    isEditForm = false;
    isCellEditForm = false;
  }

  // Save edited cell
  async function handleCellEditFormSave() {
    if (modalRowIndex !== -1 && modalColumn) {
      const token = localStorage.getItem('token');
      const rowId = rows[modalRowIndex]['Order ID'];
      const finalForm: Record<string, any> = {};
      const field = modalColumn;
      const raw = cellEditForm.value;
      const trim = typeof raw === 'string' ? raw.trim() : raw;

      // Validate ID fields
      const validation = idValidationMap.find(v => v.field === field);
      if (validation) {
        if (trim === '' || isNaN(Number(trim))) {
          alert(`${field} must be a number.`);
          return;
        }
        const id = Number(trim);
        const exists = await validate(validation.endpoint, id);
        if (!exists) {
          alert(`${field} ${id} does not exist in the database.`);
          return;
        }
        finalForm[keyMap[field]] = id;
      } else {
        finalForm[keyMap[field]] = trim;
      }

      try {
        const res = await fetch(`${PUBLIC_API_BASE_URL}/api/${apiMaps.update}/${rowId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(finalForm)
        });

        if (!res.ok) {
          alert("Error updating!");
          return;
        }

        await fetchFullOrderData();
        closeModal();
      } catch(err) {
        console.error("Error updating: ", err);
      }
    }
  }

  // Save new order
  async function handleAddFormSave() {
    if (Object.values(addForm).some(v => v?.trim() !== '')) {
      const token = localStorage.getItem('token');
      const finalForm: Record<string, any> = {};

      // Validate ID fields
      for (const {field, endpoint} of idValidationMap) {
        const raw = addForm[field]?.trim();
        if (!raw || isNaN(Number(raw))) {
          alert(`${field} must be a number.`);
          return;
        }
        const id = Number(raw);
        const exists = await validate(endpoint, id);
        if (!exists) {
          alert(`${field} ${id} does not exist in the database.`);
          return;
        }
        finalForm[keyMap[field]] = id;
      }

      // Add other fields
      for (const key in addForm) {
        const value = addForm[key]?.trim();
        if (value && value !== '' && !finalForm.hasOwnProperty(keyMap[key])) {
          finalForm[keyMap[key]] = value;
        }
      }

      try {
        const res = await fetch(`${PUBLIC_API_BASE_URL}/api/${apiMaps.create}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(finalForm)
        });

        if (!res.ok) {
          alert("Error creating order!");
          return;
        }

        await fetchFullOrderData();
        closeModal();
      } catch(err) {
        console.error("Error creating: ", err);
      }
    }
  }

  // Group rows by Order ID for display
  function groupRowsByOrderId(flatRows: { [key: string]: string }[]) {
    const groups: Record<string, any> = {};

    for (const row of flatRows) {
      const id = row['Order ID'];
      if (!groups[id]) {
        groups[id] = {
          orderId: +id,
          baseInfo: {
            'Order ID': id,
            'Customer': row['Customer'],
            'Date Ordered': row['Date Ordered'],
            'Discount': row['Discount'],
            'Handled By': row['Handled By'],
            'Payment Method': row['Payment Method'],
            'Payment Status': row['Payment Status']
          },
          lineItems: []
        };
      }

      groups[id].lineItems.push({
		'Order Info ID': row['Order Info ID'],
        'Product ID': row['Product ID'],
        'Product Name': row['Product Name'],
        'Units': row['Units'],
        'Category': row['Category'],
        'Quantity': row['Quantity'],
        'Unit Price At Purchase': row['Unit Price At Purchase'],
        'Returned Quantity': row['Returned Quantity'],
        'Exchange Product ID': row['Exchange Product ID'],
        'Reason': row['Reason'],
        'Return Type': row['Return Type']
      });
    }

    return Object.values(groups);
  }

  // Initialize
  onMount(() => {
    fetchFullOrderData();
  });
</script>

<header class="flex justify-between p-7">
  <h1>Orders</h1>

  <div class="flex gap-3">
    <div class="flex w-fit rounded-4xl bg-white px-3">
      <input type="text" placeholder="Search" class="w-55 p-1" style="outline:none" />
      <img src="../src/icons/search.svg" alt="search" style="width:15px;" />
    </div>
    <div class="flex w-fit rounded-4xl bg-white px-3">
      <select
        class="w-35 p-1 outline-none"
        bind:value={sortColumn}
        on:change={() => sortBy(sortColumn)}
      >
        <option value="">All</option>
        {#each headerMap as head}
          <option value={head}>{head}</option>
        {/each}
      </select>
    </div>
  </div>
</header>


<!-- Top bar: Tab + Buttons -->
<div class="flex items-center justify-between px-4 py-2 bg-white border-b border-black">
  <!-- Static "Orders" tab styled like a table tab -->
  <div class="text-sm font-semibold text-gray-800 px-2">
    Order Details
  </div>

  <!-- Buttons -->
  <div class="flex gap-5">
    <button
      class="w-28 py-2 items-center justify-center gap-2 rounded-lg font-bold
        {(selectedIndividualRows.size === 0 && selectedOrders.size === 0)
          ? 'cursor-not-allowed bg-gray-400 text-gray-200'
          : isLoading ? 'bg-gray-500 text-white' 
          : 'red1 text-white hover:bg-red-700'}"
      disabled={selectedIndividualRows.size === 0 && selectedOrders.size === 0 || isLoading}
      on:click={handleDeleteSelected}
    >
      {isLoading ? 'Deleting...' : 'Delete'}
    </button>

    <button
      class="w-28 py-2 items-center justify-center gap-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
      on:click={openAddModal}
    >
      Add Order
    </button>
  </div>
</div>


<!-- Main table -->
<div class="w-full overflow-x-auto" on:scroll={handleScroll}>
  <table class="w-full table-fixed border-collapse">
    <thead class="border-b border-black bg-white">
      <tr>
        <th class="w-[40px] max-w-[40px] min-w-[40px] py-5 text-center"></th>
        {#each headerMap as head}
          <th
            class="px-4 py-5 text-center align-middle break-words whitespace-normal"
            style="width: calc({head.length}ch + 40px);"
          >
            <button
              class="flex w-full items-center justify-center gap-1 font-bold"
              on:click={() => sortBy(head)}
            >
              <span class="w-full break-words whitespace-normal">{head}</span>
              <span class="inline-block w-4 min-w-[1rem] text-center align-middle">
                {sortColumn === head
                  ? sortDirection === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </span>
            </button>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each groupRowsByOrderId(rows) as groupedOrder, i}
        <!-- Order summary header row -->
        <tr class="bg-blue-100 border-t border-black cursor-pointer" 
			on:click={() => toggleOrderCollapse(groupedOrder.orderId)}>
			<td colspan={headerMap.length + 1} class="text-left px-4 py-2 font-bold">
				<div class="flex items-center">
					<input 
					type="checkbox" 
					class="mr-3"
					checked={selectedOrders.has(groupedOrder.orderId.toString())}
					on:click|stopPropagation={(e) => {
						e.stopPropagation();
						toggleOrderSelection(groupedOrder.orderId);
					}}
					/>
					<span class="transform transition-transform duration-200 {collapsedOrders.has(groupedOrder.orderId.toString()) ? 'rotate-90' : ''}">
						▶
					</span>
					<span class="ml-2">
						Order #{groupedOrder.orderId} • {groupedOrder.baseInfo['Customer']} • 
						{formatDate(groupedOrder.baseInfo['Date Ordered'])}
					</span>
				</div>
			</td>
		</tr>

        <!-- Each line item -->
		{#if !collapsedOrders.has(groupedOrder.orderId.toString())}
			{#each groupedOrder.lineItems as item, j}
			<tr class="{i % 2 === 0 ? 'bg-[#eeeeee]' : 'bg-white'} border-b border-black">
				<td class="w-[40px] text-center">
				<input 
					type="checkbox" 
					checked={selectedIndividualRows.has(item['Order Info ID'])}
					on:click|stopPropagation={() => toggleIndividualRowSelection(item['Order Info ID'])}
				/>
				</td>

				{#each headerMap as head}
				<td
					class="px-4 py-3 text-center text-ellipsis whitespace-nowrap"
					title={item[head] || groupedOrder.baseInfo[head] || ''}
					on:click={() => openModal(item[head] || groupedOrder.baseInfo[head] || '', i, head)}
				>
					{#if head === 'Date Ordered'}
					<div>{(item[head] || groupedOrder.baseInfo[head] || '').split('T')[0]}</div>
					<div class="text-xs text-gray-500">
						{(item[head] || groupedOrder.baseInfo[head] || '').split('T')[1]?.slice(0,5)}
					</div>
					{:else}
					{item[head] || groupedOrder.baseInfo[head] || '-'}
					{/if}
				</td>
				{/each}
			</tr>
			{/each}
		{/if}
      {/each}
    </tbody>
  </table>
  {#if rows.length === 0 && isLoading}
	<div class="text-center p-4 text-gray-500">Loading orders...</div>
  {/if}
  {#if isLoading && rows.length > 0}
	<div class="text-center py-4 text-gray-500">Loading more...</div>
  {/if}



  <!-- Add Order Modal -->
  {#if showModal && isAddForm}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-[500px] max-w-full">
        <h2 class="text-xl font-bold mb-4">Add New Order</h2>
        
        <form on:submit|preventDefault={handleAddFormSave}>
          {#each ['Customer', 'Discount', 'Handled By', 'Payment Method', 'Payment Status'] as field}
            <div class="mb-2">
				<label for={`add-${field}`} class="block">{field}:</label>
				{#if field === 'Payment Method' || field === 'Payment Status'}
					<select id={`add-${field}`} bind:value={addForm[field]} class="border w-full p-1" required>
                  {#if field === 'Payment Method'}
                    <option value="">Select</option>
                    <option>cash</option>
                    <option>credit card</option>
                    <option>debit card</option>
                    <option>online payment</option>
                  {:else}
                    <option value="">Select</option>
                    <option>pending</option>
                    <option>paid</option>
                    <option>failed</option>
                  {/if}
                </select>
				{:else}
					<input id={`add-${field}`} bind:value={addForm[field]} class="border w-full p-1" required />
				{/if}
			</div>
          {/each}

          <div class="flex justify-end gap-2 mt-4">
            <button type="button" on:click={closeModal} class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- Edit Cell Modal -->
  {#if showModal && isCellEditForm}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-[500px] max-w-full">
        <h2 class="text-xl font-bold mb-4">Edit {modalColumn}</h2>
        
        <form on:submit|preventDefault={handleCellEditFormSave}>
          <div class="mb-2">
			<label for="edit-cell-input" class="block">{modalColumn}:</label>
			<input id="edit-cell-input" bind:value={cellEditForm.value} class="border w-full p-1" required />
		  </div>

          <div class="flex justify-end gap-2 mt-4">
            <button type="button" on:click={closeModal} class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>