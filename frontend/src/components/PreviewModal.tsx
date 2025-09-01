import React, { useState } from 'react';
import MarkdownIt from 'markdown-it';
import 'github-markdown-css/github-markdown.css';
import { X, Copy, Check, Download } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
});

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, content }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const renderedContent = md.render(content);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b shrink-0">
          <h2 className="text-xl font-bold">README Preview</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto flex-grow p-8">
          <div
            className="markdown-body github-markdown-light"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        </div>
        <div className="flex justify-end items-center p-4 border-t space-x-4 shrink-0 bg-gray-50 rounded-b-lg">
          <button onClick={handleCopy} className="btn-outline flex items-center space-x-2">
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
          </button>
          <button onClick={handleDownload} className="btn-outline flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Download .md</span>
          </button>
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
