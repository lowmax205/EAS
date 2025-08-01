// API Connection Test Component
// frontend/src/components/dev/ApiTestComponent.jsx

import React, { useState, useEffect } from 'react';
import { authApiService, campusApiService, performHealthCheck } from '../../services';

const ApiTestComponent = () => {
  const [apiStatus, setApiStatus] = useState(null);
  const [healthCheck, setHealthCheck] = useState(null);
  const [campusData, setCampusData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Run initial health check
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    setLoading(true);
    try {
      console.log('[API Test] Starting API connection test...');
      
      // Test health check first (no auth required)
      try {
        const healthResponse = await fetch('http://127.0.0.1:8000/api/v1/health/');
        const healthData = await healthResponse.json();
        console.log('[API Test] Health check result:', healthData);
        setHealthCheck({ success: true, data: healthData });
      } catch (healthError) {
        console.error('[API Test] Health check failed:', healthError);
        setHealthCheck({ success: false, error: healthError.message });
      }
      
      // Test our service health check
      const serviceHealth = await performHealthCheck();
      console.log('[API Test] Service health check result:', serviceHealth);
      
      // Test campus API (will fail without auth, but shows connection)
      const campusResult = await campusApiService.listCampuses();
      setCampusData(campusResult);
      console.log('[API Test] Campus API result:', campusResult);
      
      setApiStatus('success');
    } catch (error) {
      console.error('[API Test] Error testing API:', error);
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const testAuthStatus = () => {
    const isAuth = authApiService.isAuthenticated();
    const currentCampus = authApiService.getCurrentCampus();
    console.log('[API Test] Auth status:', { isAuth, currentCampus });
    return { isAuth, currentCampus };
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      background: '#fff', 
      border: '2px solid #ccc',
      borderRadius: '8px',
      padding: '16px',
      maxWidth: '400px',
      zIndex: 9999,
      fontSize: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>🔧 API Connection Test</h4>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Status:</strong> {loading ? '🔄 Testing...' : apiStatus === 'success' ? '✅ Connected' : '❌ Error'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Auth:</strong> {testAuthStatus().isAuth ? '✅ Authenticated' : '❌ Not authenticated'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Campus:</strong> {testAuthStatus().currentCampus || 'None'}
      </div>
      
      {healthCheck && (
        <div style={{ marginBottom: '8px' }}>
          <strong>Health:</strong> {healthCheck.services?.auth?.success ? '✅' : '❌'} Auth, {healthCheck.services?.campus?.success ? '✅' : '❌'} Campus
        </div>
      )}
      
      {campusData && (
        <div style={{ marginBottom: '8px' }}>
          <strong>Campuses:</strong> {campusData.success ? `✅ ${campusData.data?.length || 0} found` : '❌ Failed to load'}
        </div>
      )}
      
      <button 
        onClick={testApiConnection}
        disabled={loading}
        style={{ 
          padding: '4px 8px', 
          fontSize: '10px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Retest API'}
      </button>
    </div>
  );
};

export default ApiTestComponent;
