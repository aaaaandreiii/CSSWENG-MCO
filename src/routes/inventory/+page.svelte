<script lang="ts">
	type TabType = 'returns' | 'completed' | 'stocks';
	let selected: TabType = 'stocks';

	const headerMap: Record<TabType, string[]> = {
		returns: [
			"Transaction ID",
			"Product/s Returned",
			"Reason for Return",
			"Date Returned",
			"Resolution Status",
			"Approved By",
			"Qty Returned"
		],
		completed: [
			"Transaction ID",
			"Products Purchased",
			"Qty Purchased",
			"Date Purchased",
			"Date Delivered",
			"Address Delivered",
			"Buyer Name"
		],
		stocks: [
			"Product ID",
			"Product Name",
			"Product Type",
			"Product Description",
			"Product Manufacturer",
			"Current Warehouse",
			"Stock Amt"
		]
	};

	$: currentHeaders = headerMap[selected];

	let rows: { [key: string]: string }[] = [
    { "Product ID": "1",
      "Product Name": "A",
      "Product Type": "Gadget",
      "Product Description": "Description A",
      "Product Manufacturer": "Manufacturer A",
      "Current Warehouse": "Warehouse 1",
      "Stock Amt": "100"
    },
    {
      "Product ID": "2",
      "Product Name": "B",
      "Product Type": "Gadget",
      "Product Description": "Description B",
      "Product Manufacturer": "Manufacturer B",
      "Current Warehouse": "Warehouse 2",
      "Stock Amt": "50"
    }
		// add more dummy entries as needed
	];
	let selectedRows = [];

	let showModal = false;
	let modalContent = '';

	function openModal(content: string) {
	    modalContent = content;
	    showModal = true;
	}
	function closeModal() {
	    showModal = false;
	    modalContent = '';
	}
</script>

<!-- header w/ search bar and filter-->
<header class = "p-7 flex justify-between">
	<h1>Inventory</h1>

	<div class = "flex gap-3">
		<div class="bg-white rounded-4xl w-fit flex px-3">
			<input type="text" placeholder="Search" class="w-55 p-2" style = "outline:none" />
			<img src="../src/icons/search.svg" alt="search" style="width:15px; " />
		</div>
		<div class="bg-white rounded-4xl w-fit flex px-3">
			<input type="text" placeholder="Order by" class="w-35 p-2" style = "outline:none"/>
			<img src="../src/icons/filter.svg" alt="search" style="width:15px; " />
		</div>
	</div>
</header>

<!-- navbar -->
<div>
	<div class = "flex">
		<button
			class="buttonss flex items-center justify-center {selected === 'stocks' ? 'selected' : ''}"
			on:click={() => selected = 'stocks'}>
			<div class = "flex items-center gap-2">
				<img src = "../src/icons/box.svg" alt="Stocks" class = "w-6"/>
				Stocks
			</div>
		</button>
		<button
			class="buttonss flex items-center justify-center {selected === 'completed' ? 'selected' : ''}"
			on:click={() => selected = 'completed'}>
			<div class = "flex items-center gap-2">
				<img src = "../src/icons/completed.svg" alt="Completed" class = "w-6"/>
				Completed
			</div>
		</button>
		<button
			class="buttonss flex items-center justify-center {selected === 'returns' ? 'selected' : ''}"
			on:click={() => selected = 'returns'}>
			<div class = "flex items-center gap-2">
				<img src = "../src/icons/returns.svg" alt="Returns" class = "w-6"/>
				Returns
			</div>
		</button>
	</div>
</div>

<!-- table -->
<div class="w-full overflow-x-auto">
	<table class="w-full border-collapse table-auto">
		<thead class="bg-white border-b border-black">
			<tr>
				<th class="text-center py-5"></th>
				{#each currentHeaders as head}
					<th class="text-center py-5">{head}</th>
				{/each}
				<th class="text-center py-5"></th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row, i}
				<tr class="border-b border-black {i % 2 === 0 ? 'bg-[#eeeeee]' : 'bg-white'}">
					<td class="text-center py-5">
						<input type="checkbox" bind:group={selectedRows} value={i} />
					</td>
					{#each currentHeaders as head}
						<td class="text-center py-5 max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer" title={row[head]} on:click={() => openModal(row[head])}>
							{row[head]}
						</td>
					{/each}
					<td class="text-center py-5">
						<img src="../src/icons/edit.svg" alt="Edit" class="w-5 h-5 mx-auto cursor-pointer" />
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
		on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') closeModal(); }}
	>
		<div
			class="modal-box"
			role="dialog"
			aria-modal="true"
			tabindex="0"
			on:click|stopPropagation
			on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}
		>
			<div class="mb-4">{modalContent}</div>
		</div>
	</div>
{/if}