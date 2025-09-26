import axiosInstance from '../common/axiosConfig';

const BASE_URL = '/reports';

// Generate and download business report as PDF
export const downloadBusinessReport = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/business`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    });

    // Create blob URL for the PDF
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    
    // Extract filename from Content-Disposition header if available
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'business-report.pdf';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }
    
    // Create download link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL
    window.URL.revokeObjectURL(url);
    
    return {
      success: true,
      message: 'Business report downloaded successfully',
      filename
    };
  } catch (error) {
    console.error('Error downloading business report:', error);
    
    let errorMessage = 'Failed to download business report';
    if (error.response?.status === 401) {
      errorMessage = 'Unauthorized. Please login again.';
    } else if (error.response?.status === 403) {
      errorMessage = 'Access denied. You do not have permission to generate reports.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Report service not available.';
    } else if (error.response?.data) {
      errorMessage = error.response.data.message || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
};

// Get business report as blob for preview
export const getBusinessReportBlob = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/business`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    });

    // Create blob URL for preview
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    
    // Extract filename from Content-Disposition header if available
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'business-report.pdf';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }
    
    return {
      url,
      filename,
      blob
    };
  } catch (error) {
    console.error('Error getting business report blob:', error);
    
    let errorMessage = 'Failed to load business report';
    if (error.response?.status === 401) {
      errorMessage = 'Unauthorized. Please login again.';
    } else if (error.response?.status === 403) {
      errorMessage = 'Access denied. You do not have permission to generate reports.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Report service not available.';
    } else if (error.response?.data) {
      errorMessage = error.response.data.message || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
};

// Check if report generation is available
export const checkReportAvailability = async () => {
  try {
    const response = await axiosInstance.head(`${BASE_URL}/business`);
    return {
      available: true,
      status: response.status
    };
  } catch (error) {
    console.error('Error checking report availability:', error);
    return {
      available: false,
      status: error.response?.status || 0,
      message: error.response?.data?.message || 'Report service unavailable'
    };
  }
};