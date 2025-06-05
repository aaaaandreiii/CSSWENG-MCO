<script>
    let selectedButton = 'Stocks'; // Track which button is selected
    
    function handleClick(buttonId) {
        selectedButton = buttonId;
    }
    
    let labels = [
        {name: 'Stocks', file: 'box.svg'},
        {name: 'Completed', file: 'completed.svg'},
        {name: 'Returns', file: 'returns.svg'},
    ];
    let heads = [
        {name: 'Transaction ID'},
        {name: 'Transaction ID'},
        {name: 'Transaction ID'},
        {name: 'Transaction ID'},
        {name: 'Transaction ID'},
        {name: 'Transaction ID'},
        {name: 'Transaction ID'},
    ];
    
</script>

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


<div>
    <div class = "flex">      
        {#each labels as label}
            <button 
            class="{selectedButton === '12months' ? 'pressed' : ''} buttonss justify-items-center"
            onclick={() => handleClick('Stock')}>
            <div class = "text-center flex items-center gap-2">
                <img src = "../src/icons/{label.file}" alt="{label.name}" class = "w-6"/>
                {label.name}
            </div>
            </button>
        {/each}
    </div>

    <div class = "w-full">
        <div class = "flex p-3 h-auto bg-white">
            {#each heads as head}
                <div>{head.name}</div>
            {/each}
        </div>


    </div>




</div>