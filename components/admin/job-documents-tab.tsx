'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { formatDate } from '@/lib/utils'
import {
  FileText,
  Upload,
  Trash2,
  Download,
  Image as ImageIcon,
  RefreshCw,
  X,
} from 'lucide-react'
import type { JobDocument, JobDocumentType } from '@/lib/jobs/types'

const DOC_TYPE_OPTIONS = [
  { value: 'contract', label: 'Contract' },
  { value: 'permit', label: 'Permit' },
  { value: 'insurance_cert', label: 'Insurance Certificate' },
  { value: 'inspection_report', label: 'Inspection Report' },
  { value: 'photo', label: 'Photo' },
  { value: 'warranty_cert', label: 'Warranty Certificate' },
  { value: 'other', label: 'Other' },
]

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']

interface JobDocumentsTabProps {
  jobId: string
}

export function JobDocumentsTab({ jobId }: JobDocumentsTabProps) {
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [documents, setDocuments] = useState<JobDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedDocType, setSelectedDocType] = useState<JobDocumentType>('photo')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/documents`)
      if (res.ok) {
        const data = await res.json()
        setDocuments(data.documents || [])
      }
    } catch {
      // Silent
    } finally {
      setIsLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress(Math.round(((i) / files.length) * 100))

        // Get signed upload URL
        const urlRes = await fetch(`/api/admin/jobs/${jobId}/documents/signed-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        })

        if (!urlRes.ok) throw new Error('Failed to get upload URL')
        const { signedUrl, token, storagePath } = await urlRes.json()

        // Upload file
        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
            'x-upsert': 'true',
          },
          body: file,
        })

        if (!uploadRes.ok) throw new Error(`Upload failed for ${file.name}`)

        // Create document record
        const docRes = await fetch(`/api/admin/jobs/${jobId}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            document_type: selectedDocType,
            title: file.name,
            storage_path: storagePath,
            file_size: file.size,
            mime_type: file.type,
          }),
        })

        if (!docRes.ok) throw new Error(`Failed to save record for ${file.name}`)
      }

      setUploadProgress(100)
      showToast(`${files.length} file(s) uploaded`, 'success')
      fetchDocuments()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      showToast(msg, 'error')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (docId: string) => {
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/documents/${docId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Delete failed')
      setDocuments(prev => prev.filter(d => d.id !== docId))
      setDeleteConfirmId(null)
      showToast('Document deleted', 'success')
    } catch {
      showToast('Failed to delete document', 'error')
    }
  }

  const photos = documents.filter(d => d.mime_type && IMAGE_TYPES.includes(d.mime_type))
  const files = documents.filter(d => !d.mime_type || !IMAGE_TYPES.includes(d.mime_type))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Select
              options={DOC_TYPE_OPTIONS}
              value={selectedDocType}
              onChange={(val) => setSelectedDocType(val as JobDocumentType)}
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.heic,.pdf,.docx"
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              leftIcon={<Upload className="h-4 w-4" />}
            >
              {isUploading ? `Uploading ${uploadProgress}%` : 'Upload Files'}
            </Button>
          </div>
          {isUploading && (
            <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo gallery */}
      {photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Photos ({photos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {photos.map((doc) => (
                <div key={doc.id} className="group relative aspect-square rounded-lg overflow-hidden bg-slate-100 border">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-xs text-white truncate">{doc.title}</p>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setDeleteConfirmId(doc.id)}
                      className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents ({files.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 && photos.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No documents uploaded yet. Use the upload button above.</p>
          ) : files.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No non-image documents</p>
          ) : (
            <div className="space-y-2">
              {files.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{doc.title}</p>
                      <p className="text-xs text-slate-500">
                        <span className="capitalize">{doc.document_type.replace('_', ' ')}</span>
                        {' · '}
                        {formatDate(doc.created_at)}
                        {doc.file_size && ` · ${(doc.file_size / 1024).toFixed(0)} KB`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {deleteConfirmId === doc.id ? (
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" onClick={() => setDeleteConfirmId(null)}>
                          <X className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="primary" className="bg-red-500 hover:bg-red-600" onClick={() => handleDelete(doc.id)}>
                          Delete
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
