import axiosInstance from '../common/axiosConfig';

const REPORTS_BASE_URL = '/admin/reports';

/**
 * Get Users Report as PDF
 * @returns {Promise<Blob>} PDF blob data
 */
export const getUsersReportPDF = async () => {
  try {
    const response = await axiosInstance.get(`${REPORTS_BASE_URL}/users`, {
      responseType: 'blob', // Important for PDF files
      headers: {
        'Accept': 'application/pdf',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching users report PDF:', error);
    
    let errorMessage = 'Failed to fetch users report';
    if (error.response?.status === 401) {
      errorMessage = 'Unauthorized access. Please login again.';
    } else if (error.response?.status === 403) {
      errorMessage = 'Access denied. Admin privileges required.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Report endpoint not found.';
    } else if (error.response?.status === 500) {
      errorMessage = 'Server error while generating report.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Download Users Report PDF
 * @param {string} filename - Optional filename for download
 * @returns {Promise<void>}
 */
export const downloadUsersReportPDF = async (filename = 'users_report.pdf') => {
  try {
    const pdfBlob = await getUsersReportPDF();
    
    // Create download link
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading users report PDF:', error);
    throw error;
  }
};

/**
 * Get PDF URL for preview
 * @returns {Promise<string>} Object URL for PDF preview
 */
export const getUsersReportPDFUrl = async () => {
  try {
    const pdfBlob = await getUsersReportPDF();
    const url = window.URL.createObjectURL(pdfBlob);
    return url;
  } catch (error) {
    console.error('Error creating PDF URL for preview:', error);
    throw error;
  }
};

/**
 * Cleanup PDF URL (call this when component unmounts)
 * @param {string} url - The URL to revoke
 */
export const revokePDFUrl = (url) => {
  if (url) {
    window.URL.revokeObjectURL(url);
  }
};