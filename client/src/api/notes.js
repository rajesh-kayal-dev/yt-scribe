/**
 * Fetches all notes from the server
 * @returns {Promise<Object>} Response containing notes array
 */
export const fetchNotes = async () => {
  const response = await fetch('http://localhost:5000/api/notes');
  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }
  return await response.json();
};

/**
 * Creates a new note
 * @param {Object} noteData - The note data to create
 * @returns {Promise<Object>} The created note
 */
export const createNote = async (noteData) => {
  const response = await fetch('http://localhost:5000/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noteData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create note');
  }
  
  return await response.json();
};
