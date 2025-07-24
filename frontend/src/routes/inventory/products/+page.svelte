<script lang="ts">
  import { onMount } from 'svelte';
  import { PUBLIC_API_BASE_URL } from '$env/static/public';

  const selected = 'Product';
  let rows: { [key: string]: any }[] = [];
  let isLoading = false;
  let currentOffset = 0;
  let hasMoreData = true;
  const ITEMS_PER_PAGE = 100;

  let sortColumn = '';
  let sortDirection: 'asc' | 'desc' = 'asc';
  let selectedRows: number[] = [];

  const headers = [
    'Product ID',
    'Product Name',
    'Category',
    'Descriptions',
    'Supplier',
    'Cost',
    'Retail Price',
    'Stock On Hand',
    'Units',
    'Image',
    'Safe Stock Count',
    'Restock Flag',
    'Last Edited Date',
    'Last Edited User'
  ];

  onMount(() => fetchProducts());

  async function fetchProducts(offset = 0, append = false) {
    isLoading = true;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${PUBLIC_API_BASE_URL}/api/getProducts?offset=${offset}&limit=${ITEMS_PER_PAGE}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      const newRows = data.products.map((item: any) => ({
        'Product ID': item.productId,
        'Product Name': item.productName,
        'Category': item.category,
        'Descriptions': item.descriptions,
        'Supplier': item.supplier,
        'Cost': item.cost,
        'Retail Price': item.retailPrice,
        'Stock On Hand': item.stockOnHand,
        'Units': item.units,
        'Image': item.pathName,
        'Safe Stock Count': item.safeStockCount,
        'Restock Flag': item.restockFlag,
        'Last Edited Date': new Date(item.lastEditedDate).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
        'Last Edited User': item.lastEditedUserFullName || item.lastEditedUser
      }));
      hasMoreData = newRows.length === ITEMS_PER_PAGE;
      rows = append ? [...rows, ...newRows] : newRows;
    } catch (e) {
      console.error('Fetch failed:', e);
    } finally {
      isLoading = false;
    }
  }

  function sortBy(column: string) {
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      sortDirection = 'asc';
    }
    rows = [...rows].sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
</script>

<h1 class="text-xl font-bold mb-4">Products</h1>
<div class="overflow-x-auto">
  <table class="table-auto w-full">
    <thead>
      <tr>
        {#each headers as head}
          <th class="px-3 py-2 cursor-pointer" on:click={() => sortBy(head)}>
            {head} {sortColumn === head ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row}
        <tr>
          {#each headers as head}
            <td class="px-3 py-2">
              {#if head === 'Image'}
                {#if row[head]}
                  <img src={row[head]} alt="img" class="max-h-16 max-w-[100px] object-contain" />
                {:else}
                  <span class="text-gray-400 italic">Null</span>
                {/if}
              {:else}
                {row[head]}
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
