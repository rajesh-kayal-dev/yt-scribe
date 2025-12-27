import Note from '../models/noteModel.js';

export async function createNote(req, res) {
  try {
    const { title, description, content, isAIGenerated, videoId, tags } = req.body || {};
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'title and content are required' });
    }

    const note = await Note.create({
      title,
      description: description || '',
      content,
      isAIGenerated: !!isAIGenerated,
      videoId: videoId || undefined,
      tags: Array.isArray(tags) ? tags : [],
    });

    return res.status(201).json({ success: true, note });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to create note' });
  }
}

export async function getNotes(req, res) {
  try {
    const notes = await Note.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, notes });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch notes' });
  }
}

export async function exportNotesAsPdf(req, res) {
  try {
    const notes = await Note.find({}).sort({ createdAt: -1 });
    
    // Create a new PDF document
    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument();
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=my-notes.pdf');
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Add content to the PDF
    doc.fontSize(24).text('My Notes', { align: 'center' });
    doc.moveDown();
    
    notes.forEach((note, index) => {
      doc.fontSize(18).text(`${index + 1}. ${note.title}`, { underline: true });
      doc.fontSize(12).text(`Created: ${new Date(note.createdAt).toLocaleString()}`);
      if (note.description) {
        doc.fontSize(12).text(`Description: ${note.description}`);
      }
      doc.fontSize(12).text('Content:', { continued: true }).text(note.content, { indent: 10 });
      doc.moveDown();
      
      // Add a page break if not the last note
      if (index < notes.length - 1) {
        doc.addPage();
      }
    });
    
    // Finalize the PDF and end the response
    doc.end();
    
  } catch (err) {
    console.error('Error generating PDF:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate PDF' });
  }
}
