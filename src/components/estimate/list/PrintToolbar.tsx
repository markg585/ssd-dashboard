'use client'

import { Button } from '@/components/ui/button'

export default function PrintToolbar() {
  return (
    <div className="flex justify-end mb-4 print:hidden">
      <Button onClick={() => window.print()}>
        Print / Save PDF
      </Button>
    </div>
  )
}

