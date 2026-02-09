const args = process.argv.slice(2)

if (args.includes('--sync-vk')) {
  import('./sync-server.js')
} else {
  console.log('gosnap CLI\n')
  console.log('Usage:')
  console.log('  npx gosnap-widget --sync-vk              Start Vibe Kanban sync server')
  console.log('  npx gosnap-widget --sync-vk --port 3456  Custom port')
  console.log('  npx gosnap-widget --sync-vk --project NAME|ID  Specific VK project')
}
