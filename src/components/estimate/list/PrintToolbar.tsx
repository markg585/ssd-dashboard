'use client'

import { Button } from '@/components/ui/button'

export default function PrintToolbar() {
  return (
    <div className="flex justify-between items-center mb-4 print:hidden">
      <h1 className="text-2xl font-bold">Estimate Preview</h1>
      <Button onClick={() => window.print()}>
        Print / Save PDF
      </Button>
    </div>
  )
}
