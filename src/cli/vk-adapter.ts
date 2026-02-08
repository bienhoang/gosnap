import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import type { SyncPayload, SyncFeedbackData } from '../types'

const TITLE_MAX = 100

function parseMcpText(result: unknown): unknown {
  const text = String((result as { content?: Array<{ text?: string }> })?.content?.[0]?.text ?? '{}')
  try { return JSON.parse(text) } catch { return {} }
}

export class VKAdapter {
  private client: Client | null = null
  private projectId: string | null = null
  private feedbackMap = new Map<string, string>() // feedbackId -> taskId

  constructor(private explicitProjectId?: string) {}

  async connect(): Promise<void> {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['vibe-kanban@latest', '--mcp'],
    })
    this.client = new Client({ name: 'gosnap-sync', version: '1.0.0' })
    await this.client.connect(transport)

    const result = await this.client.callTool({ name: 'list_projects', arguments: {} })
    const parsed = parseMcpText(result) as Record<string, unknown>
    const projects = (Array.isArray(parsed) ? parsed : (parsed.projects as Record<string, unknown>[]) ?? []) as Record<string, unknown>[]
    if (projects.length === 0) throw new Error('No Vibe Kanban projects found. Create one first: npx vibe-kanban@latest')

    if (this.explicitProjectId) {
      // Match by ID or name (case-insensitive)
      const match = projects.find(
        (p) => p.id === this.explicitProjectId || String(p.name).toLowerCase() === this.explicitProjectId!.toLowerCase(),
      )
      if (!match) {
        console.error(`[vk-sync] Project "${this.explicitProjectId}" not found. Available projects:`)
        for (const p of projects) console.error(`  - ${p.name} (${p.id})`)
        throw new Error(`Project "${this.explicitProjectId}" not found.`)
      }
      this.projectId = String(match.id)
      console.log(`[vk-sync] Using project: ${match.name} (${this.projectId})`)
    } else if (projects.length === 1) {
      this.projectId = String(projects[0].id)
      console.log(`[vk-sync] Using project: ${projects[0].name} (${this.projectId})`)
    } else {
      console.error(`[vk-sync] Multiple projects found. Specify one with --project <name|id>:`)
      for (const p of projects) console.error(`  - ${p.name} (${p.id})`)
      throw new Error('Multiple projects found. Use --project <name|id> to select one.')
    }
  }

  private buildTitle(content: string): string {
    const truncated = content.length > TITLE_MAX
      ? content.slice(0, TITLE_MAX - 3) + '...'
      : content
    return `[UI] ${truncated}`
  }

  private buildDescription(fb: SyncFeedbackData, page: SyncPayload['page']): string {
    const lines = [`**Page:** ${page.url}`]
    if (fb.selector) lines.push(`**Selector:** \`${fb.selector}\``)
    if (fb.element?.elementPath) lines.push(`**Location:** ${fb.element.elementPath}`)
    if (fb.element?.boundingBox) {
      const bb = fb.element.boundingBox
      lines.push(`**Position:** ${bb.x}px, ${bb.y}px (${bb.width}x${bb.height}px)`)
    }
    if (fb.element?.elementDescription) lines.push(`**Element:** ${fb.element.elementDescription}`)
    lines.push('', fb.content)
    return lines.join('\n')
  }

  async handlePayload(payload: SyncPayload): Promise<void> {
    if (!this.client || !this.projectId) throw new Error('Not connected')

    switch (payload.event) {
      case 'feedback.created': {
        if (!payload.feedback) return
        const result = await this.client.callTool({
          name: 'create_task',
          arguments: {
            project_id: this.projectId,
            title: this.buildTitle(payload.feedback.content),
            description: this.buildDescription(payload.feedback, payload.page),
          },
        })
        const parsed = parseMcpText(result) as Record<string, unknown>
        const taskId = String(parsed.task_id ?? parsed.id ?? '')
        if (taskId) this.feedbackMap.set(payload.feedback.id, taskId)
        console.log(`[vk-sync] Created task: ${taskId || 'unknown'}`)
        break
      }
      case 'feedback.updated': {
        if (!payload.feedbackId) return
        const taskId = this.feedbackMap.get(payload.feedbackId)
        if (!taskId) return
        await this.client.callTool({
          name: 'update_task',
          arguments: {
            task_id: taskId,
            ...(payload.updatedContent ? { title: this.buildTitle(payload.updatedContent) } : {}),
          },
        })
        console.log(`[vk-sync] Updated task: ${taskId}`)
        break
      }
      case 'feedback.deleted': {
        if (!payload.feedbackId) return
        const taskId = this.feedbackMap.get(payload.feedbackId)
        if (!taskId) return
        await this.client.callTool({ name: 'delete_task', arguments: { task_id: taskId } })
        this.feedbackMap.delete(payload.feedbackId)
        console.log(`[vk-sync] Deleted task: ${taskId}`)
        break
      }
      case 'feedback.batch': {
        if (!payload.feedbacks) return
        for (const fb of payload.feedbacks) {
          const result = await this.client.callTool({
            name: 'create_task',
            arguments: {
              project_id: this.projectId,
              title: this.buildTitle(fb.content),
              description: this.buildDescription(fb, payload.page),
            },
          })
          const parsed = parseMcpText(result) as Record<string, unknown>
          const taskId = String(parsed.task_id ?? parsed.id ?? '')
          if (taskId) this.feedbackMap.set(fb.id, taskId)
        }
        console.log(`[vk-sync] Batch created ${payload.feedbacks.length} tasks`)
        break
      }
    }
  }

  async disconnect(): Promise<void> {
    await this.client?.close()
  }
}
