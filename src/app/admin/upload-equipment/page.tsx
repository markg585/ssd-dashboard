'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { toast } from 'sonner'

export default function UploadEquipmentPage() {
  const [jsonInput, setJsonInput] = useState('')

  const handleUpload = async () => {
    try {
      const items = JSON.parse(jsonInput)

      for (const item of items) {
        await addDoc(collection(db, 'equipmentItems'), {
          name: item.name,
          price: item.price,
          category: item.category || 'General',
          createdAt: new Date(),
        })
      }

      toast.success('✅ Uploaded equipment items')
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
        rows={12}
        placeholder="Paste JSON here..."
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
      />
      <Button onClick={handleUpload}>Upload to Firestore</Button>
    </div>
  )
}
