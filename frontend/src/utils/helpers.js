/**
 * Utility functions for the application
 */

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (timeString) => {
  return timeString.substring(0, 5); // HH:MM format
};

export const downloadCSV = (data, filename) => {
  const csv = convertToCSV(data);
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';

  const keys = Object.keys(data[0]);
  const csv = [
    keys.join(','),
    ...data.map(row => keys.map(key => `"${row[key] || ''}"`).join(','))
  ];

  return csv.join('\n');
};

export const printTable = (elementId, title) => {
  const printWindow = window.open('', '', 'width=800,height=600');
  const element = document.getElementById(elementId);
  
  printWindow.document.write(`
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        h1 { color: #333; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${element.innerHTML}
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.print();
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const generateExcelReport = (data, filename) => {
  // This is a simplified version. For production, use xlsx library
  downloadCSV(data, filename + '.csv');
};

export const getStatusColor = (status) => {
  const colors = {
    'scheduled': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
    'allocated': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getRoleColor = (role) => {
  const colors = {
    'admin': 'bg-purple-100 text-purple-800',
    'staff': 'bg-blue-100 text-blue-800',
    'student': 'bg-green-100 text-green-800'
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};
