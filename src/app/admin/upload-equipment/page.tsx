'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { toast } from 'sonner'

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function UploadEquipmentPage() {
  const [jsonInput, setJsonInput] = useState('')

  const handleUpload = async () => {
    try {
      const items = JSON.parse(jsonInput)

      for (const item of items) {
        const slug = slugify(item.name)
        const unitPrice = parseFloat(
          (item.price || item.unitPrice || '0').toString().replace('$', '')
        )

        await setDoc(doc(db, 'equipmentItems', slug), {
          name: item.name,
          unitPrice,
          category: item.category || 'General',
          updatedAt: new Date(),
        })
      }

      toast.success('✅ Equipment uploaded successfully')
      setJsonInput('')
    } catch (err) {
      console.error(err)
      toast.error('❌ Invalid JSON or upload failed')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Upload Equipment Items</h1>
      <Textarea
        rows={16}
        placeholder={`Paste JSON like:\n[\n  {\n    "name": "Bobcat",\n    "price": "$135.00"\n  }\n]`}
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
      />
      <Button onClick={handleUpload}>Upload Equipment</Button>
    </div>
  )
}

