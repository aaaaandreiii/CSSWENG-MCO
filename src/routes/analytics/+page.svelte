<script>
	import { items } from '$lib/index.js';

	let infos = [
		{ value: '50293', label: 'Sales', color: '#AECABD' },
		{ value: '50293', label: 'Sales', color: '#AECABD' },
		{ value: '50293', label: 'Sales', color: '#AECABD' },
		{ value: '50293', label: 'Sales', color: '#EAAEAE' }
	];

    /**
	 * @type {HTMLDivElement | null}
	 */
    let scrollRef = null;

    function scrollNext() {
        if (scrollRef) {
        scrollRef.scrollBy({ left: 1200, behavior: 'smooth' });
        }
    }
    
    function scrollPrev() {
        scrollRef?.scrollBy({ left: -1200, behavior: 'smooth' });
    } 

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

<!-- Item sales box -->
<div class = "w-full p-5">
    <div class=" h-auto rounded-lg bg-white p-8">
        <div class="flex-col items-center gap-5">
            <div class="flex justify-normal gap-5 pb-1">
                <h1 class="flex text-start text-base font-bold">Item Sales</h1>

                <div class="search flex px-3">
                    <input type="text" placeholder="Search" class="w-35" />
                    <img src="../src/icons/search.svg" alt="search" style="width:15px; " />
                </div>
                <div class="search flex px-3">
                    <input type="text" placeholder="Order by" class="w-18" />
                    <img src="../src/icons/filter.svg" alt="search" style="width:15px; " />
                </div>
            </div>

            <!-- Last __ -->
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

<div class="relative">
  <!-- Scrollable Container -->
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


  <!-- Scroll Buttons -->
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

<!-- Annual Statistics -->
<div class = "w-full p-5">
    <div class=" h-auto rounded-lg bg-white p-8">
        <div class="flex-col items-center gap-5">
            <div class="flex justify-normal gap-5 pb-1">
                <h1 class="flex text-start text-base font-bold">Annual Statistics</h1>
            </div>

            <!-- Last __ -->
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
    </div>
</div>