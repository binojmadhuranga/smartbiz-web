import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getUserPlan, generatePost } from '../../services/user/smartFeaturesService';
import html2canvas from 'html2canvas';
import ReactMarkdown from 'react-markdown';
import Suggestions from './Suggestions';

const SmartFeatures = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showContentGeneration, setShowContentGeneration] = useState(false);
  const [generatedPost, setGeneratedPost] = useState(null);
  const [generatingPost, setGeneratingPost] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const contentRef = useRef(null);
  const navigate = useNavigate();

  // Helper function to convert markdown to HTML for image generation
  const convertMarkdownToHTML = (markdown) => {
    if (!markdown) return '';
    
    return markdown
      // Bold text with **text** or __text__
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700; color: #111827;">$1</strong>')
      .replace(/__(.*?)__/g, '<strong style="font-weight: 700; color: #111827;">$1</strong>')
      // Italic text with *text* or _text_
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em style="font-style: italic;">$1</em>')
      .replace(/(?<!_)_([^_]+)_(?!_)/g, '<em style="font-style: italic;">$1</em>')
      // Headings
      .replace(/^### (.*$)/gm, '<h3 style="font-size: 1.125rem; font-weight: 600; margin: 16px 0 8px 0; color: #111827;">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 style="font-size: 1.25rem; font-weight: 600; margin: 20px 0 12px 0; color: #111827;">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 style="font-size: 1.5rem; font-weight: 700; margin: 24px 0 16px 0; color: #111827;">$1</h1>')
      // Line breaks and paragraphs
      .replace(/\n\n/g, '</p><p style="margin: 12px 0; color: #374151; line-height: 1.7;">')
      .replace(/\n/g, '<br>')
      // Wrap content in paragraph tags if not already wrapped
      .replace(/^(?!<[h1-6]|<p|<strong|<em)(.*)/, '<p style="margin: 12px 0; color: #374151; line-height: 1.7;">$1')
      .replace(/^(<p.*>.*?)$/, '$1</p>');
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.message || 'Failed to load user information');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToPackages = () => {
    navigate('/dashboard/packages');
  };

  const handleGeneratePost = async () => {
    try {
      setGeneratingPost(true);
      setError('');
      const postData = await generatePost();
      setGeneratedPost(postData);
      setShowContentGeneration(true);
    } catch (err) {
      console.error('Error generating post:', err);
      setError(err.message || 'Failed to generate post content');
    } finally {
      setGeneratingPost(false);
    }
  };

  const handleDownloadAsPNG = async () => {
    if (!contentRef.current || !generatedPost) {
      alert('No content to download. Please generate a post first.');
      return;
    }

    try {
      setDownloadingImage(true);

      // Create a temporary container for PNG rendering
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = `
        <div style="
          width: 800px;
          padding: 40px;
          background: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        ">
          <!-- Header -->
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
            <div style="
              width: 48px;
              height: 48px;
              background: linear-gradient(135deg, #7c3aed, #3b82f6);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 18px;
            ">SB</div>
            <div>
              <div style="font-weight: 600; color: #111827; font-size: 18px;">SmartBiz</div>
              <div style="color: #6b7280; font-size: 14px;">AI Generated Post • ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          
          <!-- Content -->
          <div style="
            color: #374151;
            font-size: 16px;
            line-height: 1.7;
            margin: 24px 0;
          ">${convertMarkdownToHTML(generatedPost.content)}</div>
          
          <!-- Footer -->
          <div style="
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            color: #6b7280;
            font-size: 14px;
          ">
            <span>Generated by SmartBiz AI</span>
            <span>smartbiz.ai</span>
          </div>
        </div>
      `;

      // Position off-screen temporarily
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      document.body.appendChild(tempContainer);

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(tempContainer.firstElementChild, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      // Clean up
      document.body.removeChild(tempContainer);

      // Convert canvas to image and download
      const link = document.createElement('a');
      link.download = `SmartBiz_Post_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error downloading PNG:', error);
      alert(`Failed to download PNG: ${error.message || 'Unknown error'}`);
    } finally {
      setDownloadingImage(false);
    }
  };

  const handleDownloadAsJPG = async () => {
    if (!contentRef.current || !generatedPost) {
      alert('No content to download. Please generate a post first.');
      return;
    }

    try {
      setDownloadingImage(true);

      // Create a temporary container for JPG rendering
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = `
        <div style="
          width: 800px;
          padding: 40px;
          background: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        ">
          <!-- Header -->
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
            <div style="
              width: 48px;
              height: 48px;
              background: linear-gradient(135deg, #7c3aed, #3b82f6);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 18px;
            ">SB</div>
            <div>
              <div style="font-weight: 600; color: #111827; font-size: 18px;">SmartBiz</div>
              <div style="color: #6b7280; font-size: 14px;">AI Generated Post • ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          
          <!-- Content -->
          <div style="
            color: #374151;
            font-size: 16px;
            line-height: 1.7;
            margin: 24px 0;
          ">${convertMarkdownToHTML(generatedPost.content)}</div>
          
          <!-- Footer -->
          <div style="
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            color: #6b7280;
            font-size: 14px;
          ">
            <span>Generated by SmartBiz AI</span>
            <span>smartbiz.ai</span>
          </div>
        </div>
      `;

      // Position off-screen temporarily
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      document.body.appendChild(tempContainer);

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(tempContainer.firstElementChild, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      // Clean up
      document.body.removeChild(tempContainer);

      // Convert canvas to JPEG and download
      const link = document.createElement('a');
      link.download = `SmartBiz_Post_${new Date().toISOString().split('T')[0]}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95); // 95% quality
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error downloading JPG:', error);
      alert(`Failed to download JPG: ${error.message || 'Unknown error'}`);
    } finally {
      setDownloadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 xs:p-3 sm:p-6 lg:p-8">
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  const isPro = user?.plan === 'PRO';

  return (
    <div className="p-2 xs:p-3 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Smart Features</h1>
            <p className="text-gray-600 mt-1">AI-powered tools to boost your business</p>
          </div>
        </div>

        {/* User Plan Info */}
        <div className="bg-gray-800/40 backdrop-blur-md rounded-lg shadow-lg border border-gray-700/50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${isPro ? 'bg-purple-600' : 'bg-gray-600'}`}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-100">{user?.name}</p>
                <p className="text-sm text-white">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Current Plan:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${isPro ? 'bg-purple-600/30 text-purple-400 border border-purple-500/50' : 'bg-gray-700/50 text-gray-200 border border-gray-600/50'}`}>
                {user?.plan}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isPro ? (
        /* PRO Plan Features */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Suggestions Card */}
            <div className="bg-gray-800/40 backdrop-blur-md rounded-lg shadow-lg border border-gray-700/50 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gray-900/60 p-6 border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-100">Business Suggestions</h3>
                    <p className="text-gray-400">AI-powered insights for growth</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-100 mb-6">Get personalized business recommendations based on your data and market trends to improve performance and increase revenue.</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Market trend analysis
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Performance optimization tips
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Revenue growth strategies
                  </div>
                </div>
                <button 
                  onClick={() => setShowSuggestions(true)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Get Suggestions
                </button>
              </div>
            </div>

            {/* Post Generation Card */}
            <div className="bg-gray-800/40 backdrop-blur-md rounded-lg shadow-lg border border-gray-700/50 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gray-900/60 p-6 border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-100">Content Generation</h3>
                    <p className="text-gray-400">AI-powered content creation</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-300 mb-6">Generate engaging social media posts, marketing content, and business communications with our advanced AI writing assistant.</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Social media posts
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Marketing content
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Business emails
                  </div>
                </div>
                <button 
                  onClick={handleGeneratePost}
                  disabled={generatingPost}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingPost ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </div>
                  ) : (
                    'Create Content'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Additional PRO Features Info */}
          <div className="bg-gray-800/40 backdrop-blur-md rounded-lg shadow-lg border border-gray-700/50 p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-100 mb-2">🎉 PRO Plan Active!</h3>
                <p className="text-gray-300">You have access to all premium AI-powered features. Unlock your business potential with smart insights and automation tools.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* NORMAL Plan - Upgrade Prompt */
        <div className="space-y-6">
          {/* Upgrade Prompt Card */}
          <div className="bg-gray-800/40 backdrop-blur-md rounded-lg shadow-lg border border-gray-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-8 text-white text-center border-b border-gray-700/50">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-10V7a3 3 0 00-6 0v2m0 4h6a1 1 0 011 1v6a1 1 0 01-1 1H7a1 1 0 01-1-1v-6a1 1 0 011-1h6z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-2">Upgrade Required</h2>
              <p className="text-orange-100 text-lg">Please upgrade your plan to access Smart Features</p>
            </div>
            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-100 mb-4">Unlock Premium AI Features</h3>
                <p className="text-gray-300 text-lg">Take your business to the next level with our PRO plan and get access to:</p>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100">AI Business Suggestions</h3>
                      <p className="text-white text-sm">Get personalized recommendations to grow your business</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-600/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100">Content Generation</h3>
                      <p className="text-white text-sm">Create marketing content and social media posts with AI</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100">Advanced Analytics</h3>
                      <p className="text-white text-sm">Deep insights into your business performance</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-600/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100">Priority Support</h3>
                      <p className="text-white text-sm">Get faster support and dedicated assistance</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upgrade Button */}
              <div className="text-center">
                <button
                  onClick={handleNavigateToPackages}
                  className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 transition-colors transform hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Upgrade to PRO Plan
                </button>
                <p className="text-white text-sm mt-3">
                  Unlock all features and take your business to the next level
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Generation Modal */}
      {showContentGeneration && generatedPost && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Generated Content</h3>
                    <p className="text-purple-100 text-sm">AI-powered marketing post</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowContentGeneration(false)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Your Marketing Post</h3>
                    <p className="text-purple-600 text-sm">Ready to copy and share!</p>
                  </div>
                </div>

                {/* Generated Content Display */}
                <div 
                  ref={contentRef}
                  data-html2canvas-content
                  className="bg-white rounded-lg border border-purple-200 p-6 shadow-sm"
                  style={{ 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    minHeight: '300px'
                  }}
                >
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">SB</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">SmartBiz</h4>
                      <p className="text-sm text-gray-500">AI Generated Post • {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {/* Post Content */}
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed text-base">
                    <ReactMarkdown
                      components={{
                        // Custom styling for markdown elements
                        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-gray-900">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-gray-900">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-medium mb-2 text-gray-900">{children}</h3>,
                        p: ({ children }) => <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>,
                        strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
                        em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700">{children}</ol>,
                        li: ({ children }) => <li className="text-gray-700">{children}</li>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 mb-3">{children}</blockquote>,
                        code: ({ children }) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-purple-600">{children}</code>
                      }}
                    >
                      {generatedPost.content}
                    </ReactMarkdown>
                  </div>
                  
                  {/* Post Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Generated by SmartBiz AI</span>
                      <span>smartbiz.ai</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <button 
                    onClick={() => navigator.clipboard.writeText(generatedPost.content)}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy to Clipboard
                  </button>
                  <button 
                    onClick={handleGeneratePost}
                    disabled={generatingPost}
                    className="flex items-center gap-2 bg-white border-2 border-purple-200 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors font-medium disabled:opacity-50"
                  >
                    {generatingPost ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Generate New
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handleDownloadAsPNG}
                    disabled={downloadingImage}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {downloadingImage ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Download PNG
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handleDownloadAsJPG}
                    disabled={downloadingImage}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {downloadingImage ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Download JPG
                      </>
                    )}
                  </button>
                  <button className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share on Social Media
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions Modal */}
      <Suggestions 
        isOpen={showSuggestions}
        onClose={() => setShowSuggestions(false)}
      />
    </div>
  );
};

export default SmartFeatures;