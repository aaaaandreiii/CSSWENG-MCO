<script lang="ts">

    let stocks = [
        { amount: '50K', label: 'Total stocks'},
        { amount: '10', label: 'Total sold' },
        { amount: '79k', label: 'Total Pending' },
    ];

    let products = [
        {label: 'nostock', mssg:'Out of stock', amount: '14', capital: '12782.14', color: '#DE0101'},
        {label: 'lowstock', mssg: 'Low stock', amount: '5', capital: '10000.00', color: '#FFDE59'},
    ];

    import { items } from '$lib/index.js';

    let selectedButton = '12 months'; // Track which button is selected
    
    function handleClick(buttonId: string) {
        selectedButton = buttonId;
    }

</script>
<header class = "p-7">
    <h1>Dashboard</h1>
</header>

<div id = "bg_faded">

    <div class = "flex justify-evenly">
        <!-- sales summary -->
        <div class = "flex-col" >
            <div class = "pl-7 pt-7">
                <h1 class = "font-bold text-xl">Sales Summary</h1>
            </div>
            <div class = "flex gap-7 p-7"> 
                {#each stocks as stock, index}
                <div class = "stock flex-col content-center">
                    <h1 class = "header">{stock.amount}</h1>
                    <p class = "text-center">{stock.label}</p>
                </div>
                {/each} 
            </div>
        </div>

        <!-- stock alerts -->
        <div class = "flex gap-7 p-7"> 
            {#each products as product, index}
            <div class = "whitebox flex-col content-center">
                <div id = "{product.label}" class ="gap-1 px-2 items-center flex">
                    <div class = "circle" style = "background-color: {product.color}"></div>
                    <p>{product.mssg}</p>
                </div>

                <div class = "flex items-end p-.5">
                    <h1 class = "header self-end">{product.amount}</h1>
                    <p class = "pb-2">&nbspproducts</p>
                </div>

                <div class = "flex text-left items-center">
                    <p class = "text-sm">Estimated capital needed: </p>
                    <p class = "text-start font-bold"> &nbspP{product.capital}</p>
                </div>
                <a href = '/inventory'><p class = "font-bold text-s pt-4" style = "color: #1E8570">Check Inventory</p></a>
            </div>
            {/each} 
        </div>
    </div>
</div>

<!-- top selling -->
<div class ="flex justify-evenly pt-7">
    <div id = "report" class = "">
        <div>
            <h1 class = "font-bold text-base">Top-selling products</h1>
            <div class = "flex items-center gap-1 p-3">
                <p>Last&nbsp</p>
                <div class="relative inline-block text-left">
                    <div>
                        <button type="button" class="inline-flex w-full justify-center gap-x-1.3 rounded-3xl bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50" id="menu-button" aria-expanded="true" aria-haspopup="true">
                        10 days
                        <svg class="-mr-1 size-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                            <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                        </svg>
                        </button>
                    </div>
                    <!-- dropdown -->
                    <div class="absolute z-10 mt-2 w-30 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
                        <div class="py-1" role="none">
                            <!-- Active: "bg-gray-100 text-gray-900 outline-hidden", Not Active: "text-gray-700" -->
                            <a href="/dashboard" class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="menu-item-0">10 days</a>
                            <a href="/dashboard" class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="menu-item-1">1 month</a>
                            <a href="/dashboard" class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="menu-item-2">1 year</a>
                        </div>
                    </div>

                </div>        
            </div>
        </div>
        <div id = "topimg" class = "grid grid-cols-2 gap-5 justify-items-center">
            {#each items as item}
                <div>
<!-- can add href to link in inventory -->
                    <img src = {item.link} alt = {item.name}/>
                    <p class = "text-center text-sm">{item.name}</p>
                </div>
            {/each}
        </div>
    </div>

<!-- sales report -->
    <div id = "report" style = "width: 50%">
        <div class = "flex gap-5 items-center">
            <h1 class = "font-bold text-base text-start">Sales Report</h1>
            <div class = "flex">
                <button 
                class="button {selectedButton === '12months' ? 'pressed' : ''}"
                onclick={() => handleClick('12months')}>
                12 months
                </button>

                <button 
                class="button {selectedButton === '6months' ? 'pressed' : ''}"
                onclick={() => handleClick('6months')}>
                6 months
                </button>

                <button 
                class="button {selectedButton === '30days' ? 'pressed' : ''}"
                onclick={() => handleClick('30days')}>
                30 days
                </button>
            </div>
        </div>
        <div>
            <p class = "text-sm">Avg per month</p>
            <h1 class = "header">P 12,123</h1>
        </div>
        <div>
            <!-- graph -->
        </div>
    </div>
</div>