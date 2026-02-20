<script>
  const stats = [
    { label: 'Components', value: '12' },
    { label: 'Stores', value: '5' },
    { label: 'Routes', value: '4' },
    { label: 'Bundle', value: '28KB' },
  ];

  const rows = [
    { name: '+layout.svelte', size: '0.8KB', type: 'Layout' },
    { name: '+page.svelte (home)', size: '1.6KB', type: 'Page' },
    { name: '+page.svelte (dash)', size: '1.4KB', type: 'Page' },
  ];
</script>

<div style="padding: 32px 40px; max-width: 800px">
  <h1 style="font-size: 28px; font-weight: 700; color: #111; margin: 0 0 24px">Dashboard</h1>

  <div style="display: flex; gap: 14px; margin-bottom: 28px; flex-wrap: wrap">
    {#each stats as s}
      <div style="flex: 1 1 150px; padding: 18px; background: #fff; border-radius: 10px; border: 1px solid #e5e5e5; text-align: center">
        <div style="font-size: 24px; font-weight: 700; color: #111">{s.value}</div>
        <div style="font-size: 13px; color: #888; margin-top: 4px">{s.label}</div>
      </div>
    {/each}
  </div>

  <div style="background: #fff; border-radius: 10px; border: 1px solid #e5e5e5; overflow: hidden">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px">
      <thead>
        <tr style="background: #fafafa; text-align: left">
          <th style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5">File</th>
          <th style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5">Size</th>
          <th style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5">Type</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as row}
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0">{row.name}</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0">{row.size}</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0">
              <span style="padding: 2px 10px; border-radius: 12px; font-size: 12px; background: #fce7f3; color: #9d174d">
                {row.type}
              </span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
