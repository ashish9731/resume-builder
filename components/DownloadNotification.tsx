// User Notification Component for Manual Downloads
// This component informs users that all content must be downloaded manually

import React from 'react';

interface DownloadNotificationProps {
  type: 'resume' | 'interview' | 'communication' | 'analysis';
  title?: string;
}

export default function DownloadNotification({ type, title }: DownloadNotificationProps) {
  const getNotificationMessage = () => {
    switch (type) {
      case 'resume':
        return {
          title: "Resume Generated Successfully!",
          message: "Please download your optimized resume using the download button below. Your resume is not automatically saved to cloud storage.",
          icon: "📄"
        };
      case 'interview':
        return {
          title: "Interview Analysis Complete!",
          message: "Your interview report has been generated. Please download the analysis report below. Reports are not stored in cloud storage.",
          icon: "🎤"
        };
      case 'communication':
        return {
          title: "Communication Analysis Ready!",
          message: "Your communication assessment is complete. Download your detailed analysis report using the button below.",
          icon: "💬"
        };
      case 'analysis':
        return {
          title: "Analysis Complete!",
          message: "Your analysis has been generated. Please download the results below as they are not automatically saved.",
          icon: "📊"
        };
      default:
        return {
          title: "Content Generated!",
          message: "Please download your content using the download button. Files are not automatically saved to storage.",
          icon: "💾"
        };
    }
  };

  const { title: notificationTitle, message, icon } = getNotificationMessage();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <span className="text-2xl mr-3">{icon}</span>
        <div>
          <h3 className="font-semibold text-blue-800 mb-1">{notificationTitle}</h3>
          <p className="text-blue-700 text-sm">{message}</p>
          <div className="mt-2 text-xs text-blue-600">
            <strong>Note:</strong> All generated content must be manually downloaded and saved. 
            No automatic cloud storage is enabled.
          </div>
        </div>
      </div>
    </div>
  );
}