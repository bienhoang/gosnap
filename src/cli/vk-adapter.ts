import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import type { SyncPayload, SyncFeedbackData } from '../types'

const TITLE_MAX = 100

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
    this.client = new Client({ name: 'pro-ui-feedbacks-sync', version: '1.0.0' })
    await this.client.connect(transport)

    if (this.explicitProjectId) {
      this.projectId = this.explicitProjectId
    } else {
      const result = await this.client.callTool({ name: 'list_projects', arguments: {} })
      const text = String((result.content as Array<{ text?: string }>)[0]?.text ?? '[]')
      const projects = JSON.parse(text)
      if (projects.length === 0) throw new Error('No Vibe Kanban projects found. Create a project first.')
      this.projectId = projects[0].id
      console.log(`[vk-sync] Auto-detected project: ${projects[0].name} (${this.projectId})`)
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
        const text = String((result.content as Array<{ text?: string }>)[0]?.text ?? '{}')
        const task = JSON.parse(text)
        if (task.id) this.feedbackMap.set(payload.feedback.id, task.id)
        console.log(`[vk-sync] Created task: ${task.id ?? 'unknown'}`)
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
          const text = String((result.content as Array<{ text?: string }>)[0]?.text ?? '{}')
          const task = JSON.parse(text)
          if (task.id) this.feedbackMap.set(fb.id, task.id)
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
