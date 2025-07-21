<script lang="ts">
    import { PUBLIC_API_BASE_URL } from '$env/static/public';

    import { items } from '$lib/index.js';
    import Chart, { type ChartItem } from 'chart.js/auto';

    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';

    let chartEl: HTMLCanvasElement;
    let chart: any;

    let infos = [
        { value: '50293', label: 'Sales', color: '#AECABD' },
        { value: '50293', label: 'Sales', color: '#AECABD' },
        { value: '50293', label: 'Sales', color: '#AECABD' },
        { value: '50293', label: 'Sales', color: '#EAAEAE' }
    ];

    let scrollRef: HTMLDivElement | null = null;

    function scrollNext() {
        if (scrollRef) {
        scrollRef.scrollBy({ left: 1200, behavior: 'smooth' });
        }
    }
    
    function scrollPrev() {
        scrollRef?.scrollBy({ left: -1200, behavior: 'smooth' });
    } 

    // dropdown logic for orderby itemsales
    let dropdownOpenSales = false;
    let selectedRangeSales = '10 days';
    let dropdownRefSales: HTMLDivElement | null = null;
    const rangesSales = ['10 days', '1 month', '1 year'];


    // dropdown logic for orderby annual statistics (years only)
    let dropdownOpenAnnual = false;
    let selectedRangeAnnual = new Date().getFullYear().toString();
    let dropdownRefAnnual: HTMLDivElement | null = null;
    // Only years for annual statistics
    const currentYear = new Date().getFullYear();
    const rangesAnnual = ['10 years', '5 years', '1 year'];

    function handleDropdownClickAnnual() {
        dropdownOpenAnnual = !dropdownOpenAnnual;
        isChosenB = true;
    }

    function selectRangeAnnual(range: string) {
        selectedRangeAnnual = range;
        dropdownOpenAnnual = false;
    }

    // outside click handler for dropdowns
    function handleClickOutside(event: MouseEvent) {
        if (dropdownOpenSales && dropdownRefSales && !dropdownRefSales.contains(event.target as Node)) {
            dropdownOpenSales = false;
        }
        if (dropdownOpenAnnual && dropdownRefAnnual && !dropdownRefAnnual.contains(event.target as Node)) {
            dropdownOpenAnnual = false;
        }
    }

    // gonna comment out this line for my data analysis component
    // onMount(() => {
    //     document.addEventListener('mousedown', handleClickOutside);
    // });

    // onDestroy(() => {
    //     document.removeEventListener('mousedown', handleClickOutside);
    // });

    // dropdown logic for ordering, asc/desc
    let orderDropdownOpen = false;
    let orderBy = 'Order by';
    function setOrder(order: string) {
        orderBy = order;
        orderDropdownOpen = false;
    }
    
    let isChosen = false;
    let isChosenB = false; // for annual statistics
    // true = last, false = custom date range

    // Custom date range validation for item sales
    let customStart = '';
    let customEnd = '';
    $: endDateInvalid = customEnd && customStart && customEnd < customStart;

    // Custom date range validation for annual statistics (years only)
    let annualStart = '';
    let annualEnd = '';
    $: annualEndDateInvalid = annualEnd && annualStart && annualEnd < annualStart;

    function handleDropdownClickSales() {
        dropdownOpenSales = !dropdownOpenSales;
        isChosen = true;
    }


    function selectRangeSales(range: string) {
        selectedRangeSales = range;
        dropdownOpenSales = false;
        isChosen = true;
    }


    // Initialize Chart.js
    let turnoverData: {
        productName: string;
        total_cogs: number;
        turnoverRate: number;
    }[] = [];

    onMount(async () => {
        if (!browser) return; // bail out during SSR

        // now it's safe to touch document
        document.addEventListener('mousedown', handleClickOutside);

        // dynamically load Chart.js
        const { default: Chart } = await import('chart.js/auto');

        // fetch your turnover data
        const res = await fetch(`${PUBLIC_API_BASE_URL}/api/dataAnalysisController`);
        const turnoverData = await res.json();

        const labels = turnoverData.map((d: any) => d.productName);
        const data   = turnoverData.map((d: any) => +d.turnoverRate.toFixed(2));

        chart = new Chart(chartEl, {
        type: 'bar',
        data: {
            labels,
            datasets: [{ label: 'Inventory Turnover Rate', data }]
        },
        options: {
            responsive: true,
            scales: {
            x: { ticks: { autoSkip: false } },
            y: { beginAtZero: true }
            }
        }
        });
    });

    onDestroy(() => {
        if (!browser) return;
        document.removeEventListener('mousedown', handleClickOutside);
        chart?.destroy();
    });

</script>

<header class="p-7">
    <h1>Analytics</h1>
</header>

