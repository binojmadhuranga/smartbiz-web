import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserProfile, updateCurrentUserProfile } from '../../services/user/userProfileManage';
import { useAuth } from '../../context/AuthContext';

const ProfileManage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getCurrentUserProfile();
      setProfile(response);
      setFormData({
        name: response.name,
        email: response.email,
        role: response.role
      });
      setError('');
    } catch (err) {
      setError('Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateCurrentUserProfile(formData);
      setSuccess('Profile updated successfully');
      await fetchProfile();
      setIsEditing(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: profile.name,
      email: profile.email,
      role: profile.role
    });
    setError('');
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 xs:p-3 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg xs:rounded-xl shadow-sm border border-gray-200 p-4 xs:p-6 mb-4 xs:mb-6">
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl xs:text-2xl lg:text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-sm xs:text-base text-gray-600 mt-1">Manage your account information</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm xs:text-base font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        {/* Profile Content */}
        <div className="bg-white rounded-lg xs:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {!isEditing ? (
            /* View Mode */
            <div className="p-4 xs:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 xs:gap-6 mb-6 xs:mb-8">
                {/* Avatar */}
                <div className="w-20 h-20 xs:w-24 xs:h-24 lg:w-28 lg:h-28 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl xs:text-3xl lg:text-4xl mx-auto sm:mx-0 flex-shrink-0">
                  {profile?.name.charAt(0).toUpperCase()}
                </div>
                
                {/* Basic Info */}
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-2xl xs:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{profile?.name}</h2>
                  <p className="text-lg xs:text-xl text-gray-600 mb-2">{profile?.email}</p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      profile?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {profile?.role}
                    </span>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      profile?.plan === 'PRO' || profile?.plan === 'PREMIUM' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {profile?.plan} Plan
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                    <p className="text-base xs:text-lg text-gray-900 p-3 bg-gray-50 rounded-lg">{profile?.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                    <p className="text-base xs:text-lg text-gray-900 p-3 bg-gray-50 rounded-lg">{profile?.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">User ID</label>
                    <p className="text-base xs:text-lg text-gray-900 p-3 bg-gray-50 rounded-lg">{profile?.id}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Account Role</label>
                    <p className="text-base xs:text-lg text-gray-900 p-3 bg-gray-50 rounded-lg">{profile?.role}</p>
                  </div>
                </div>
              </div>

              {/* Plan Information */}
              <div className="mt-6 xs:mt-8 p-4 xs:p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
                <h3 className="text-lg xs:text-xl font-semibold text-gray-900 mb-2">Current Plan</h3>
                <p className="text-2xl xs:text-3xl font-bold text-green-600 mb-2">{profile?.plan}</p>
                <p className="text-sm xs:text-base text-gray-600">
                  {profile?.plan === 'PRO' || profile?.plan === 'PREMIUM' 
                    ? 'Enjoy premium features and advanced functionality.' 
                    : 'Basic plan with essential features.'}
                </p>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <div className="p-4 xs:p-6 lg:p-8">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 xs:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-base"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-base"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-base"
                      placeholder="Your role"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>
                  </div>
                </div>

                <div className="flex flex-col xs:flex-row gap-3 mt-6 xs:mt-8">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileManage;