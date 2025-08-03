<script lang="ts">
	import { tick, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
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

	// --- AUTH & URL ---
	let token: string | null = null;
	if (browser) {
		token = localStorage.getItem('token');
	}

  // --- FETCHING ---
  async function fetchDashboard() {
    const res = await fetch(
      `${PUBLIC_API_BASE_URL}/api/dashboard?topSellingDuration=${topSellingDuration}`
      + `&salesReportDuration=${salesReportDuration}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );

    if (!res.ok) {
      console.error('Dashboard load error:', await res.text());
      return;
    }
    const data = await res.json();

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

	
	//stocks: 28123 -> 28.1k
	function formatStockAmount(num: number): string {
		if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
		if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
		return String(num);
	}

</script>

<header class="flex justify-between p-7 fixed gray1 pr-70" style="width: 100%; z-index: 10;">
	<h1>Dashboard</h1>
</header>

<div id="bg_faded" class = "pt-22 max-w-full">
	<div class="flex flex-wrap gap-6 p-6 justify-evenly items-center w-full">
		<!-- sales summary -->
		<div class="flex flex-col flex-wrap min-w-[300px]">
			<div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
				<h1 class="text-xl font-bold">Sales Summary</h1>
			</div>
			<div class="flex flex-wrap gap-7 pt-7 ">
				{#each stocks as stock, index}
					<div class="stock flex-col content-center">
						<h1 class="header">{formatStockAmount(stock.amount)}</h1>
						<div 	
							id={stock.label} 
							class=" flex items-center gap-1 px-2 rounded-full gray2_txt text-sm"
							
						>
						<p class="text-center">{stock.label}</p></div>
					</div>
				{/each}
			</div>
		</div>

		<!-- stock alerts -->
		<div class="flex gap-7 p-7 min-w-[300px] flex-wrap">
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
					<a href="/inventory">
						<p id = "checkinv" class="text-s pt-4 font-bold">Check Inventory</p>
					</a>
				</div>
			{/each}
		</div>
	</div>
</div>

<!-- top selling -->
<div class="flex justify-evenly pt-7">
	<div id="report">
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
		<div class="w-full overflow-hidden">
			<div id="topimg" class="grid grid-cols justify-items-center gap-5 grid-cols-[repeat(auto-fit,minmax(160px,1fr))] max-w-full">
				{#each items as item}
					<div class="flex flex-col items-center gap-2 min-w-0">
						<!-- can add href to link in inventory -->
						<img src={item.link || 'https://png.pngtree.com/png-vector/20221125/ourmid/pngtree-no-image-available-icon-flatvector-illustration-picture-coming-creative-vector-png-image_40968940.jpg'} alt={item.name} />
						<p class="text-center text-sm">{item.name}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- sales report -->
	<div id="report" class="max-w-full w-full">
		<div class="flex flex-col">
			<h1 class="text-start text-base font-bold">Sales Report</h1>
			
			<div class="flex flex-wrap items-center justify-start">
				<button
					class="buttons {selectedButton === '12months' ? 'selected' : 'hover'}"
					onclick={() => handleClick('12months')}
				>
					12 months
				</button>

				<button
					class="buttons {selectedButton === '6months' ? 'selected' : 'hover'}"
					onclick={() => handleClick('6months')}
				>
					6 months
				</button>

				<button
					class="buttons {selectedButton === '30days' ? 'selected' : 'hover'}"
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
