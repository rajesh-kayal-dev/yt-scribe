/**
 * Exports notes as a PDF file
 * @param {Array} notes - Array of note objects to export
 * @param {string} filename - Name of the file to download (without extension)
 */
export const exportNotesAsPdf = async (notes, filename = 'my-notes') => {
  try {
    const response = await fetch('http://localhost:5000/api/notes/export');
    
    if (!response.ok) {
      throw new Error('Failed to export notes');
    }
    
    // Create a blob from the response
    const blob = await response.blob();
    
    // Create a download link and trigger the download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error exporting notes:', error);
    throw error;
  }
};
