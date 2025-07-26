import React from 'react';
import { MessageSquare, Eye, ArrowUp, Clock, Tag } from 'lucide-react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  onClick: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick }) => {
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getTagColor = (tag: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-yellow-100 text-yellow-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800'
    ];
    return colors[tag.length % colors.length];
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
          {question.title}
        </h3>
        {question.acceptedAnswerId && (
          <div className="flex items-center space-x-1 text-green-600 text-sm font-medium">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span>Solved</span>
          </div>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{question.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {question.tags.map((tag, index) => (
          <span
            key={index}
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}
          >
            <Tag className="w-3 h-3 mr-1" />
            {tag}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <ArrowUp className="w-4 h-4" />
            <span>{question.votes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageSquare className="w-4 h-4" />
            <span>{question.answerCount}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{question.views}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatTimeAgo(question.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            {question.author.avatar ? (
              <img
                src={question.author.avatar}
                alt={question.author.username}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
            )}
            <span className="text-gray-700 font-medium">{question.author.username}</span>
          </div>
        </div>
      </div>
    </div>
  );
};