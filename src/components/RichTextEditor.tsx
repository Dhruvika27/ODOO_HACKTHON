import React, { useState, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Smile,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  className = ""
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const emojis = ['😀', '😊', '😍', '🤔', '😅', '👍', '👎', '❤️', '🎉', '🔥', '💡', '✅', '❌', '⚡', '🚀', '💻'];

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const insertEmoji = (emoji: string) => {
    insertText(emoji);
    setShowEmojiPicker(false);
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      insertText(`[${linkText}](${linkUrl})`);
      setShowLinkDialog(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const alt = prompt('Enter image alt text (optional):') || 'Image';
      insertText(`![${alt}](${url})`);
    }
  };

  const insertCodeBlock = () => {
    insertText('\n```\n', '\n```\n');
  };

  const insertInlineCode = () => {
    insertText('`', '`');
  };

  const insertList = (ordered: boolean = false) => {
    const prefix = ordered ? '1. ' : '- ';
    insertText(`\n${prefix}`);
  };

  const insertHeading = (level: number) => {
    const hashes = '#'.repeat(level);
    insertText(`\n${hashes} `);
  };

  const applyAlignment = (alignment: string) => {
    insertText(`<div style="text-align: ${alignment}">`, '</div>');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertText('**', '**');
          break;
        case 'i':
          e.preventDefault();
          insertText('*', '*');
          break;
        case 'k':
          e.preventDefault();
          setShowLinkDialog(true);
          break;
      }
    }

    // Handle @ mentions
    if (e.key === '@') {
      // This could be enhanced to show a user picker dropdown
      console.log('Mention triggered');
    }
  };

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => insertText('**', '**')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => insertText('*', '*')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => insertText('~~', '~~')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
        <button
          type="button"
          onClick={insertInlineCode}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Inline Code"
        >
          <Code size={16} />
        </button>
        
        <div className="w-px bg-gray-300 mx-1" />
        
        {/* Headings */}
        <select
          onChange={(e) => {
            const level = parseInt(e.target.value);
            if (level) insertHeading(level);
            e.target.value = '';
          }}
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 transition-colors"
          defaultValue=""
        >
          <option value="" disabled>Heading</option>
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
        </select>
        
        <div className="w-px bg-gray-300 mx-1" />
        
        {/* Lists */}
        <button
          type="button"
          onClick={() => insertList(false)}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => insertList(true)}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
        
        <div className="w-px bg-gray-300 mx-1" />
        
        {/* Code Block */}
        <button
          type="button"
          onClick={insertCodeBlock}
          className="p-2 hover:bg-gray-200 rounded transition-colors text-xs font-mono"
          title="Code Block"
        >
          {'{}'}
        </button>
        
        <div className="w-px bg-gray-300 mx-1" />
        
        {/* Links and Images */}
        <button
          type="button"
          onClick={() => setShowLinkDialog(true)}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Insert Link (Ctrl+K)"
        >
          <Link size={16} />
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Insert Image"
        >
          <Image size={16} />
        </button>
        
        <div className="w-px bg-gray-300 mx-1" />
        
        {/* Alignment */}
        <button
          type="button"
          onClick={() => applyAlignment('left')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => applyAlignment('center')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          type="button"
          onClick={() => applyAlignment('right')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
        
        <div className="w-px bg-gray-300 mx-1" />
        
        {/* Emoji Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Insert Emoji"
          >
            <Smile size={16} />
          </button>
          
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 grid grid-cols-8 gap-1 z-10">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="p-1 hover:bg-gray-100 rounded text-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full h-64 p-4 resize-none focus:outline-none font-mono text-sm"
      />
      
      {/* Preview */}
      {value && (
        <div className="border-t border-gray-300 bg-gray-50 p-4">
          <div className="text-xs text-gray-500 mb-2 font-semibold">Preview:</div>
          <div className="prose prose-sm max-w-none bg-white p-3 rounded border">
            {value.split('\n').map((line, index) => {
              // Basic markdown rendering for preview
              let processedLine = line
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/~~(.*?)~~/g, '<del>$1</del>')
                .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
                .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto" />')
                .replace(/@(\w+)/g, '<span class="text-blue-600 font-medium">@$1</span>');

              if (line.startsWith('# ')) {
                return <h1 key={index} className="text-xl font-bold mb-2" dangerouslySetInnerHTML={{ __html: processedLine.substring(2) }} />;
              } else if (line.startsWith('## ')) {
                return <h2 key={index} className="text-lg font-bold mb-2" dangerouslySetInnerHTML={{ __html: processedLine.substring(3) }} />;
              } else if (line.startsWith('### ')) {
                return <h3 key={index} className="text-base font-bold mb-2" dangerouslySetInnerHTML={{ __html: processedLine.substring(4) }} />;
              } else if (line.startsWith('- ')) {
                return <li key={index} className="ml-4" dangerouslySetInnerHTML={{ __html: processedLine.substring(2) }} />;
              } else if (line.match(/^\d+\. /)) {
                return <li key={index} className="ml-4 list-decimal" dangerouslySetInnerHTML={{ __html: processedLine.replace(/^\d+\. /, '') }} />;
              } else if (line.startsWith('```')) {
                return <div key={index} className="bg-gray-100 p-2 rounded font-mono text-sm">Code block</div>;
              } else if (line.trim() === '') {
                return <br key={index} />;
              } else {
                return <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: processedLine }} />;
              }
            })}
          </div>
        </div>
      )}
      
      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Link text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <input
                type="url"
                placeholder="URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLinkDialog(false);
                    setLinkUrl('');
                    setLinkText('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={insertLink}
                  disabled={!linkUrl || !linkText}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};