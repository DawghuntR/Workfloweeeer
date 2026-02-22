import PDFDocument from 'pdfkit';
import { Guide } from '@workfloweeeer/core';

export interface PdfExportOptions {
  pageSize?: 'A4' | 'LETTER';
  margin?: number;
  includeTableOfContents?: boolean;
  title?: string;
}

export async function exportToPdf(
  guide: Guide,
  options: PdfExportOptions = {}
): Promise<Buffer> {
  const {
    pageSize = 'A4',
    margin = 50,
    includeTableOfContents = true,
    title,
  } = options;
  
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: pageSize,
        margins: { top: margin, bottom: margin, left: margin, right: margin },
        bufferPages: true,
      });
      
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      const pageWidth = doc.page.width - margin * 2;
      
      doc.fontSize(24)
        .font('Helvetica-Bold')
        .text(title || guide.title, { align: 'center' });
      
      doc.moveDown(0.5);
      
      if (guide.description) {
        doc.fontSize(12)
          .font('Helvetica')
          .fillColor('#666666')
          .text(guide.description, { align: 'center' });
      }
      
      doc.moveDown(0.5);
      
      const createdDate = new Date(guide.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      doc.fontSize(10)
        .fillColor('#999999')
        .text(`Created: ${createdDate} • ${guide.steps.length} steps`, { align: 'center' });
      
      doc.moveDown(2);
      doc.fillColor('#000000');
      
      if (includeTableOfContents && guide.steps.length > 3) {
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .text('Table of Contents');
        
        doc.moveDown(0.5);
        
        guide.steps.forEach((step, index) => {
          doc.fontSize(11)
            .font('Helvetica')
            .text(`${index + 1}. ${step.title || `Step ${index + 1}`}`, {
              indent: 20,
            });
        });
        
        doc.addPage();
      }
      
      guide.steps.forEach((step, index) => {
        const yStart = doc.y;
        
        if (yStart > doc.page.height - margin - 200) {
          doc.addPage();
        }
        
        doc.fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('#3b82f6')
          .text(`Step ${index + 1}`, { continued: true })
          .fillColor('#000000')
          .text(` ${step.title || ''}`, { continued: false });
        
        doc.moveDown(0.5);
        
        if (step.description) {
          doc.fontSize(11)
            .font('Helvetica')
            .fillColor('#666666')
            .text(step.description);
          
          doc.moveDown(0.5);
        }
        
        doc.fontSize(9)
          .fillColor('#999999')
          .text(`Action: ${step.actionType.toUpperCase()}`);
        
        doc.moveDown(0.5);
        
        if (step.screenshotBase64) {
          const imageBuffer = Buffer.from(step.screenshotBase64, 'base64');
          
          try {
            const maxImageHeight = 300;
            const imageWidth = Math.min(pageWidth, 500);
            
            if (doc.y + maxImageHeight > doc.page.height - margin) {
              doc.addPage();
            }
            
            doc.image(imageBuffer, {
              fit: [imageWidth, maxImageHeight],
              align: 'center',
            });
            
            doc.moveDown(0.5);
          } catch (imgError) {
            doc.fontSize(10)
              .fillColor('#cc0000')
              .text('[Screenshot could not be rendered]');
            doc.moveDown(0.5);
          }
        }
        
        doc.fillColor('#000000');
        
        if (index < guide.steps.length - 1) {
          doc.moveDown(1.5);
          
          doc.strokeColor('#e5e7eb')
            .lineWidth(1)
            .moveTo(margin, doc.y)
            .lineTo(doc.page.width - margin, doc.y)
            .stroke();
          
          doc.moveDown(1.5);
        }
      });
      
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(9)
          .fillColor('#999999')
          .text(
            `Page ${i + 1} of ${pages.count}`,
            margin,
            doc.page.height - margin + 20,
            { align: 'center', width: pageWidth }
          );
      }
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
