import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAvailablePlans, getUserPlan, requestProPlanUpgrade, getPlanDisplayInfo } from '../../services/packageService';

const Packages = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState('NORMAL');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get available plans (now synchronous)
      const availablePlans = getAvailablePlans();
      setPlans(availablePlans);
      
      // Get current user plan
      try {
        const userData = await getUserPlan();
        setCurrentPlan(userData.plan || 'NORMAL');
      } catch (error) {
        // If API call fails, use the plan from auth context or default to NORMAL
        setCurrentPlan(user?.plan || 'NORMAL');
      }
    } catch (error) {
      console.error('Error fetching package data:', error);
      setError('Failed to load package information');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type (images and PDFs)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPG, PNG) or PDF');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };

  const handleProPlanRequest = async () => {
    if (!selectedFile) {
      setError('Please select a payment slip to upload');
      return;
    }

    if (!user?.id) {
      setError('User information not available. Please refresh the page.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      await requestProPlanUpgrade(user.id, selectedFile);
      setSuccess('Pro plan upgrade request submitted successfully! We will review your payment and update your plan within 24-48 hours.');
      setShowUploadModal(false);
      setSelectedFile(null);
      
    } catch (error) {
      console.error('Error requesting Pro plan:', error);
      setError(error.message || 'Failed to submit Pro plan request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openUploadModal = () => {
    setShowUploadModal(true);
    setError('');
    setSuccess('');
    setSelectedFile(null);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setError('');
  };

  const getPlanCard = (plan) => {
    const isCurrentPlan = currentPlan === plan.id;
    const isPro = plan.id === 'PRO';
    const planInfo = getPlanDisplayInfo(plan.id);
    
    return (
      <div
        key={plan.id}
        className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
          isCurrentPlan 
            ? 'border-green-500 ring-2 ring-green-200' 
            : 'border-gray-200 hover:border-gray-300'
        } ${isPro ? 'transform hover:scale-105' : ''}`}
      >
        {/* Current Plan Badge */}
        {isCurrentPlan && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              Current Plan
            </span>
          </div>
        )}
        
        {/* Pro Badge */}
        {isPro && (
          <div className="absolute -top-2 -right-2">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              POPULAR
            </span>
          </div>
        )}

        <div className="p-6 md:p-8">
          {/* Plan Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <div className="text-4xl font-bold mb-2">
              {plan.price === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                <>
                  <span className="text-gray-900">${plan.price}</span>
                  <span className="text-lg text-gray-500 font-normal">/month</span>
                </>
              )}
            </div>
            <p className="text-gray-600">
              {plan.id === 'NORMAL' 
                ? 'Perfect for getting started' 
                : 'Everything you need to grow your business'
              }
            </p>
          </div>

          {/* Features List */}
          <ul className="space-y-3 mb-8">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Action Button */}
          <div className="text-center">
            {isCurrentPlan ? (
              <button
                disabled
                className="w-full bg-gray-100 text-gray-500 py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
              >
                Current Plan
              </button>
            ) : isPro ? (
              <button
                onClick={openUploadModal}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Request Pro Upgrade
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-100 text-gray-500 py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
              >
                Downgrade Not Available
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
        <p className="text-gray-600 text-lg">
          Select the perfect plan for your business needs. Submit a payment slip to request Pro plan upgrade.
        </p>
        
        {/* Current Plan Display */}
        <div className="mt-4 inline-flex items-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <span className="text-blue-800 font-medium">
            Current Plan: {getPlanDisplayInfo(currentPlan).name}
          </span>
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold text-white ${
            currentPlan === 'PRO' ? 'bg-green-500' : 'bg-blue-500'
          }`}>
            {getPlanDisplayInfo(currentPlan).badge}
          </span>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Package Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map(plan => getPlanCard(plan))}
      </div>

      {/* Payment Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upload Payment Slip</h3>
              <button
                onClick={closeUploadModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                Please upload your payment slip for Pro plan ($29.99/month). Accepted formats: JPG, PNG, PDF (max 5MB)
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleFileSelect}
                  className="w-full"
                />
                {selectedFile && (
                  <div className="mt-2 text-sm text-green-600">
                    Selected: {selectedFile.name}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-4 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeUploadModal}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProPlanRequest}
                disabled={!selectedFile || submitting}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                  !selectedFile || submitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Additional Information */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upgrade Process</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">1</div>
            <h4 className="font-medium text-gray-900 mb-1">Make Payment</h4>
            <p>Transfer $29.99 to our account and get payment receipt</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">2</div>
            <h4 className="font-medium text-gray-900 mb-1">Upload Receipt</h4>
            <p>Upload your payment slip using the form above</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">3</div>
            <h4 className="font-medium text-gray-900 mb-1">Get Upgraded</h4>
            <p>We'll review and activate your Pro plan within 24-48 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Packages;