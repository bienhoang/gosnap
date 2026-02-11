import type { FeedbackItem, InspectedElement, SyncElementData, SyncFeedbackData, SyncPayload, SyncEventType } from '../types'

/** Extract serializable element data from InspectedElement (strips DOM refs) */
function serializeElement(el: InspectedElement): SyncElementData {
  return {
    selector: el.selector,
    tagName: el.tagName,
    className: el.className,
    elementId: el.id,
    elementPath: el.metadata?.elementPath,
    fullPath: el.metadata?.fullPath,
    elementDescription: el.metadata?.elementDescription,
    boundingBox: el.metadata?.boundingBox,
    accessibility: el.metadata?.accessibility
      ? { role: el.metadata.accessibility.role, label: el.metadata.accessibility.label }
      : undefined,
    componentName: el.componentInfo?.name,
    componentTree: el.componentInfo?.treePath,
    componentProps: el.componentInfo?.props,
  }
}

/** Transform FeedbackItem to serializable SyncFeedbackData */
export function serializeFeedbackForSync(item: FeedbackItem): SyncFeedbackData {
  return {
    id: item.id,
    stepNumber: item.stepNumber,
    content: item.content,
    selector: item.selector,
    pageX: item.pageX,
    pageY: item.pageY,
    createdAt: item.createdAt,
    element: item.element ? serializeElement(item.element) : undefined,
    areaData: item.areaData,
    isAreaOnly: item.isAreaOnly,
    elements: item.elements?.map(serializeElement),
  }
}

/** Build page context from browser globals */
function getPageContext(): SyncPayload['page'] {
  return {
    url: window.location.href,
    pathname: window.location.pathname,
    viewport: { width: window.innerWidth, height: window.innerHeight },
  }
}

/** Build a sync payload for a single feedback event */
export function buildSyncPayload(
  event: SyncEventType,
  item?: FeedbackItem,
  extra?: { feedbackId?: string; updatedContent?: string },
): SyncPayload {
  return {
    event,
    timestamp: Date.now(),
    page: getPageContext(),
    feedback: item ? serializeFeedbackForSync(item) : undefined,
    feedbackId: extra?.feedbackId,
    updatedContent: extra?.updatedContent,
  }
}

/** Build a batch sync payload for multiple feedbacks */
export function buildBatchSyncPayload(items: FeedbackItem[]): SyncPayload {
  return {
    event: 'feedback.batch',
    timestamp: Date.now(),
    page: getPageContext(),
    feedbacks: items.map(serializeFeedbackForSync),
  }
}
