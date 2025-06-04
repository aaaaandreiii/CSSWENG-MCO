<script>

    let stocks = [
        { amount: '50K', label: 'Total stocks'},
        { amount: '10', label: 'Total sold' },
        { amount: '79k', label: 'Total Pending' },
    ];

    let products = [
        {amount: '14', capital: '12782.14'},
        {amount: '5', capital: '10000.00'},
    ]
</script>
<header class = "p-8">
    <h1>Dashboard from /dashboard</h1>
</header>

<div id = "bg_faded">

    <div class = "flex">
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


        <div class = "flex gap-7 p-7"> 
            {#each products as product, index}
            <div class = " flex-col content-center" style= "width: 300px">
                <div class = "flex items-end">
                    <h1 class = "header">{product.amount}</h1>
                    <p> products</p>
                </div>

                <div class = "flex text-left">
                    <p>Estimated capital needed: </p>
                    <p class = "text-start font-bold"> &nbsp P{product.capital}</p>
                </div>
                <a href = '/inventory'><p class = "font-bold text-lg">Check Inventory</p></a>
            </div>
            {/each} 
        </div>
    </div>
</div>

