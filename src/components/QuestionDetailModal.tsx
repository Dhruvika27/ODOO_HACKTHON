import React, { useState } from 'react';
import { X, ArrowUp, ArrowDown, Check, Clock, Eye, MessageSquare, User, Tag } from 'lucide-react';
import { Question, Answer } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { RichTextEditor } from './RichTextEditor';

interface QuestionDetailModalProps {
  question: Question;
  isOpen: boolean;
  onClose: () => void;
}

// Mock answers data
const mockAnswers: Answer[] = [
  {
    id: 'a1',
    questionId: 'q1',
    content: `You can use the **useState** hook for local component state and **useEffect** for side effects. Here's a basic example:

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function MyComponent() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

The **useState** hook returns an array with the current state value and a setter function. The **useEffect** hook runs after every render and can be used for cleanup by returning a function.`,
    authorId: '2',
    author: {
      id: '2',
      username: 'react_expert',
      email: 'expert@example.com',
      role: 'user',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      joinDate: '2023-05-10',
      reputation: 2840
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    votes: 15,
    isAccepted: true
  },
  {
    id: 'a2',
    questionId: 'q1',
    content: `Another approach is to use **custom hooks** to encapsulate reusable logic:

\`\`\`javascript
// Custom hook
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
}

// Using the custom hook
function Counter() {
  const { count, increment, decrement, reset } = useCounter(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
\`\`\`

This keeps your components clean and makes the logic reusable across different components.`,
    authorId: '3',
    author: {
      id: '3',
      username: 'hooks_master',
      email: 'hooks@example.com',
      role: 'user',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      joinDate: '2023-08-22',
      reputation: 1650
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    votes: 8,
    isAccepted: false
  }
];

export const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({ question, isOpen, onClose }) => {
  const { user } = useAuth();
  const { processMentions } = useNotifications();
  const [answers, setAnswers] = useState<Answer[]>(mockAnswers.filter(a => a.questionId === question.id));
  const [newAnswer, setNewAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votes, setVotes] = useState<Record<string, { type: 'up' | 'down' | null, count: number }>>({
    [question.id]: { type: null, count: question.votes },
    ...answers.reduce((acc, answer) => ({
      ...acc,
      [answer.id]: { type: null, count: answer.votes }
    }), {})
  });

  // Update answers when question changes
  React.useEffect(() => {
    setAnswers(mockAnswers.filter(a => a.questionId === question.id));
  }, [question.id]);

  if (!isOpen) return null;

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleVote = (targetId: string, voteType: 'up' | 'down') => {
    if (!user) return;

    setVotes(prev => {
      const current = prev[targetId];
      const isChangingVote = current.type !== null && current.type !== voteType;
      const isRemovingVote = current.type === voteType;
      
      let newCount = current.count;
      let newType: 'up' | 'down' | null = voteType;

      if (isRemovingVote) {
        newCount += voteType === 'up' ? -1 : 1;
        newType = null;
      } else if (isChangingVote) {
        newCount += voteType === 'up' ? 2 : -2;
      } else {
        newCount += voteType === 'up' ? 1 : -1;
      }

      return {
        ...prev,
        [targetId]: { type: newType, count: newCount }
      };
    });
  };

  const handleAcceptAnswer = (answerId: string) => {
    if (!user || user.id !== question.authorId) return;
    // Handle accept answer logic
    console.log('Accepting answer:', answerId);
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAnswer.trim()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new answer
      const newAnswerObj: Answer = {
        id: Date.now().toString(),
        questionId: question.id,
        content: newAnswer,
        authorId: user.id,
        author: user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        votes: 0,
        isAccepted: false
      };
      
      // Add to answers list
      setAnswers(prev => [...prev, newAnswerObj]);
      
      // Initialize vote state for new answer
      setVotes(prev => ({
        ...prev,
        [newAnswerObj.id]: { type: null, count: 0 }
      }));
      
      // Process mentions in the answer
      processMentions(newAnswer, question.id, 'answer');
      
      // Reset form
      setNewAnswer('');
      
      console.log('Answer submitted successfully:', newAnswerObj);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{question.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Asked {formatTimeAgo(question.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{question.views} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{answers.length} answers</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Question Content */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex">
              {/* Voting */}
              <div className="flex flex-col items-center space-y-2 mr-6">
                <button
                  onClick={() => handleVote(question.id, 'up')}
                  disabled={!user}
                  className={`p-2 rounded-full transition-colors ${
                    votes[question.id]?.type === 'up'
                      ? 'bg-green-100 text-green-600'
                      : 'hover:bg-gray-200 text-gray-600'
                  } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ArrowUp className="w-6 h-6" />
                </button>
                <span className="text-lg font-semibold text-gray-900">
                  {votes[question.id]?.count || question.votes}
                </span>
                <button
                  onClick={() => handleVote(question.id, 'down')}
                  disabled={!user}
                  className={`p-2 rounded-full transition-colors ${
                    votes[question.id]?.type === 'down'
                      ? 'bg-red-100 text-red-600'
                      : 'hover:bg-gray-200 text-gray-600'
                  } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ArrowDown className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="prose max-w-none text-gray-900 mb-4">
                  {question.description}
                </div>

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

                {/* Author */}
                <div className="flex items-center justify-end">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">asked {formatTimeAgo(question.createdAt)}</div>
                    <div className="flex items-center space-x-2">
                      {question.author.avatar ? (
                        <img
                          src={question.author.avatar}
                          alt={question.author.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-blue-600">{question.author.username}</div>
                        <div className="text-xs text-gray-500">{question.author.reputation} reputation</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Answers */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {answers.length} Answer{answers.length !== 1 ? 's' : ''}
            </h3>

            {answers.map((answer) => (
              <div key={answer.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex">
                  {/* Voting */}
                  <div className="flex flex-col items-center space-y-2 mr-6">
                    <button
                      onClick={() => handleVote(answer.id, 'up')}
                      disabled={!user}
                      className={`p-2 rounded-full transition-colors ${
                        votes[answer.id]?.type === 'up'
                          ? 'bg-green-100 text-green-600'
                          : 'hover:bg-gray-200 text-gray-600'
                      } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                    <span className="text-lg font-semibold text-gray-900">
                      {votes[answer.id]?.count || answer.votes}
                    </span>
                    <button
                      onClick={() => handleVote(answer.id, 'down')}
                      disabled={!user}
                      className={`p-2 rounded-full transition-colors ${
                        votes[answer.id]?.type === 'down'
                          ? 'bg-red-100 text-red-600'
                          : 'hover:bg-gray-200 text-gray-600'
                      } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ArrowDown className="w-5 h-5" />
                    </button>
                    
                    {/* Accept Answer */}
                    {user && user.id === question.authorId && (
                      <button
                        onClick={() => handleAcceptAnswer(answer.id)}
                        className={`p-2 rounded-full transition-colors ${
                          answer.isAccepted
                            ? 'bg-green-100 text-green-600'
                            : 'hover:bg-gray-200 text-gray-600'
                        }`}
                        title={answer.isAccepted ? 'Accepted answer' : 'Accept this answer'}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    
                    {answer.isAccepted && user?.id !== question.authorId && (
                      <div className="p-2 bg-green-100 text-green-600 rounded-full">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="prose max-w-none text-gray-900 mb-4">
                      {answer.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-3">{paragraph}</p>
                      ))}
                    </div>

                    {/* Author */}
                    <div className="flex items-center justify-end">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">answered {formatTimeAgo(answer.createdAt)}</div>
                        <div className="flex items-center space-x-2">
                          {answer.author.avatar ? (
                            <img
                              src={answer.author.avatar}
                              alt={answer.author.username}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{answer.author.username}</div>
                            <div className="text-xs text-gray-500">{answer.author.reputation} reputation</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Answer */}
          {user ? (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
              <form onSubmit={handleSubmitAnswer}>
                <RichTextEditor
                  value={newAnswer}
                  onChange={setNewAnswer}
                  placeholder="Write your answer here..."
                  className="mb-4"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newAnswer.trim() || isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Your Answer'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-4">Sign in to post an answer</p>
                <button
                  onClick={onClose}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};