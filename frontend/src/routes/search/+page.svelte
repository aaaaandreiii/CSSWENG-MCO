<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { PUBLIC_API_BASE_URL } from '$env/static/public';

  let q = '';
  let results: Record<string, any[]> = {};
  let loading = false;
  let error = '';

  // whenever the URL’s ?q=… changes, re‑fetch
  $: q = $page.url.searchParams.get('q') ?? '';

  onMount(async () => {
    if (!q) return;
    loading = true;
    error = '';
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${PUBLIC_API_BASE_URL}/api/search?q=${encodeURIComponent(q)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(await res.text());
      results = await res.json();
    } catch (e) {
      console.error(e);
      error = 'Failed to load search results.';
    } finally {
      loading = false;
    }
  });

  // ── Helper: escape any HTML in the text ──
  function escapeForHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ── Helper: wrap every case‑insensitive match of `q` in <mark> ──
  function highlight(text: any, query: string): string {
    const str = String(text);
    if (!query) {
      // nothing to highlight
      return escapeForHtml(str);
    }
    // escape regex‑special chars in query
    const escapedQ = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const reSplit = new RegExp(`(${escapedQ})`, 'gi');
    const escaped = escapeForHtml(str);
    // split on the query (capturing) so it remains in the array
    const parts = escaped.split(reSplit);
    return parts
      .map((part) =>
        // if this part *exactly* matches the query (ignoring case), wrap it
        part.match(new RegExp(`^${escapedQ}$`, 'i'))
          ? `<mark>${part}</mark>`
          : part
      )
      .join('');
  }
</script>

<svelte:head>
  <title>Search results for “{q}”</title>
</svelte:head>

<main class="p-6">
  <h1 class="text-2xl mb-4">Search results for “{q}”</h1>

  {#if loading}
    <p>Loading…</p>
  {:else if error}
    <p class="text-red-600">{error}</p>
  {:else if Object.keys(results).length === 0}
    <p>No results found.</p>
  {:else}
    {#each Object.entries(results) as [table, rows]}
      <section class="mb-8">
        <h2 class="text-xl mb-2">{table}</h2>
        <div class="overflow-x-auto">
          <table class="table-auto border-collapse border">
            <thead>
              <tr>
                {#each Object.keys(rows[0]) as col}
                  <th class="border px-2 py-1">{col}</th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each rows as row}
                <tr class="odd:bg-gray-100">
                  {#each Object.values(row) as cell}
                    <td class="border px-2 py-1">
                      {@html highlight(cell, q)}
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>
    {/each}
  {/if}
</main>