<div class="flex justify-evenly">
    {#each infos as info}
        <div class="whitebox flex-col content-center" style="background-color: {info.color}">
            <div class="flex-col items-center">
                <h1 class="header">{info.value}</h1>
                <p class="pb-2 text-start">{info.label}</p>
            </div>
        </div>
    {/each}
</div>

<!-- item sales -->
<div class = "w-full p-5">
    <div class=" h-auto rounded-lg bg-white p-5">
        <div class="flex-col items-center gap-5">

            <!-- title header -->
            <div class = "flex justify-between items-start">
                <!-- first part -->
                <div class="flex items-center gap-5 pb-1 m-2 mb-5">
                    <h1 class="flex text-start text-base font-bold">Item Sales</h1>

                    <div class="search flex px-3">
                        <input type="text" placeholder="Search" class="w-35 flex items-center justify-between px-2 py-1 text-sm" />
                        <img src="../src/icons/search.svg" alt="search" style="width:15px; " />
                    </div>
                    <!-- orderby dropdown -->
                    <div class="search flex px-3 relative">
                        <button type="button" class="w-30 flex items-center justify-between order border-gray-300 rounded px-2 py-1 text-sm" onclick={() => orderDropdownOpen = !orderDropdownOpen}>
                            {orderBy}
                            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                        </button>
                        {#if orderDropdownOpen}
                        <div class="absolute z-20 mt-8 w-28 bg-white border border-gray-200 rounded shadow-lg">
                            <button class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onclick={() => setOrder('Ascending')}>Ascending</button>
                            <button class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onclick={() => setOrder('Descending')}>Descending</button>
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
                                onclick={handleDropdownClickSales}>
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
                                        <button type="button" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabindex="-1" onclick={() => selectRangeSales(range)}>{range}</button>
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
                                onfocus={() => isChosen = false}
                            />
                        </div>
                        <p class = "px-2">to</p>
                        <div>
                            <!-- open calendar (to date)-->
                            <input type="date"
                                class="border-gray-300 rounded px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-0 ring-gray-300 ring-inset hover:bg-gray-50 focus:outline-none"
                                bind:value={customEnd}
                                min={customStart || undefined}
                                onfocus={() => isChosen = false}
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
            <button onclick={scrollNext}
                class="absolute right-0 top-1/2 -translate-y-1/2 gray1 p-2 rounded-full shadow">
            <img src="../src/icons/arrow-right.svg" class="w-7" alt="right" />
            </button>

            <button onclick={scrollPrev}
                class="absolute left-0 top-1/2 -translate-y-1/2 gray1 p-2 rounded-full shadow">
            <img src="../src/icons/arrow-right.svg" class="w-7 rotate-[180deg]" alt="left" />
            </button>
            </div>



        </div>
    </div>
</div>

<!-- annual statistics -->
<div class = "w-full p-5">
    <div class=" h-auto rounded-lg bg-white p-8">
        <div class="flex-col items-center gap-5">

            <div class = "flex justify-between items-start">
                <div class="flex justify-normal gap-5 pb-1">
                    <h1 class="flex text-start text-base font-bold">Annual Statistics</h1>
                </div>

                <!--2nd part -->
                <div class= "flex border-1 rounded-xl border-gray-200 gray1"> 
                <!-- Last __ -->
                    <div class = "flex items-center px-5 p-2 rounded-xl {isChosenB ? 'bg-white' : ''}">
                        <p>Last&nbsp</p>
                        <div class="relative inline-block text-left" bind:this={dropdownRefAnnual}>
                            <div>
                                <button type="button" class="inline-flex w-full justify-center gap-x-1.3 rounded-3xl
                                bg-transparent px-3 py-1.5 text-sm font-semibold text-gray-900 
                                ring-0 ring-gray-300 ring-inset hover:bg-gray-50" 
                                id="menu-button-annual" aria-expanded={dropdownOpenAnnual} aria-haspopup="true" 
                                onclick={handleDropdownClickAnnual}>
                                {selectedRangeAnnual}
                                <svg class="-mr-1 size-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                                    <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                </svg>
                                </button>
                            </div>
                            {#if dropdownOpenAnnual}
                            <!-- dropdown -->
                            <div class="absolute z-10 mt-2 w-30 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden" role="menu" aria-orientation="vertical" aria-labelledby="menu-button-annual" tabindex="-1">
                                <div class="py-1" role="none">
                                    {#each rangesAnnual as range}
                                        <button type="button" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabindex="-1" onclick={() => selectRangeAnnual(range)}>{range}</button>
                                    {/each}
                                </div>
                            </div>
                            {/if}
                        </div>        
                    </div>

                    <!-- Custom year range -->
                    <div class = "flex items-center px-5 p-2 rounded-xl {isChosenB ? '' : 'bg-white'}">
                        <p>From&nbsp</p>
                        <div>
                            <input type="number"
                                class="border-gray-300 rounded px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-0 ring-gray-300 ring-inset hover:bg-gray-50 focus:outline-none"
                                bind:value={annualStart}
                                min="1900"
                                max={annualEnd || currentYear}
                                placeholder="YYYY"
                                onfocus={() => isChosenB = false}
                            />
                        </div>
                        <p class = "px-2">to</p>
                        <div>
                            <input type="number"
                                class="border-gray-300 rounded px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-0 ring-gray-300 ring-inset hover:bg-gray-50 focus:outline-none"
                                bind:value={annualEnd}
                                min={annualStart || '1900'}
                                max={currentYear}
                                placeholder="YYYY"
                                onfocus={() => isChosenB = false}
                            />
                        </div>
                    {#if annualEndDateInvalid}
                        <div class="text-red-600 text-xs mt-1">End year cannot be before start year.</div>
                    {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>


<style>
  canvas { max-width: 100%; height: auto; }
</style>

<h2>Top 10 Products by Inventory Turnover (2024–2025)</h2>
<canvas bind:this={chartEl}></canvas>


<canvas bind:this={chartEl}></canvas>

<section class="mt-8 overflow-auto">
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
            ${total_cogs.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </td>
          <td class="px-4 py-2 border text-right">
            {turnoverRate.toFixed(2)}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>