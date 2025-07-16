<script lang="ts">
	let stocks = [
		{ amount: '50K', label: 'Total stocks' },
		{ amount: '10', label: 'Total sold' },
		{ amount: '79k', label: 'Total Pending' }
	];

	let products = [
		{ label: 'red', mssg: 'Out of stock', amount: '14', capital: '12782.14', color: '#DE0101' },
		{ label: 'yellow', mssg: 'Low stock', amount: '5', capital: '10000.00', color: '#FFDE59' }
	];

	import { items } from '$lib/index.js';

	let selectedButton = '12 months'; // Track which button is selected

	function handleClick(buttonId: string) {
		selectedButton = buttonId;
	}

	let showDropdown = false;
	const dropdownOptions = ['10 days', '1 month', '1 year'];
	let selectedDropdown = '10 days';

	function selectDropdown(option: string) {
		selectedDropdown = option;
		showDropdown = false;
	}
</script>

<header class="p-7">
	<h1>Dashboard</h1>
</header>

<div id="bg_faded">
	<div class="flex justify-evenly">
		<!-- sales summary -->
		<div class="flex-col">
			<div class="pt-7 pl-7">
				<h1 class="text-xl font-bold">Sales Summary</h1>
			</div>
			<div class="flex gap-7 p-7">
				{#each stocks as stock, index}
					<div class="stock flex-col content-center">
						<h1 class="header">{stock.amount}</h1>
						<p class="text-center">{stock.label}</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- stock alerts -->
		<div class="flex gap-7 p-7">
			{#each products as product, index}
				<div class="whitebox flex-col content-center">
					<div id={product.label} class="flex items-center gap-1 px-2">
						<div class="circle" style="background-color: {product.color}"></div>
						<p>{product.mssg}</p>
					</div>

					<div class="p-.5 flex items-end">
						<h1 class="header self-end">{product.amount}</h1>
						<p class="pb-2">&nbspproducts</p>
					</div>

					<div class="flex items-center text-left">
						<p class="text-sm">Estimated capital needed:</p>
						<p class="text-start font-bold">&nbspP{product.capital}</p>
					</div>
					<a href="/inventory"
						><p class="text-s pt-4 font-bold" style="color: #1E8570">Check Inventory</p></a
					>
				</div>
			{/each}
		</div>
	</div>
</div>

<!-- top selling -->
<div class="flex justify-evenly pt-7">
	<div id="report" class="">
		<div>
			<h1 class="text-base font-bold">Top-selling products</h1>
			<div class="flex items-center gap-1 p-3">
				<p>Last&nbsp</p>
				<div class="relative inline-block text-left">
					<div class="relative">
						<button
							type="button"
							class="gap-x-1.3 inline-flex w-full justify-center rounded-3xl bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
							id="menu-button"
							aria-expanded={showDropdown}
							aria-haspopup="true"
							onclick={() => (showDropdown = !showDropdown)}
						>
							{selectedDropdown}
							<svg
								class="-mr-1 size-5 text-gray-400"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
								data-slot="icon"
							>
								<path
									fill-rule="evenodd"
									d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
						{#if showDropdown}
							<ul
								class="absolute left-0 z-10 mt-2 w-32 rounded border border-gray-200 bg-white shadow"
							>
								{#each dropdownOptions as option}
									<li>
										<button
											class="w-full px-4 py-2 text-left hover:bg-gray-100"
											onclick={() => selectDropdown(option)}>{option}</button
										>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				</div>
			</div>
		</div>
		<div id="topimg" class="grid grid-cols-2 justify-items-center gap-5">
			{#each items as item}
				<div>
					<!-- can add href to link in inventory -->
					<img src={item.link} alt={item.name} />
					<p class="text-center text-sm">{item.name}</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- sales report -->
	<div id="report" style="width: 50%">
		<div class="flex items-center gap-5">
			<h1 class="text-start text-base font-bold">Sales Report</h1>
			<div class="flex">
				<button
					class="buttons {selectedButton === '12months' ? 'pressed' : ''}"
					onclick={() => handleClick('12months')}
				>
					12 months
				</button>

				<button
					class="buttons {selectedButton === '6months' ? 'pressed' : ''}"
					onclick={() => handleClick('6months')}
				>
					6 months
				</button>

				<button
					class="buttons {selectedButton === '30days' ? 'pressed' : ''}"
					onclick={() => handleClick('30days')}
				>
					30 days
				</button>
			</div>
		</div>
		<div>
			<p class="text-sm">Avg per month</p>
			<h1 class="header">P 12,123</h1>
		</div>
		<div>
			<!-- graph -->
		</div>
	</div>
</div>
