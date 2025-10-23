// app/components/AdmissionLetterPDF.tsx
"use client";

import { AdmissionLetter } from '@/app/types/admission.types';

interface AdmissionLetterPDFProps {
  letter: AdmissionLetter;
}

export const generateAdmissionLetterPDF = (letter: AdmissionLetter) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow pop-ups to generate the PDF');
    return;
  }

  const gradeLabels: Record<string, string> = {
    'klasse_1': 'Klasse 1',
    'klasse_2': 'Klasse 2',
    'klasse_3': 'Klasse 3',
    'klasse_4': 'Klasse 4',
    'klasse_5': 'Klasse 5',
    'klasse_6': 'Klasse 6',
    'klasse_7': 'Klasse 7',
    'klasse_8': 'Klasse 8',
    'klasse_9': 'Klasse 9',
    'klasse_10': 'Klasse 10',
    'klasse_11': 'Klasse 11',
    'klasse_12': 'Klasse 12',
  };

  const currentDate = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admission Letter - ${letter.admission_number}</title>
      <style>
        @media print {
          @page {
            size: A4;
            margin: 2cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Georgia', 'Times New Roman', serif;
          line-height: 1.6;
          color: #333;
          background: white;
          padding: 40px;
          max-width: 210mm;
          margin: 0 auto;
        }

        .letterhead {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #1e40af;
        }

        .school-name {
          font-size: 28px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }

        .school-details {
          font-size: 12px;
          color: #666;
          line-height: 1.4;
        }

        .letter-header {
          margin-bottom: 30px;
        }

        .letter-date {
          text-align: right;
          font-size: 14px;
          color: #666;
          margin-bottom: 30px;
        }

        .reference-number {
          font-size: 14px;
          color: #666;
          margin-bottom: 20px;
        }

        .letter-title {
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          color: #1e40af;
          margin: 30px 0;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .letter-body {
          font-size: 14px;
          text-align: justify;
          margin-bottom: 30px;
        }

        .letter-body p {
          margin-bottom: 15px;
        }

        .student-info {
          background: #f8fafc;
          padding: 20px;
          border-left: 4px solid #1e40af;
          margin: 25px 0;
        }

        .student-info h3 {
          font-size: 16px;
          color: #1e40af;
          margin-bottom: 12px;
        }

        .info-row {
          display: flex;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .info-label {
          font-weight: bold;
          width: 180px;
          color: #555;
        }

        .info-value {
          color: #333;
        }

        .important-notice {
          background: #fef3c7;
          border: 2px solid #f59e0b;
          padding: 15px;
          margin: 25px 0;
          border-radius: 4px;
        }

        .important-notice h4 {
          color: #92400e;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .important-notice p {
          font-size: 13px;
          color: #92400e;
        }

        .next-steps {
          margin: 25px 0;
        }

        .next-steps h3 {
          font-size: 16px;
          color: #1e40af;
          margin-bottom: 12px;
        }

        .next-steps ol {
          margin-left: 25px;
          font-size: 14px;
        }

        .next-steps li {
          margin-bottom: 10px;
        }

        .signature-section {
          margin-top: 60px;
        }

        .signature-block {
          text-align: right;
          margin-top: 80px;
        }

        .signature-line {
          border-top: 1px solid #333;
          width: 250px;
          margin-left: auto;
          padding-top: 8px;
          font-size: 13px;
          color: #666;
        }

        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          font-size: 11px;
          color: #666;
        }

        .contact-info {
          margin-top: 10px;
          line-height: 1.6;
        }

        @media print {
          .no-print {
            display: none;
          }
        }

        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 24px;
          background: #1e40af;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .print-button:hover {
          background: #1e3a8a;
        }
      </style>
    </head>
    <body>
      <button class="print-button no-print" onclick="window.print()">
        🖨️ Print / Save as PDF
      </button>

      <div class="letterhead">
        <div class="school-name">Internationale Schule</div>
        <div class="school-details">
          Excellence in Education Since 2000<br>
          Musterstraße 123 | 60311 Frankfurt am Main | Deutschland<br>
          Tel: +49 (0) 69 1234 5678 | Email: info@internationale-schule.de
        </div>
      </div>

      <div class="letter-header">
        <div class="letter-date">${currentDate}</div>
        <div class="reference-number">
          <strong>Referenznummer:</strong> ${letter.admission_number}
        </div>
      </div>

      <div class="letter-title">
        Bestätigung der Schulzulassung<br>
        Admission Confirmation Letter
      </div>

      <div class="letter-body">
        <p>Sehr geehrte Eltern / Dear Parents,</p>
        
        <p>
          Wir freuen uns, Ihnen mitteilen zu können, dass Ihr Kind für das Schuljahr 
          <strong>${letter.academic_year}</strong> an unserer Schule aufgenommen wurde.
        </p>

        <p>
          We are pleased to inform you that your child has been accepted for admission 
          to our school for the academic year <strong>${letter.academic_year}</strong>.
        </p>

        <div class="student-info">
          <h3>📋 Schülerdaten / Student Information</h3>
          <div class="info-row">
            <span class="info-label">Name des Schülers / Student Name:</span>
            <span class="info-value">${letter.child_first_name} ${letter.child_last_name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Klasse / Grade Level:</span>
            <span class="info-value">${gradeLabels[letter.grade_level] || letter.grade_level}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Schuljahr / Academic Year:</span>
            <span class="info-value">${letter.academic_year}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Zulassungsnummer / Admission Number:</span>
            <span class="info-value">${letter.admission_number}</span>
          </div>
        </div>

        <div class="important-notice">
          <h4>⚠️ WICHTIG / IMPORTANT</h4>
          <p>
            Bitte verwenden Sie diese Zulassungsnummer bei der Online-Registrierung. 
            Sie benötigen diese Nummer zusammen mit dem Namen Ihres Kindes, um den 
            Registrierungsprozess abzuschließen.<br><br>
            Please use this admission number during online registration. You will need 
            this number along with your child's name to complete the registration process.
          </p>
        </div>

        <div class="next-steps">
          <h3>📝 Nächste Schritte / Next Steps</h3>
          <ol>
            <li>
              <strong>Online-Registrierung abschließen / Complete Online Registration</strong><br>
              Besuchen Sie unser Registrierungsportal und verwenden Sie die oben genannte 
              Zulassungsnummer.<br>
              Visit our registration portal and use the admission number provided above.
            </li>
            <li>
              <strong>Erforderliche Dokumente einreichen / Submit Required Documents</strong><br>
              Bitte reichen Sie alle erforderlichen Dokumente während der Registrierung ein.<br>
              Please submit all required documents during registration.
            </li>
            <li>
              <strong>Bestätigung abwarten / Wait for Confirmation</strong><br>
              Nach erfolgreichem Abschluss der Registrierung erhalten Sie eine Bestätigung.<br>
              You will receive a confirmation after successful registration completion.
            </li>
          </ol>
        </div>

        <p>
          Wir freuen uns darauf, Ihr Kind in unserer Schulgemeinschaft willkommen zu heißen 
          und gemeinsam eine erfolgreiche Bildungsreise zu beginnen.
        </p>

        <p>
          We look forward to welcoming your child to our school community and embarking 
          on a successful educational journey together.
        </p>

        <p style="margin-top: 20px;">
          Mit freundlichen Grüßen / Kind regards,
        </p>

        <div class="signature-section">
          <div class="signature-block">
            <div class="signature-line">
              Schulleitung / School Administration<br>
              Internationale Schule
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        <strong>Internationale Schule</strong><br>
        <div class="contact-info">
          Musterstraße 123, 60311 Frankfurt am Main, Deutschland<br>
          Telefon: +49 (0) 69 1234 5678 | Fax: +49 (0) 69 1234 5679<br>
          Email: info@internationale-schule.de | Web: www.internationale-schule.de<br>
          <em>This document is valid only with the reference number mentioned above</em>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load before focusing
  setTimeout(() => {
    printWindow.focus();
  }, 250);
};

export const AdmissionLetterPDFButton: React.FC<AdmissionLetterPDFProps> = ({ letter }) => {
  return (
    <button
      onClick={() => generateAdmissionLetterPDF(letter)}
      className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      title="Generate PDF Letter"
    >
      <svg 
        className="w-4 h-4 mr-1.5" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
        />
      </svg>
      PDF
    </button>
  );
};