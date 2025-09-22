import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAvailablePlans, getUserPlan, requestProPlanUpgrade, getPlanDisplayInfo } from '../../services/user/packageService';

const Packages = () => {
  const { user, updateUser } = useAuth();
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

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      // Use the new API structure that reads userId from JWT
      const result = await requestProPlanUpgrade(selectedFile);
      
      // Update current plan state
      setCurrentPlan('PRO');
      
      // Update user in auth context if updateUser function is available
      if (updateUser) {
        updateUser({ plan: 'PRO', id: result.userId });
      }
      
      setSuccess('Pro plan upgrade successful! Your plan has been updated.');
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
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <span className="bg-green-500 text-white px-3 py-0.5 rounded-full text-xs font-medium">
              Current Plan
            </span>
          </div>
        )}
        
        {/* Pro Badge */}
        {isPro && (
          <div className="absolute -top-2 -right-2">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
              POPULAR
            </span>
          </div>
        )}

        <div className="p-4 md:p-5">
          {/* Plan Header */}
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <div className="text-3xl font-bold mb-2">
              {plan.price === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                <>
                  <span className="text-gray-900">${plan.price}</span>
                  <span className="text-base text-gray-500 font-normal">/month</span>
                </>
              )}
            </div>
            <p className="text-gray-600 text-sm">
              {plan.id === 'NORMAL' 
                ? 'Perfect for getting started' 
                : 'Everything you need to grow your business'
              }
            </p>
          </div>

          {/* Features List */}
          <ul className="space-y-2 mb-5">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Action Button */}
          <div className="text-center">
            {isCurrentPlan ? (
              <button
                disabled
                className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-lg font-semibold cursor-not-allowed text-sm"
              >
                Current Plan
              </button>
            ) : isPro ? (
              <button
                onClick={openUploadModal}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm"
              >
                Request Pro Upgrade
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-lg font-semibold cursor-not-allowed text-sm"
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
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
        <p className="text-gray-600 text-base">
          Select the perfect plan for your business needs. Submit a payment slip to request Pro plan upgrade.
        </p>
        
        {/* Current Plan Display */}
        <div className="mt-3 inline-flex items-center bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
          <span className="text-blue-800 font-medium text-sm">
            Current Plan: {getPlanDisplayInfo(currentPlan).name}
          </span>
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold text-white ${
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {plans.map(plan => getPlanCard(plan))}
      </div>

      {/* Payment Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-200 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Upload Payment Slip
                </h3>
              </div>
              <button
                onClick={closeUploadModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Payment Details Section */}
            <div className="mb-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-green-800">Payment Details</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-xs text-gray-600">Account Holder Name</p>
                      <p className="text-sm font-semibold text-gray-900">Binoj Madhuranga</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-xs text-gray-600">Account Number</p>
                      <p className="text-sm font-semibold text-gray-900">3997427</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-xs text-gray-600">Branch</p>
                      <p className="text-sm font-semibold text-gray-900">Divulapitiya</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Amount to Transfer</p>
                    <p className="text-xl font-bold text-green-600">$29.99</p>
                    <p className="text-xs text-gray-500">Monthly Pro Plan Fee</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-xs font-medium text-yellow-800">Important Note</p>
                    <p className="text-xs text-yellow-700">Transfer exact amount and upload payment slip below.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-4 text-center text-sm">
                Upload your payment slip for <span className="font-semibold text-green-600">Pro Plan ($29.99/month)</span>
              </p>
              
              <div className={`relative border-2 border-dashed rounded-lg p-4 transition-all duration-300 ${
                selectedFile 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
              }`}>
                <div className="text-center">
                  {!selectedFile ? (
                    <div className="space-y-2">
                      <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium text-sm mb-1">Drop your payment slip here</p>
                        <p className="text-xs text-gray-500">or click to browse files</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-green-700 font-semibold text-sm">File Selected Successfully!</p>
                        <p className="text-xs text-green-600">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Supported formats: <span className="font-medium">JPG, PNG, PDF</span> • Max size: <span className="font-medium">5MB</span>
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={closeUploadModal}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleProPlanRequest}
                disabled={!selectedFile || submitting}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform ${
                  !selectedFile || submitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-lg hover:scale-105'
                }`}
              >
                {submitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Submit Request</span>
                  </div>
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