<script lang="ts">
	// import { PUBLIC_API_BASE_URL } from '$env/static/public';    //replaced by privateClient and publicClient
    import { publicClient } from '$lib/api/public.client';
    import privateClient   from '$lib/api/private.client';
	import { tick, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Chart from 'chart.js/auto';

	// --- DATA STATE ---
	let stocks = [], products = [], items = [], avgSalesPerMonth = 0, totalSalesInTheLastTimePeriod = 0;
	let salesPerMonth: { year: number; month: number; sum: number }[] = [];

	//charting for sales per month graph
	let chartCanvas: HTMLCanvasElement;
  	let monthlySalesChart: Chart;
	
	// --- DROPDOWN (Top-selling period) ---
	let selectedDropdown = '10 days';
	const dropdownOptions = ['10 days', '1 month', '1 year'];
	let showDropdown = false;

	async function selectDropdown(option: string) {
		selectedDropdown = option;
		showDropdown = false;
		await tick();
   		await fetchDashboard();
		// fetchDashboard().then(() => {
		// 	if (salesPerMonth.length) initChart();
		// });
		if (salesPerMonth.length) initChart();
	}
	const dropdownDurationMap = {
		'10 days': 10,
		'1 month': 30,
		'1 year': 365
	};
	$: topSellingDuration = dropdownDurationMap[selectedDropdown];

	// --- BUTTONS (Sales-report period) ---
	let selectedButton = '12months';
	const buttonOptions = ['12months', '6months', '30days'];
	const buttonDurationMap = {
		'12months': 365,
		'6months': 182,
		'30days': 30
	};
	$: salesReportDuration = buttonDurationMap[selectedButton];

	// // --- AUTH & URL ---
	// let token: string | null = null;
	// if (browser) {
	// 	token = localStorage.getItem('token');
	// }

  // --- FETCHING ---
  async function fetchDashboard() {
	//fix: uses privateClient
    // const res = await fetch(
    //   `${PUBLIC_API_BASE_URL}/api/dashboard?topSellingDuration=${topSellingDuration}`
    //   + `&salesReportDuration=${salesReportDuration}`,
    //   { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    // );
    // if (!res.ok) {
    //   console.error('Dashboard load error:', await res.text());
    //   return;
    // }
    // const data = await res.json();

	const { data } = await privateClient.get(
      '/api/dashboard',
      { params: { topSellingDuration, salesReportDuration } }
    );

    stocks = [
      { amount: data.totalStocks,  label: 'Total Stocks',   color:'#AECABD'},
      { amount: data.totalSold,    label: 'Total Sold',		color:'#AEDFF7'},
      { amount: data.totalPending, label: 'Total Pending', 	color:'#FFFFFF'}
    ];

    products = [
      {
        label: 'out-of-stock',
        mssg:  'Out of stock',
        amount: String(data.outOfStockProducts.amount),
        capital: data.outOfStockProducts.capital.toFixed(2),
        color: '#DE0101',
		lightcolor: '#F4C0C0'
      },
      {
        label: 'low-stock',
        mssg:  'Low stock',
        amount: String(data.lowStockProducts.amount),
        capital: data.lowStockProducts.capital.toFixed(2),
        color: '#FFDE59',
		lightcolor: '#F7D6A5'
      }
    ];

    items = data.topSellingProducts.map(p => ({
      name: p.productName,
	  link: p.pathName || null,
      qty:  p.totalQty
    }));

	salesPerMonth = data.salesPerMonth;
    avgSalesPerMonth = data.avgSalesPerMonth;
	totalSalesInTheLastTimePeriod = data.totalSalesInTheLastTimePeriod;
  }

	function initChart() {
		//destroy old chart so we don’t double‐draw
		if (monthlySalesChart) monthlySalesChart.destroy();

		const labels = salesPerMonth.map(
		r => `${r.year}-${String(r.month).padStart(2,'0')}`
		);
		const values = salesPerMonth.map(r => r.sum);

		monthlySalesChart = new Chart(chartCanvas, {
		type: 'bar',
		data: {
			labels,
			datasets: [{
			label: 'Sales per Month',
			data: values,
			// @UI, please add styling here for the chart
			}]
		},
		options: {
			scales: {
			y: { beginAtZero: true }
			}
		}
		});
	}

	onMount(async () => {
		await fetchDashboard();
		if (salesPerMonth.length) initChart();
	});

	async function handleClick(buttonId: string) {
		selectedButton = buttonId;
		//fixes bug where user has to click on the duration button twice before the correct chart is displayed
		// only fire when the user presses one of the three buttons
		// wait for salesReportDuration = buttonDurationMap[selectedButton] to actually update
		await tick();
		await fetchDashboard();
		if (salesPerMonth.length) initChart();
	}
</script>

<header class="p-7 fixed gray1 pr-70" style="width: 100%; z-index: 10;">
	<h1>Dashboard</h1>
</header>

<div id="bg_faded" class = "pt-20">
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
						<div 
							id={stock.label} 
							class="flex items-center gap-1 px-2 rounded-full"
							style="background-color: {stock.color}"
						>
						<p class="text-center">{stock.label}</p></div>
					</div>
				{/each}
			</div>
		</div>

		<!-- stock alerts -->
		<div class="flex gap-7 p-7">
			{#each products as product, index}
				<div class="whitebox flex-col content-center">
					<div 
						id={product.label} 
						class="flex items-center gap-1 px-2 rounded-full"
						style="
							background-color: {product.lightcolor}"
					>
						<div class="circle" style="background-color: {product.color}"></div>
						<p>{product.mssg}</p>
					</div>

					<div class="p-.5 flex items-end">
						<h1 class="header self-end">{product.amount}</h1>
						<p class="pb-2">&nbspproducts</p>
					</div>

					<div class="flex items-center text-left">
						<p class={`text-sm ${product.capital > 999999 ? 'w-32 truncate' : ''}`}>Estimated capital needed:</p>
						<p class="font-bold ml-1">
							{new Intl.NumberFormat('en-PH', {
								style: 'currency',
								currency: 'PHP',
								minimumFractionDigits: 2,
							}).format(product.capital)}
						</p>
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
					<img src={item.link || 'https://png.pngtree.com/png-vector/20221125/ourmid/pngtree-no-image-available-icon-flatvector-illustration-picture-coming-creative-vector-png-image_40968940.jpg'} alt={item.name} />
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
					class="buttons {selectedButton === '12months' ? 'selected' : ''}"
					onclick={() => handleClick('12months')}
				>
					12 months
				</button>

				<button
					class="buttons {selectedButton === '6months' ? 'selected' : ''}"
					onclick={() => handleClick('6months')}
				>
					6 months
				</button>

				<button
					class="buttons {selectedButton === '30days' ? 'selected' : ''}"
					onclick={() => handleClick('30days')}
				>
					30 days
				</button>
			</div>
		</div>
		<div>
			<br>
			<p class="text-sm">Total Sales in the last {selectedButton}: </p>
			<h1 class="header">
				{new Intl.NumberFormat('en-PH', {
					style: 'currency',
					currency: 'PHP',
					minimumFractionDigits: 2,
				}).format(totalSalesInTheLastTimePeriod)}
		 	</h1>
			<br>
			<p class="text-sm">Average Sales per Month</p>
			<h1 class="header">
				{new Intl.NumberFormat('en-PH', {
					style: 'currency',
					currency: 'PHP',
					minimumFractionDigits: 2,
				}).format(avgSalesPerMonth)}
			</h1>
		</div>
		<div>
			<div class="p-7">
				<h2 class="text-base font-bold">Sales per Month</h2>
				<canvas bind:this={chartCanvas}></canvas>
			</div>
		</div>
	</div>
</div>
