import type { FeedbackItem } from '../types'

/** Check if feedback is a multi-select (has elements array or areaData) */
export function isMultiSelect(fb: FeedbackItem): boolean {
  return !!(fb.elements && fb.elements.length > 0) || !!fb.areaData
}
