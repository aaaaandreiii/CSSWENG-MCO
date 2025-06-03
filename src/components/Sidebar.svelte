<script>
    let tabs = [
        {name: "Dashboard", link: "/dashboard"},
        {name: "Inventory", link: "/inventory"},
        {name: "Analytics", link: "/analytics"},
    ];
</script>


<div>
    <div class = "green1 rounded-lg">
        {#each tabs as tab, index}
            <a href = {tab.link}>
                <p>{tab.name}</p>
            </a>
        {/each}
    </div>

</div>
