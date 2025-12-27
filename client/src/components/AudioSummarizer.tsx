import { useState } from 'react';
import { Youtube, Video, Headphones, FileText, Upload, Info, FileAudio } from 'lucide-react';

interface AudioFile {
  id: string;
  title: string;
  date: string;
}

export function AudioSummarizer(props: any) {
  const mode: 'audio' | 'video' = props?.mode === 'video' ? 'video' : 'audio';
  const [transcriptionAccuracy, setTranscriptionAccuracy] = useState('Medium');
  const [speakerRecognition, setSpeakerRecognition] = useState(false);
  const [language, setLanguage] = useState('Auto');
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop
    const files = e.dataTransfer.files;
    console.log('Files dropped:', files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileUpload = () => {
    // Trigger file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = mode === 'video' ? 'video/*' : 'audio/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      console.log('Files selected:', files);
    };
    input.click();
  };

  const exampleFiles: AudioFile[] = [
    {
      id: '1',
      title: 'Leveraging AI Tools to Boost Classroom Engagement',
      date: '06/13/2025',
    },
    {
      id: '2',
      title: 'Practical Tips and Case Studies for Enhancing Learning Efficiency',
      date: '06/13/2025',
    },
    {
      id: '3',
      title: "Inside a Bestseller's Creative Process",
      date: '06/13/2025',
    },
    {
      id: '4',
      title: 'From Small Town to Global Fame',
      date: '06/13/2025',
    },
  ];

  const isVideo = mode === 'video';

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="mb-3">
          {isVideo ? 'AI Video Summarizer – Free Video to Notes' : 'AI Audio Summarizer – Free MP3 & Voice Summary'}
        </h1>
        <p className="text-gray-600">
          {isVideo
            ? 'Upload video files and get fast, accurate summaries and transcripts.'
            : 'Process up to 20 audio files, each up to 1GB—fast and accurate.'}
        </p>
      </div>

      {/* Options Bar */}
      <div className="flex items-center gap-6 mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Transcription Accuracy</span>
          <select
            value={transcriptionAccuracy}
            onChange={(e) => setTranscriptionAccuracy(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Speaker Recognition</span>
          <label className="relative inline-block w-10 h-6">
            <input
              type="checkbox"
              checked={speakerRecognition}
              onChange={(e) => setSpeakerRecognition(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-full h-full bg-gray-300 peer-checked:bg-blue-600 rounded-full transition-colors cursor-pointer"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Auto</option>
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
          </select>
        </div>

        <button className="ml-auto flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm">
          <FileText size={16} />
          Log In
        </button>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-12 mb-6 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center">
            <FileAudio size={32} className="text-white" />
          </div>
          <div>
            <p className="text-gray-700 mb-1">
              {isVideo ? 'Upload or drag a video here.' : 'Upload or drag an audio here.'}
            </p>
            <p className="text-sm text-gray-500">
              {isVideo
                ? 'Max 1GB per video, up to 20 tasks in queue.'
                : 'Max 1GB per audio, up to 20 tasks in queue.'}
            </p>
            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mt-1 mx-auto">
              Supported file formats
              <Info size={14} />
            </button>
          </div>
          <button
            onClick={handleFileUpload}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <Upload size={18} />
            {isVideo ? 'Upload a Video' : 'Upload an Audio'}
          </button>
        </div>
      </div>

      {/* Example Files */}
      <div className="grid grid-cols-4 gap-4">
        {exampleFiles.map((file) => (
          <div
            key={file.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
                <FileAudio size={16} className="text-white" />
              </div>
              <span className="text-xs text-blue-600">[Example]</span>
            </div>
            <p className="text-sm text-gray-800 mb-3 line-clamp-2">{file.title}</p>
            <p className="text-xs text-gray-500">{file.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
