'use client'

import { GoSnap } from 'gosnap-widget'

export default function GoSnapWrapper() {
  return (
    <GoSnap
      position="bottom-right"
      theme="dark"
      persist
      defaultInspectMode="dom"
      onToggle={(active) => console.log('[GoSnap] Inspector:', active ? 'ON' : 'OFF')}
      onFeedbackSubmit={(fb) => console.log(`[GoSnap] Feedback #${fb.stepNumber}:`, fb.content)}
      onCopy={() => console.log('[GoSnap] Feedbacks copied')}
    />
  )
}
