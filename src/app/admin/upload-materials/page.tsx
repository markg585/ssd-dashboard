'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { db } from '@/lib/firebase'
import { collection, doc, setDoc } from 'firebase/firestore'
import { toast } from 'sonner'

export default function UploadMaterialsPage() {
  const [jsonInput, setJsonInput] = useState('')

  const handleUpload = async () => {
    try {
      const items = JSON.parse(jsonInput)

      for (const item of items) {
        if (
          !item.item ||
          !item.type ||
          item.unitPrice === undefined ||
          item.formula === undefined ||
          !item.measurement
        ) {
          console.warn('❗ Skipping invalid entry:', item)
          continue
        }

        // Use a clean slugified ID based on item name
        const slugId = item.item.toLowerCase().replace(/[^a-z0-9]/gi, '-')

        await setDoc(
          doc(db, 'materials', slugId),
          {
            item: item.item,
            type: item.type,
            unitPrice: Number(item.unitPrice),
            formula: Number(item.formula), // e.g. 0.906
            measurement: item.measurement,
            updatedAt: new Date(),
          },
          { merge: true }
        )
      }

      toast.success('✅ Materials uploaded and updated')
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
        placeholder={`Paste JSON like:\n[\n  {\n    "item": "AC10",\n    "type": "Asphalt",\n    "unitPrice": 195,\n    "formula": 2.4,\n    "measurement": "Tonne"\n  }\n]`}
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
      />
      <Button onClick={handleUpload}>Upload / Overwrite</Button>
    </div>
  )
}


