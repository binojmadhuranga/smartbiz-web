import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAvailablePlans, getUserPlan, upgradeToPro, downgradeToNormal, getPlanDisplayInfo } from '../../services/packageService';

const Packages = () => {
  const { user, updateUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState('NORMAL');
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch available plans
      const availablePlans = await getAvailablePlans();
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

  const handlePlanUpgrade = async (targetPlan) => {
    if (!user?.id) {
      setError('User information not available. Please refresh the page.');
      return;
    }

    try {
      setUpgrading(true);
      setError('');
      setSuccess('');
      
      let updatedUser;
      if (targetPlan === 'PRO') {
        updatedUser = await upgradeToPro(user.id);
        setSuccess('Successfully upgraded to Pro plan!');
      } else {
        updatedUser = await downgradeToNormal(user.id);
        setSuccess('Successfully changed to Normal plan!');
      }
      
      // Update current plan state
      setCurrentPlan(updatedUser.plan);
      
      // Update user in auth context if updateUser function is available
      if (updateUser) {
        updateUser(updatedUser);
      }
      
    } catch (error) {
      console.error('Error updating plan:', error);
      setError(error.message || 'Failed to update plan. Please try again.');
    } finally {
      setUpgrading(false);
    }
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
            ) : (
              <button
                onClick={() => handlePlanUpgrade(plan.id)}
                disabled={upgrading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  isPro
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                } ${upgrading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {upgrading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  <>
                    {plan.id === 'PRO' ? 'Upgrade to Pro' : 'Switch to Normal'}
                  </>
                )}
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
          Select the perfect plan for your business needs. Upgrade or downgrade at any time.
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

      {/* Additional Information */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help Choosing?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Normal Plan is great for:</h4>
            <ul className="space-y-1">
              <li>• Small businesses just getting started</li>
              <li>• Basic inventory management needs</li>
              <li>• Limited customer base</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Pro Plan is perfect for:</h4>
            <ul className="space-y-1">
              <li>• Growing businesses with complex needs</li>
              <li>• Advanced reporting and analytics</li>
              <li>• Multiple users and integrations</li>
              <li>• Priority customer support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Packages;