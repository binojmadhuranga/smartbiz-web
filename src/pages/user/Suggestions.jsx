import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { getBusinessSuggestions } from '../../services/user/smartFeaturesService';

const Suggestions = ({ isOpen, onClose }) => {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('weekly');

  const filterOptions = [
    { value: 'daily', label: 'Daily', icon: '📅' },
    { value: 'weekly', label: 'Weekly', icon: '📊' },
    { value: 'monthly', label: 'Monthly', icon: '📈' },
    { value: 'yearly', label: 'Yearly', icon: '🎯' }
  ];

  const fetchSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getBusinessSuggestions(filter);
      setSuggestions(data);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError(err.message || 'Failed to load business suggestions');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
    }
  }, [isOpen, fetchSuggestions]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleRefresh = () => {
    fetchSuggestions();
  };

  // Helper function to format suggestions for better display
  const formatSuggestionContent = (suggestion) => {
    if (typeof suggestion === 'string') {
      // If it's a plain string, format it as markdown
      return suggestion;
    } else if (typeof suggestion === 'object' && suggestion !== null) {
      if (suggestion.content) {
        return suggestion.content;
      } else if (suggestion.description) {
        return suggestion.description;
      } else if (suggestion.text) {
        return suggestion.text;
      } else {
        // Convert object to formatted markdown
        return Object.entries(suggestion)
          .map(([key, value]) => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            if (Array.isArray(value)) {
              return `**${formattedKey}:**\n${value.map(item => `- ${item}`).join('\n')}`;
            }
            return `**${formattedKey}:** ${value}`;
          })
          .join('\n\n');
      }
    }
    return suggestion?.toString() || 'No content available';
  };

  // Helper function to get suggestion title
  const getSuggestionTitle = (suggestion, index) => {
    if (typeof suggestion === 'object' && suggestion !== null) {
      return suggestion.title || suggestion.heading || suggestion.name || `Suggestion ${index + 1}`;
    }
    return `Suggestion ${index + 1}`;
  };

  // Helper function to get suggestion category/type
  const getSuggestionCategory = (suggestion) => {
    if (typeof suggestion === 'object' && suggestion !== null) {
      return suggestion.category || suggestion.type || suggestion.priority || null;
    }
    return null;
  };

  // Helper function to get suggestion impact/importance
  const getSuggestionImpact = (suggestion) => {
    if (typeof suggestion === 'object' && suggestion !== null) {
      return suggestion.impact || suggestion.importance || suggestion.priority || null;
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Business Suggestions</h3>
                <p className="text-green-100 text-sm">Powered by advanced AI analytics</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh suggestions"
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === option.value
                    ? 'bg-white text-green-700 shadow-md'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <span>{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating AI suggestions...</p>
                <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Suggestions</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
              </div>
            </div>
          ) : suggestions ? (
            <div className="space-y-6">
              {/* Suggestions Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {filterOptions.find(f => f.value === filter)?.icon} {filterOptions.find(f => f.value === filter)?.label} Insights
                  </h4>
                  <p className="text-gray-600 text-sm">
                    AI-generated recommendations based on your business data
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  Generated: {new Date().toLocaleString()}
                </div>
              </div>

              {/* Suggestions Content */}
              <div className="space-y-6">
                {Array.isArray(suggestions) ? (
                  suggestions.map((suggestion, index) => {
                    const title = getSuggestionTitle(suggestion, index);
                    const content = formatSuggestionContent(suggestion);
                    const category = getSuggestionCategory(suggestion);
                    const impact = getSuggestionImpact(suggestion);

                    return (
                      <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="p-6">
                          {/* Suggestion Header */}
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                              <span className="text-white font-bold text-sm">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                                {category && (
                                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                    {category}
                                  </span>
                                )}
                              </div>
                              {impact && (
                                <div className="flex items-center gap-2 mb-3">
                                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="text-sm font-medium text-gray-700">Impact:</span>
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                    {impact}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Suggestion Content */}
                          <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-700">
                            <ReactMarkdown
                              components={{
                                h1: ({children}) => <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2">{children}</h1>,
                                h2: ({children}) => <h2 className="text-lg font-semibold text-gray-900 mt-3 mb-2">{children}</h2>,
                                h3: ({children}) => <h3 className="text-base font-semibold text-gray-900 mt-3 mb-1">{children}</h3>,
                                p: ({children}) => <p className="text-gray-700 mb-2 leading-relaxed">{children}</p>,
                                ul: ({children}) => <ul className="list-disc list-inside text-gray-700 space-y-1 mb-3">{children}</ul>,
                                ol: ({children}) => <ol className="list-decimal list-inside text-gray-700 space-y-1 mb-3">{children}</ol>,
                                li: ({children}) => <li className="text-gray-700">{children}</li>,
                                strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                                em: ({children}) => <em className="italic text-gray-800">{children}</em>,
                                code: ({children}) => <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">{children}</code>,
                                blockquote: ({children}) => <blockquote className="border-l-4 border-green-500 pl-4 italic text-gray-600 my-3">{children}</blockquote>
                              }}
                            >
                              {content}
                            </ReactMarkdown>
                          </div>

                          {/* Action Buttons for Individual Suggestions */}
                          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-md transition-colors text-sm font-medium">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Mark as Implemented
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors text-sm font-medium">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.13 8.13 0 01-2.939-.515l-5.637 2.01 2.01-5.637A8.13 8.13 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                              </svg>
                              Add Note
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                              </svg>
                              Share
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : typeof suggestions === 'object' && suggestions !== null ? (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Business Insights</h3>
                        </div>
                      </div>
                      
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            h1: ({children}) => <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2">{children}</h1>,
                            h2: ({children}) => <h2 className="text-lg font-semibold text-gray-900 mt-3 mb-2">{children}</h2>,
                            h3: ({children}) => <h3 className="text-base font-semibold text-gray-900 mt-3 mb-1">{children}</h3>,
                            p: ({children}) => <p className="text-gray-700 mb-2 leading-relaxed">{children}</p>,
                            ul: ({children}) => <ul className="list-disc list-inside text-gray-700 space-y-1 mb-3">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal list-inside text-gray-700 space-y-1 mb-3">{children}</ol>,
                            li: ({children}) => <li className="text-gray-700">{children}</li>,
                            strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                            code: ({children}) => <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">{children}</code>
                          }}
                        >
                          {formatSuggestionContent(suggestions)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Business Suggestion</h3>
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>
                              {suggestions?.toString() || 'No suggestion content available'}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                <button className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Save to Dashboard
                </button>
                <button className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export as PDF
                </button>
                <button className="flex items-center gap-2 bg-white border-2 border-blue-200 text-blue-700 px-6 py-3 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 font-medium shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share Report
                </button>
                <button className="flex items-center gap-2 bg-white border-2 border-purple-200 text-purple-700 px-6 py-3 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 font-medium shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Create Action Plan
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Suggestions Available</h3>
                <p className="text-gray-600">Click refresh to generate new suggestions</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Suggestions;