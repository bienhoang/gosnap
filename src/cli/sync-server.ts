import http from 'node:http'
import { VKAdapter } from './vk-adapter.js'

const DEFAULT_PORT = 3456

function parseArgs(): { port: number; project?: string } {
  const args = process.argv.slice(2)
  let port = DEFAULT_PORT
  let project: string | undefined

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' && args[i + 1]) {
      port = parseInt(args[i + 1], 10)
      i++
    }
    if (args[i] === '--project' && args[i + 1]) {
      project = args[i + 1]
      i++
    }
  }
  return { port, project }
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Private-Network': 'true',
  }
}

async function main() {
  const { port, project } = parseArgs()
  const adapter = new VKAdapter(project)

  console.log('[vk-sync] Connecting to Vibe Kanban MCP...')
  await adapter.connect()
  console.log('[vk-sync] Connected.')

  const server = http.createServer(async (req, res) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, corsHeaders())
      res.end()
      return
    }

    if (req.method !== 'POST' || req.url !== '/webhook') {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not found')
      return
    }

    // Read body
    const chunks: Buffer[] = []
    for await (const chunk of req) chunks.push(chunk as Buffer)
    const body = Buffer.concat(chunks).toString()

    try {
      const payload = JSON.parse(body)
      await adapter.handlePayload(payload)
      res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
    } catch (err) {
      console.error('[vk-sync] Error:', (err as Error).message)
      res.writeHead(500, { ...corsHeaders(), 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: (err as Error).message }))
    }
  })

  server.listen(port, '127.0.0.1', () => {
    console.log(`[vk-sync] Listening on http://localhost:${port}/webhook`)
    console.log('[vk-sync] Set syncUrl="http://localhost:' + port + '/webhook" in your widget config')
  })

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n[vk-sync] Shutting down...')
    server.close()
    await adapter.disconnect()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((err) => {
  console.error('[vk-sync] Fatal:', err.message)
  process.exit(1)
})
