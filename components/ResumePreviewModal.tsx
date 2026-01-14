"use client"
import { useState } from 'react'
import { X, Download, Edit3, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ResumePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  resumeText: string
  onSave: (editedText: string) => void
  onDownload: (text: string) => void
  title: string
}

export default function ResumePreviewModal({ 
  isOpen, 
  onClose, 
  resumeText, 
  onSave, 
  onDownload,
  title 
}: ResumePreviewModalProps) {
  const [editedText, setEditedText] = useState(resumeText)
  const [isEditing, setIsEditing] = useState(false)

  if (!isOpen) return null

  const handleSave = () => {
    onSave(editedText)
    setIsEditing(false)
  }

  const handleDownload = () => {
    onDownload(editedText)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-gray-50 p-4 border-b flex gap-3">
          {isEditing ? (
            <Button 
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Resume
            </Button>
          )}
          
          <Button 
            onClick={handleDownload}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-180px)]">
          {isEditing ? (
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full h-full min-h-[500px] p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Edit your resume content here..."
            />
          ) : (
            <div className="bg-white rounded-lg p-6 min-h-[500px] text-gray-800">
              <div className="whitespace-pre-wrap font-sans text-base leading-relaxed">
                {editedText.split('\n').map((line, index) => (
                  <div 
                    key={index} 
                    className={
                      line.trim() === '' ? 'my-2' :
                      line === line.toUpperCase() && line.length > 10 ? 'font-bold text-lg my-4 border-b pb-2' :
                      line.startsWith('-') ? 'ml-4 my-1' :
                      'my-1'
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}