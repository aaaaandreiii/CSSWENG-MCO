<script lang="ts">
    import { PUBLIC_API_BASE_URL } from '$env/static/public';
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    export let item;

    let chartEl: HTMLCanvasElement;
    let chart: any;

    onMount(async () => {
        const res = await fetch(`${PUBLIC_API_BASE_URL}/api/stockHistory?productId=${item.productId}`);
        const { dates, stockLevels, sales } = await res.json();

        chart = new Chart(chartEl, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
            { label: 'Stock', data: stockLevels, borderDash: [5,5] },
            { label: 'Sales', data: sales, fill: false }
            ]
        },
        options: { responsive:true }
        });
    });
    </script>

    <div class="grid grid-cols-3 gap-4">
    <div>
        <p><strong>Avg Daily Sales:</strong> {item.avgDailySales}</p>
        <p><strong>Days Cover:</strong> {item.daysCover}</p>
        <p><strong>Reorder Qty:</strong> {item.reorderQty}</p>
    </div>
    <div class="col-span-2">
        <canvas bind:this={chartEl}></canvas>
    </div>
    </div>
