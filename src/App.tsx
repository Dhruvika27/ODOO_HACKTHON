import React, { useState, useMemo } from 'react';
import { Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from './components/Header';
import { QuestionCard } from './components/QuestionCard';
import { AuthModal } from './components/AuthModal';
import { AskQuestionModal } from './components/AskQuestionModal';
import { QuestionDetailModal } from './components/QuestionDetailModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { mockQuestions } from './data/mockData';
import { Question } from './types';

const ITEMS_PER_PAGE = 6;

function AppContent() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'votes' | 'answers'>('newest');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    questions.forEach(q => q.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [questions]);

  // Filter and sort questions
  const filteredQuestions = useMemo(() => {
    let filtered = questions.filter(question => {
      const matchesSearch = searchQuery === '' || 
        question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => question.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });

    // Sort questions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'votes':
          return b.votes - a.votes;
        case 'answers':
          return b.answerCount - a.answerCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedTags, sortBy, questions]);

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAskQuestion = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowAskModal(true);
    }
  };

  const handleQuestionSubmitted = (newQuestion: Question) => {
    setQuestions(prev => [newQuestion, ...prev]);
    setCurrentPage(1); // Go to first page to see the new question
  };
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSearchQuery('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          setCurrentPage(1);
        }}
        onLoginClick={() => setShowAuthModal(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
            <p className="text-gray-600 mt-1">
              {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            
            <button
              onClick={handleAskQuestion}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ask Question</span>
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                {(selectedTags.length > 0 || searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Sort by</h4>
                <div className="space-y-2">
                  {[
                    { value: 'newest', label: 'Newest' },
                    { value: 'votes', label: 'Most votes' },
                    { value: 'answers', label: 'Most answers' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="sort"
                        value={option.value}
                        checked={sortBy === option.value}
                        onChange={(e) => {
                          setSortBy(e.target.value as typeof sortBy);
                          setCurrentPage(1);
                        }}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Tags</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allTags.map(tag => (
                    <label key={tag} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => handleTagToggle(tag)}
                        className="mr-2 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <span className="text-sm text-gray-700">{tag}</span>
                      <span className="ml-auto text-xs text-gray-500">
                        {questions.filter(q => q.tags.includes(tag)).length}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Question List */}
            <div className="space-y-4">
              {paginatedQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">No questions found</div>
                  <p className="text-gray-600">
                    {searchQuery || selectedTags.length > 0
                      ? 'Try adjusting your filters or search terms'
                      : 'Be the first to ask a question!'
                    }
                  </p>
                  {(!searchQuery && selectedTags.length === 0) && (
                    <button
                      onClick={handleAskQuestion}
                      className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Ask the first question
                    </button>
                  )}
                </div>
              ) : (
                paginatedQuestions.map(question => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    onClick={() => setSelectedQuestion(question)}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <AskQuestionModal 
        isOpen={showAskModal} 
        onClose={() => setShowAskModal(false)}
        onQuestionSubmitted={handleQuestionSubmitted}
      />
      {selectedQuestion && (
        <QuestionDetailModal
          question={selectedQuestion}
          isOpen={!!selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;