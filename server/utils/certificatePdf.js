const PDFDocument = require('pdfkit');

// Builds a certificate PDF in-memory and returns it as a Buffer
const buildCertificatePdf = (certificate) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#059669');
    doc.fontSize(28).fillColor('#059669').text('Certificate of Appreciation', { align: 'center' });
    doc.moveDown(1.5);
    doc.fontSize(14).fillColor('#1e293b').text('This certifies that', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(24).fillColor('#0f172a').text(certificate.volunteerName, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor('#1e293b').text(
      `has volunteered ${certificate.hours} hours for "${certificate.eventTitle}"`,
      { align: 'center' }
    );
    doc.moveDown(0.3);
    doc.text(`organised by ${certificate.organizationName}`, { align: 'center' });
    doc.moveDown(1.5);
    doc.fontSize(10).fillColor('#64748b').text(
      `Certificate Code: ${certificate.certificateCode} | Issued: ${new Date(certificate.issueDate).toLocaleDateString()}`,
      { align: 'center' }
    );
    doc.end();
  });
};

module.exports = { buildCertificatePdf };
