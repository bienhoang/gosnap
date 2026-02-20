import { useState } from 'react'

interface ModalDialogProps {
  triggerLabel?: string
}

export default function ModalDialog({ triggerLabel = 'Open Modal' }: ModalDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ padding: '10px 20px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 14 }}
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 12, padding: 28, width: 400, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
          >
            <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#111' }}>Confirm Action</h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#666' }}>
              Are you sure you want to proceed? This action demonstrates a modal dialog
              that GoSnap can inspect in component mode.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setOpen(false)}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 14 }}
              >
                Cancel
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#111', color: '#fff', cursor: 'pointer', fontSize: 14 }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
