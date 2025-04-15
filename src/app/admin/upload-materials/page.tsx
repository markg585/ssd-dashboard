'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { toast } from 'sonner'

export default function UploadMaterialsPage() {
  const [jsonInput, setJsonInput] = useState('')

  const handleUpload = async () => {
    try {
      const items = JSON.parse(jsonInput)

      for (const item of items) {
        await addDoc(collection(db, 'materials'), {
          item: item.item,
          type: item.type, // Prep, Bitumen, Asphalt
          sprayRateDefault: item.sprayRateDefault || 0,
          createdAt: new Date(),
        })
      }

      toast.success('✅ Uploaded materials')
      setJsonInput('')
    } catch (err) {
      console.error(err)
      toast.error('❌ Invalid JSON or upload failed')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Upload Materials</h1>
      <Textarea
        rows={12}
        placeholder={`Paste JSON like:\n[\n  {\n    "item": "Bitumen Emulsion",\n    "type": "Bitumen",\n    "sprayRateDefault": 0.8\n  }\n]`}
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
      />
      <Button onClick={handleUpload}>Upload to Firestore</Button>
    </div>
  )
}
