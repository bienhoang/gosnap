<script>
  let { children } = $props();
</script>

<nav style="display: flex; gap: 10px; padding: 14px 32px; background: #fff; border-bottom: 1px solid #e5e5e5">
  <span style="font-weight: 700; font-size: 16px; margin-right: 12px; color: #111">GoSnap + Svelte</span>
  <a href="/" style="padding: 5px 12px; border-radius: 6px; font-size: 14px; color: #555; text-decoration: none; border: 1px solid #ddd">Home</a>
  <a href="/dashboard" style="padding: 5px 12px; border-radius: 6px; font-size: 14px; color: #555; text-decoration: none; border: 1px solid #ddd">Dashboard</a>
</nav>

{@render children()}

<go-snap position="bottom-right" theme="dark" persist="svelte-example"></go-snap>
