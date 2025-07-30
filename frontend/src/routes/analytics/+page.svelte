<script lang="ts">
    import { PUBLIC_API_BASE_URL } from '$env/static/public';
    import { items } from '$lib/index.js';
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import Chart from 'chart.js/auto';
    import StockDetail from '$lib/StockDetail.svelte';

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

    // pagination
    
// stock status table
    let didScroll = false;
    let page = 1;
    const itemsPerPage = 50;
    $: totalPages = Math.ceil(alertItems.length / itemsPerPage);
    $: paginatedItems = alertItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    let tableRef: HTMLDivElement | null = null; //go back to top when prev page
    $: if (tableRef && typeof page === 'number' && didScroll) {
    scrollTableToTop();
    }

    function onPageChange(newPage: number) {
    page = newPage;
    didScroll = true;
    }

    function scrollTableToTop() {
        setTimeout(() => {
            tableRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
    }


// overstock table

    let overPage = 1;
    $: overTotalPages = Math.ceil(overstockItems.length / itemsPerPage);
    $: paginatedOverstock = overstockItems.slice((overPage - 1) * itemsPerPage, overPage * itemsPerPage);
    
    let tableRefOver: HTMLDivElement | null = null; //go back to top when next page
    let didScrollOver = false;

    function onOverPageChange(newPage: number) {
    overPage = newPage;
    didScrollOver = true;
    }

    $: if (tableRefOver && typeof overPage === 'number' && didScrollOver) {
    scrollOverTableToTop();
    }

    function scrollOverTableToTop() {
        setTimeout(() => {
            tableRefOver?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
    }


//low stock table
    let lowPage = 1;
    $: lowTotalPages = Math.ceil(lowStockAlerts.length / itemsPerPage);
    $: paginatedLowStock = lowStockAlerts.slice((lowPage - 1) * itemsPerPage, lowPage * itemsPerPage);

    let lowStockTableRef: HTMLDivElement | null = null; //scroll to top
    let didScrollLow = false;

    function onLowPageChange(newPage: number) {
    lowPage = newPage;
    didScrollLow = true;
    }

    $: if (lowStockTableRef && typeof lowPage === 'number' && didScrollLow) {
    scrollLowTableToTop();
    }

    function scrollLowTableToTop() {
        setTimeout(() => {
            lowStockTableRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
    }



    let currentMonetaryValue = 0;
    let totalItemsInStock    = 0;
    let lowStockAlerts:      Array<{productId:number; productName:string; stockOnHand:number}> = [];
    let outOfStockItems:     Array<{productId:number; productName:string}> = [];
    let overstockItems:      Array<{productId:number; productName:string; stockOnHand:number}> = [];
    $: alertItems = statusItems.filter(item => item.status !== 'ok');   // only show items that are not 'ok'


    let infos: Array<{value:string; label:string; color:string}> = [];

    let chartEl:    HTMLCanvasElement;
    let chart:      Chart | null = null;

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
        // page default = 1
        page = 1;
        overPage = 1;
        lowPage = 1; 


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
    // async function loadData() {
    //     if (!filterStart || !filterEnd) return;

    //     const url = new URL(`${PUBLIC_API_BASE_URL}/api/dataAnalysisController`);
    //     url.searchParams.set('startDate', filterStart);
    //     url.searchParams.set('endDate',   filterEnd);

    //     const res = await fetch(url.toString());
    //     const payload = await res.json();

    //     // your existing assignments:
    //     turnoverData         = payload.top10;
    //     currentMonetaryValue = payload.currentMonetaryValue;
    //     // …

    //     if (Array.isArray(payload.allProducts)) {
    //         statusItems = payload.allProducts.map((p: any) => ({
    //             productId:      p.productId,
    //             productName:    p.productName,
    //             category:       p.category,
    //             supplier:       p.supplier,
    //             units:          p.units,
    //             stockOnHand:    p.stockOnHand,
    //             safeStockCount: p.safeStockCount,
    //             avgDailySales:  p.avgDailySales,
    //             daysCover:      p.daysCover,
    //             reorderQty:     p.reorderQty,
    //             status: p.stockOnHand === 0
    //                     ? 'out'
    //                     : p.stockOnHand <= lowThreshold
    //                     ? 'low'
    //                     : p.stockOnHand >= overThreshold
    //                         ? 'over'
    //                         : 'ok'
    //         }));

    //     }
    // }

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

    // onMount(async () => {
    //     if (!browser) return;

    //     const today = new Date();
    //     const prior = new Date(today);
    //     prior.setDate(prior.getDate() - 30);

    //     filterStart = prior.toISOString().slice(0,10);
    //     filterEnd   = today.toISOString().slice(0,10);
    //     await loadData();

    //     document.addEventListener('mousedown', handleClickOutside);

    //     // 1) fetch the object { allProducts, top10 }
    //     const res = await fetch(`${PUBLIC_API_BASE_URL}/api/dataAnalysisController`);
    //     const payload = await res.json();               // payload = { allProducts: [...], top10: [...] }

    //     // 2) pick the list you actually want to show
    //     turnoverData = payload.top10;                    // ← assign into the outer var

    //     currentMonetaryValue = payload.currentMonetaryValue;
    //     totalItemsInStock    = payload.totalItemsInStock;
    //     lowStockAlerts       = payload.lowStockAlerts;
    //     outOfStockItems      = payload.outOfStockItems;
    //     overstockItems       = payload.overstockItems;

    //     infos = [
    //         {
    //             value: formatCurrency(currentMonetaryValue),
    //             label: 'Stock Value',
    //             color: '#AECABD'
    //         },
    //         {
    //             value: totalItemsInStock.toLocaleString(),
    //             label: 'Total Units',
    //             color: '#AEDFF7'
    //         },
    //         {
    //             value: lowStockAlerts.length.toString(),
    //             label: 'Low-Stock',
    //             color: '#F4C0C0'
    //         },
    //         {
    //             value: outOfStockItems.length.toString(),
    //             label: 'Out-of-Stock',
    //             color: '#F7D6A5'
    //         },
    //         {
    //             value: overstockItems.length.toString(),
    //             label: 'Overstock',
    //             color: '#C8E6C9'
    //         }
    //     ];

    //     // 3) now build your chart off of turnoverData
    //     const labels = turnoverData.map(d => d.productName);
    //     const data   = turnoverData.map(d => +d.turnoverRate.toFixed(2));

    //     chart = new Chart(chartEl, {
    //         type: 'bar',
    //         data: {
    //             labels,
    //             datasets: [{ label: 'Inventory Turnover Rate', data }]
    //         },
    //         options: {
    //             responsive: true,
    //             scales: {
    //                 x: { ticks: { autoSkip: false } },
    //                 y: { beginAtZero: true }
    //             }
    //         }
    //     });
    // });

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
    let orderBy = 'Order by';


    let isChosenB = false; // for annual statistics
    // true = last, false = custom date range

    function setOrder(order: string) {
        orderBy = order;
        orderDropdownOpen = false;
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
</script>

<header class="p-7 fixed gray1 flex justify-between pr-70" style="width: 100%; z-index: 10;">
    <h1>Analytics</h1>
    <nav class="flex gap-4 text-sm align-end pt-1">
        <a href="#item-sales" class="hover:underline font-semibold text-black">Item Sales</a>
        <a href="#stock-status" class="hover:underline font-semibold text-black">Stock Status</a>
        <a href="#turnover" class="hover:underline font-semibold text-black">Turnover</a>
        <a href="#out-of-stock" class="hover:underline font-semibold text-black">Out-of-Stock</a>
        <a href="#low-stock" class="hover:underline font-semibold text-black">Low Stock</a>
        <a href="#overstock" class="hover:underline font-semibold text-black">Overstock</a>
    </nav>
</header>

<!-- colorful thing -->
<div class="flex justify-evenly gap-4 px-7 pt-20">
  {#each infos as info}
    <div
      class="whitebox flex-col content-center p-6 rounded shadow"
      style="background-color: {info.color}"
    >
      <h1 class="text-2xl font-bold">{info.value}</h1>
      <p class="text-sm text-gray-700">{info.label}</p>
    </div>
  {/each}
</div>

<!-- item sales -->
<div class = "w-full p-5">
    <div class = " h-auto rounded-lg bg-white p-5">
        <div class = "flex-col items-center gap-5">

            <!-- title header -->
            <div class = "flex justify-between items-start scroll-mt-24" id="item-sales">
                <!-- first part -->
                <div class="flex items-center gap-5 pb-1 m-2 mb-5">
                    <h1 class="flex text-start text-base font-bold">Item Sales</h1>

                    <div class="search flex px-3">
                        <input type="text" placeholder="Search" class="w-35 flex items-center justify-between px-2 py-1 text-sm" />
                        <img src="../src/icons/search.svg" alt="search" style="width:15px; " />
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
            <div bind:this={scrollRef} 
            class="flex overflow-x-auto whitespace-nowrap scroll-smooth px-4 pb-3 space-x-4">
                            {#each items as item}
                                <div class="shrink-0 w-40">
                                    <div class="pb-2 pl-6 relative">
                                        <div class="tag absolute overflow-visible px-3">
                                            <div class="text-sm self-center">{item.sold} sold</div>
                                        </div>
                                    </div>
                                    <img src={item.link} alt={item.name} class="w-30" />
                                    <p class="text-center text-sm">{item.name}</p>
                                </div>
                            {/each}
                </div>


            <!-- scroll buttons -->
            <button on:click={scrollNext}
                class="absolute right-0 top-1/2 -translate-y-1/2 gray1 p-2 rounded-full shadow">
            <img src="../src/icons/arrow-right.svg" class="w-7" alt="right" />
            </button>

            <button on:click={scrollPrev}
                class="absolute left-0 top-1/2 -translate-y-1/2 gray1 p-2 rounded-full shadow">
            <img src="../src/icons/arrow-right.svg" class="w-7 rotate-[180deg]" alt="left" />
            </button>
            </div>



        </div>
    </div>
</div>

<!-- ANNUAL STATISTICS -->
<div class="w-full p-5">
  <div class="bg-white rounded-lg p-8">
    <!-- <div class="flex justify-between mb-4"> -->
      <h1 class="text-base font-bold">Annual Statistics</h1>
      <div class="flex items-center gap-4 px-5 py-2 border rounded-xl bg-white">
        <button
          id="annual-dropdown-trigger"
          on:click={handleDropdownClickAnnual}
          aria-haspopup="true"
          aria-expanded={dropdownOpenAnnual}
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full hover:bg-gray-50"
        >
          <span class="font-medium">Last </span>
          <span class="font-semibold">{selectedRangeAnnual}</span>
          <svg class="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06 0L10 10.92l3.72-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 010-1.06z"
            />
          </svg>
        </button>
        {#if dropdownOpenAnnual}
          <div class="absolute z-10 mt-2 w-36 bg-white rounded-md shadow-lg ring-1 ring-black/5">
            {#each rangesAnnual as r}
              <button class="block w-full px-4 py-2 text-sm hover:bg-gray-100"
                      on:click={() => selectRangeAnnual(r)}
              >{r}</button>
            {/each}
          </div>
        {/if}

        <button
          class="px-3 py-1 rounded-full font-medium"
          class:bg-blue-50={annualMode==='custom'}
          on:click={switchToCustomAnnual}
        >Custom</button>

        {#if annualMode === 'custom'}
          <div class="flex items-center gap-2">
            <p>From</p>
            <input
              type="number"
              bind:value={annualStart}
              min="1900"
              max={new Date().getFullYear()}
              placeholder="YYYY"
              on:change={() => {
                filterStart = `${annualStart}-01-01`;
                loadData();
              }}
              class="border rounded px-3 py-1.5 text-sm"
            />
            <p class="px-2">to</p>
            <input
              type="number"
              bind:value={annualEnd}
              min={annualStart || 1900}
              max={new Date().getFullYear()}
              placeholder="YYYY"
              on:change={() => {
                filterEnd = `${annualEnd}-12-31`;
                loadData();
              }}
              class="border rounded px-3 py-1.5 text-sm"
            />
            {#if annualEndDateInvalid}
              <div class="text-red-600 text-xs mt-1">
                End year cannot be before start year.
              </div>
            {/if}
          </div>
        {/if}
      </div>

        <div>
            <div bind:this={tableRef}>
            <section class="p-5 bg-white rounded-lg shadow mb-6 scroll-mt-24" id="stock-status">
                <h2 class="text-lg font-semibold mb-2">Stock Status</h2>
                <div class="flex gap-4 mb-4">
                    <label>Low-Stock @ ≤
                    <input type="number" bind:value={lowThreshold} on:change={loadData}/>
                    </label>
                    <label>Overstock @ ≥
                    <input type="number" bind:value={overThreshold} on:change={loadData}/>
                    </label>
                </div>

                <!-- Stock status table container -->
                    <table class="min-w-full table-auto border">
                        <thead>
                        <tr class="bg-gray-100">
                            <th class="px-3 py-2 border">Product</th>
                            <th class="px-3 py-2 border">Cat.</th>
                            <th class="px-3 py-2 border text-center">On Hand</th>
                            <th class="px-3 py-2 border text-center">Safe Cnt</th>
                            <th class="px-3 py-2 border text-center">Days Cover</th>
                            <th class="px-3 py-2 border text-center">Reorder Qty</th>
                            <th class="px-3 py-2 border">Supplier</th>
                            <th class="px-3 py-2 border">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                            {#each paginatedItems as item}
                                <tr
                                class="hover:bg-gray-50 cursor-pointer"
                                class:critical={item.status==='out'}
                                class:warning={item.status==='low'}
                                class:overstock={item.status==='over'}
                                on:click={() => toggle(item.productId)}
                                >
                                <td class="px-3 py-2 border">{item.productName}</td>
                                <td class="px-3 py-2 border">{item.category}</td>
                                <td class="px-3 py-2 border text-center">{item.stockOnHand}</td>
                                <td class="px-3 py-2 border text-center">{item.safeStockCount}</td>
                                <td class="px-3 py-2 border text-center">{item.daysCover}</td>
                                <td class="px-3 py-2 border text-center">{item.reorderQty}</td>
                                <td class="px-3 py-2 border">{item.supplier}</td>
                                <td class="px-3 py-2 border">
                                    {#if item.status==='out'}<span>🔴 Out</span>
                                    {:else if item.status==='low'}<span>🟠 Low</span>
                                    {:else if item.status==='over'}<span>🔵 Over</span>
                                    {/if}
                                </td>
                                </tr>

                                {#if expanded.has(item.productId)}
                                <tr class="bg-gray-50">
                                    <td colspan="9" class="px-4 py-3">
                                    <StockDetail {item}/>
                                    </td>
                                </tr>
                                {/if}
                            {/each}

                            {#if alertItems.length === 0}
                                <tr>
                                <td colspan="9" class="py-4 text-center text-gray-500">
                                    No stock alerts—everything is OK!
                                </td>
                                </tr>
                            {/if}
                            </tbody>
                    </table>
                
                <!-- prev page -->
                {#if totalPages > 1}
                <div class="flex items-center gap-2 justify-end mt-4">
                    <button on:click={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition">Prev</button>
                    <span>{page} / {totalPages}</span>
                    <!-- default page = 1 -->
                    <input
                        type="number"
                        min="1"
                        max={totalPages}
                        bind:value={page} 
                        class="border px-2 py-1 w-16 text-center rounded"
                        on:change={() => { if (!page || page < 1) page = 1; 
                            else if (page > totalPages) page = totalPages;
                        }}
                    />

                    <button on:click={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition">Next</button>
                </div>
                {/if}

                <style>
                    .critical  { background-color: #F8D7DA; }
                    .warning   { background-color: #FFF3CD; }
                    .overstock { background-color: #D1ECF1; }
                </style>
            </section>
        </div>
        
        <!-- graph + bullet -->
        <div>
            <h2 class = "text-lg font-semibold mb-2">Top 10 Products by Inventory Turnover</h2>
            <!-- <section class="mt-8 overflow-auto"> -->
            <section class="p-5 bg-white rounded-lg shadow mb-6 scroll-mt-24" id="turnover"> 
                <div  class = "flex pb-10">
                    <div style ="width: 80%; padding-right: 20px;">
                        <h3 class="text-lg font-semibold mb-4">COGS &amp; Turnover by Product</h3>
                        <table class="min-w-full bg-white border">
                            <thead>
                            <tr class="bg-gray-100">
                                <th class="px-4 py-2 border">Product</th>
                                <th class="px-4 py-2 border text-right">Total COGS</th>
                                <th class="px-4 py-2 border text-right">Turnover Rate</th>
                            </tr>
                            </thead>
                            <tbody>
                            {#each turnoverData as { productName, total_cogs, turnoverRate }}
                                <tr class="hover:bg-gray-50">
                                <td class="px-4 py-2 border">{productName}</td>
                                <td class="px-4 py-2 border text-right">
                                    PHP{(total_cogs.toLocaleString(undefined, { minimumFractionDigits: 2 }))}
                                </td>
                                <td class="px-4 py-2 border text-right">
                                    {turnoverRate.toFixed(2)}%
                                </td>
                                </tr>
                            {/each}
                            </tbody>
                        </table>
                    </div>

                    <!-- bullet list -->
                    <section class="p-5 bg-white rounded-lg shadow mb-6 scroll-mt-24" id="out-of-stock">
                        <h2 class="text-lg font-semibold mb-2">Out-of-Stock Items</h2>
                        {#if outOfStockItems.length === 0}
                            <p class="text-gray-500">None—everything is in stock.</p>
                        {:else}
                            <ul class="list-disc pl-5">
                            {#each outOfStockItems as { productName }}
                                <li>{productName}</li>
                            {/each}
                            </ul>
                        {/if}
                    </section>
                </div>
                <canvas bind:this={chartEl}></canvas>
            </section>
        </div>

        <!-- first part of div -->
        <div bind:this={lowStockTableRef} bind:this={tableRefOver} class = "flex">
            <section class="p-5 bg-white rounded-lg shadow mb-6 scroll-mt-24" style="width:50%" id="low-stock">
                <h2 class="text-lg font-semibold mb-2">Low-Stock Alerts</h2>
                {#if lowStockAlerts.length === 0}
                    <p class="text-gray-500">All good—no low-stock items.</p>
                {:else}
                    <table class="w-full table-auto border">
                    <thead>
                        <tr class="bg-gray-100">
                        <th class="px-4 py-2 border">Product</th>
                        <th class="px-4 py-2 border">On Hand</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each paginatedLowStock  as { productName, stockOnHand }}
                        <tr class="hover:bg-gray-50">
                            <td class="px-4 py-2 border">{productName}</td>
                            <td class="px-4 py-2 border text-center">{stockOnHand}</td>
                        </tr>
                        {/each}
                    </tbody>
                    </table>
                    {#if lowTotalPages > 1}
                        <div class="flex items-center gap-2 justify-end mt-4">
                            <button
                            on:click={() => onLowPageChange(Math.max(1, lowPage - 1))}
                            disabled={lowPage === 1}
                            class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition"
                            >Prev</button>

                            <span>{lowPage} / {lowTotalPages}</span>

                            <input
                                type="number"
                                min="1"
                                max={lowTotalPages}
                                bind:value={lowPage}
                                class="border px-2 py-1 w-16 text-center rounded"
                                on:change={() => {
                                    if (!lowPage || lowPage < 1) lowPage = 1;
                                    else if (lowPage > lowTotalPages) lowPage = lowTotalPages;
                                }}

                            />
                            <button
                                on:click={() => onLowPageChange(Math.min(lowTotalPages, lowPage + 1))}
                                disabled={lowPage === lowTotalPages}
                                class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition"
                            >Next</button>
                        </div>
                    {/if}

                {/if}
            </section>

            <section class="p-5 bg-white rounded-lg shadow mb-6 scroll-mt-24" style="width:50%" id="over-status">
                <h2 class="text-lg font-semibold mb-2">Overstock Items</h2>
                {#if overstockItems.length === 0}
                    <p class="text-gray-500">No overstocked SKUs.</p>
                {:else}

                    <table class="w-full table-auto border">
                        <thead>
                            <tr class="bg-gray-100">
                            <th class="px-4 py-2 border">Product</th>
                            <th class="px-4 py-2 border">On Hand</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each paginatedOverstock as { productName, stockOnHand }}
                                <tr class="hover:bg-gray-50">
                                    <td class="px-4 py-2 border">{productName}</td>
                                    <td class="px-4 py-2 border text-center">{stockOnHand}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                
                    <!-- over page next page  -->
                    {#if overTotalPages > 1}
                        <div class="flex items-center gap-2 justify-end mt-4">
                            <button on:click={() => onOverPageChange(Math.max(1, overPage - 1))} disabled={overPage === 1} class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition">Prev</button>
                            <span>{overPage} / {overTotalPages}</span>
                            <!-- reset to page 1 -->
                            <input
                                type="number"
                                min="1"
                                max={overTotalPages}
                                bind:value={overPage}
                                class="border px-2 py-1 w-16 text-center rounded"
                                on:change={() => { if (!overPage || overPage < 1) overPage = 1; 
                                    else if(overPage > overTotalPages) overPage = overTotalPages;
                                }}
                            />
                            <button on:click={() => onOverPageChange(Math.min(overTotalPages, overPage + 1))} disabled={overPage === overTotalPages} class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition">Next</button>
                        </div>
                    {/if}
                {/if}
            </section>



            <!-- 2 tables v -->
            </div> 
        </div>
    </div>
</div>

