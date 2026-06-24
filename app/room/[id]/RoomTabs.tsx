'use client'
import { useState } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { PhotoGrid } from '@/components/wall/PhotoGrid'
import { FileDropzone } from '@/components/upload/FileDropzone'
import { UploadPreview } from '@/components/upload/UploadPreview'
import { Badge } from '@/components/ui/Badge'
import { usePhotoWall } from '@/hooks/usePhotoWall'
import { usePhotoStatus } from '@/hooks/usePhotoStatus'
import { deletePhoto } from '@/app/actions/photos'
import type { Room, Photo, UploadFile } from '@/types'

interface RoomTabsProps {
  room: Room
  userId: string
  approvedPhotos: Photo[]
  myPhotos: Photo[]
}

const TABS = [
  { id: 'wall', label: 'Wall' },
  { id: 'upload', label: 'Upload' },
  { id: 'my-photos', label: 'My Photos' },
]

export function RoomTabs({ room, userId, approvedPhotos, myPhotos }: RoomTabsProps) {
  const [activeTab, setActiveTab] = useState('wall')
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [deleting, setDeleting] = useState<string | null>(null)

  const wallPhotos = usePhotoWall(room.id, approvedPhotos)
  const { photos: myPhotoList, setPhotos: setMyPhotos } = usePhotoStatus(room.id, userId, myPhotos)

  async function handleDelete(photoId: string) {
    setDeleting(photoId)
    const result = await deletePhoto(photoId)
    setDeleting(null)
    if (result.success) {
      setMyPhotos(prev => prev.filter(p => p.id !== photoId))
    }
  }


  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'wall' && (
          <PhotoGrid photos={wallPhotos} />
        )}

        {activeTab === 'upload' && (
          <div>
            {uploadFiles.length === 0 ? (
              <FileDropzone
                onFiles={files => setUploadFiles(files)}
              />
            ) : (
              <UploadPreview
                files={uploadFiles}
                roomId={room.id}
                onRemove={idx => setUploadFiles(prev => prev.filter((_, i) => i !== idx))}
                onAddMore={more => setUploadFiles(prev => [...prev, ...more])}
                onSuccess={() => {
                  setUploadFiles([])
                  setActiveTab('my-photos')
                }}
              />
            )}
          </div>
        )}

        {activeTab === 'my-photos' && (
          <div>
            {myPhotoList.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <p>You haven&apos;t uploaded any photos yet.</p>
                <button onClick={() => setActiveTab('upload')} className="btn-primary mt-4">
                  Upload photos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {myPhotoList.map(photo => (
                  <MyPhotoCard
                    key={photo.id}
                    photo={photo}
                    deleting={deleting === photo.id}
                    onDelete={() => handleDelete(photo.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function MyPhotoCard({ photo, deleting, onDelete }: {
  photo: Photo
  deleting: boolean
  onDelete: () => void
}) {
  const [loaded, setLoaded] = useState(false)
  const canDelete = photo.status === 'pending' || photo.status === 'rejected'

  return (
    <div className="relative card overflow-hidden group">
      {/* Skeleton shown until image loads */}
      {!loaded && (
        <div className="w-full aspect-square bg-bg-border animate-pulse flex items-center justify-center">
          <svg className="w-8 h-8 text-bg-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.public_url}
        alt=""
        className={`w-full aspect-square object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
        onLoad={() => setLoaded(true)}
      />
      <div className="p-2">
        <Badge variant={photo.status} />
        {photo.rejection_reason && (
          <p className="text-xs text-text-tertiary mt-1 line-clamp-2">{photo.rejection_reason}</p>
        )}
      </div>
      {canDelete && (
        <button
          onClick={onDelete}
          disabled={deleting}
          className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-danger rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  )
}
