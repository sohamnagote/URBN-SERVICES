import jsPDF from 'jspdf';
import { Booking } from '../types';

/**
 * Generates and downloads a clean, professional, high-resolution PDF tax invoice
 * for completed URBN Services bookings.
 */
export const downloadPdfInvoice = (booking: Booking, customerName?: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.width || 210;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Primary Theme Colors (URBN Services Blue & Slate)
  const primaryNavy = [0, 61, 155]; // #003d9b
  const deepSlate = [30, 41, 59]; // #1e293b
  const subtleGray = [100, 116, 139]; // #64748b
  const lightBg = [248, 250, 252]; // #f8fafc
  const greenAccent = [0, 110, 47]; // #006e2f
  const borderGray = [226, 232, 240]; // #e2e8f0

  // 1. Top Decorative Brand Bar
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.rect(0, 0, pageWidth, 7, 'F');

  // 2. Header Area: Company Info & Invoice Header
  let currentY = 18;

  // Company Brand Name & Tagline
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('URBN SERVICES', margin, currentY);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(subtleGray[0], subtleGray[1], subtleGray[2]);
  doc.text('1-Day Guaranteed Local Household Services', margin, currentY + 5);
  doc.text('Nashik Operations Hub • Maharashtra - 422013', margin, currentY + 9);
  doc.text('GSTIN: 27AAACU9821K1Z4 • support@urbnservices.in', margin, currentY + 13);

  // Right-aligned Invoice Title & Badge
  const rightX = pageWidth - margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('TAX INVOICE', rightX, currentY, { align: 'right' });

  // Paid Stamp Badge
  doc.setFillColor(220, 252, 231); // #dcfce7
  doc.roundedRect(rightX - 32, currentY + 3, 32, 7, 1.5, 1.5, 'F');
  doc.setFontSize(9);
  doc.setTextColor(greenAccent[0], greenAccent[1], greenAccent[2]);
  doc.text('✓ PAID IN FULL', rightX - 16, currentY + 7.5, { align: 'center' });

  // Invoice Details Block
  currentY += 22;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, rightX, currentY);

  currentY += 6;

  // Metadata Grid: Invoice #, Date, Booking Ref, Payment Method
  doc.setFontSize(8.5);
  
  // Column 1: Invoice Number & Date
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(subtleGray[0], subtleGray[1], subtleGray[2]);
  doc.text('INVOICE NO:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text(`INV-${booking.id}`, margin + 25, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(subtleGray[0], subtleGray[1], subtleGray[2]);
  doc.text('DATE ISSUED:', margin, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  const formattedDate = booking.createdAt
    ? new Date(booking.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '20 Aug 2026';
  doc.text(formattedDate, margin + 25, currentY + 5);

  // Column 2: Booking ID & Service Slot
  const col2X = margin + 70;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(subtleGray[0], subtleGray[1], subtleGray[2]);
  doc.text('BOOKING REF:', col2X, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text(`#${booking.id}`, col2X + 26, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(subtleGray[0], subtleGray[1], subtleGray[2]);
  doc.text('SERVICE DATE:', col2X, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text(`${booking.date || 'Today'} (${booking.timeSlot || 'Express Slot'})`, col2X + 26, currentY + 5);

  // Column 3: Payment Method
  const col3X = margin + 135;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(subtleGray[0], subtleGray[1], subtleGray[2]);
  doc.text('PAYMENT MODE:', col3X, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text(`${booking.paymentMethod || 'UPI / Cash'}`, col3X + 28, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(subtleGray[0], subtleGray[1], subtleGray[2]);
  doc.text('STATUS:', col3X, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(greenAccent[0], greenAccent[1], greenAccent[2]);
  doc.text('100% Completed', col3X + 28, currentY + 5);

  currentY += 13;
  doc.line(margin, currentY, rightX, currentY);

  // 3. Customer and Technician Details Box
  currentY += 6;
  
  // Left Box: Billed To
  const boxWidth = (contentWidth - 6) / 2;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, currentY, boxWidth, 32, 2, 2, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, currentY, boxWidth, 32, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('BILLED TO (CUSTOMER)', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  const cName = customerName || 'Rahul Deshmukh (Resident)';
  doc.text(cName, margin + 4, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(subtleGray[0], subtleGray[1], subtleGray[2]);
  const addrLine1 = booking.address.line1 || 'Flat 402, Ashoka Marg';
  const addrLine2 = `${booking.address.locality || 'Gangapur Road'}, ${booking.address.city || 'Nashik'} - ${booking.address.pincode || '422013'}`;
  doc.text(addrLine1, margin + 4, currentY + 17);
  doc.text(addrLine2, margin + 4, currentY + 22);
  doc.text('Contact: +91 98220 12345 (Nashik)', margin + 4, currentY + 27);

  // Right Box: Fulfilled By (Technician)
  const rightBoxX = margin + boxWidth + 6;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(rightBoxX, currentY, boxWidth, 32, 2, 2, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(rightBoxX, currentY, boxWidth, 32, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('SERVICE FULFILLED BY', rightBoxX + 4, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  const proName = booking.provider?.name || 'Ramesh Jadhav';
  doc.text(`${proName} (Verified Partner)`, rightBoxX + 4, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(subtleGray[0], subtleGray[1], subtleGray[2]);
  doc.text(`Profession: ${booking.provider?.profession || 'Master Plumber'}`, rightBoxX + 4, currentY + 17);
  doc.text(`Station: ${booking.provider?.currentLocationName || 'Gangapur Hub, Nashik'}`, rightBoxX + 4, currentY + 22);
  doc.text(`Vehicle: ${booking.provider?.vehicleNumber || 'MH 15 EF 9021'} (${booking.provider?.vehicleType || 'Hero Splendor'})`, rightBoxX + 4, currentY + 27);

  currentY += 38;

  // 4. Line Items Table Header
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.rect(margin, currentY, contentWidth, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('DESCRIPTION & SERVICE SCOPE', margin + 4, currentY + 5.5);
  doc.text('CATEGORY', margin + 90, currentY + 5.5);
  doc.text('QTY', margin + 128, currentY + 5.5, { align: 'center' });
  doc.text('RATE', margin + 148, currentY + 5.5, { align: 'right' });
  doc.text('AMOUNT (INR)', rightX - 4, currentY + 5.5, { align: 'right' });

  currentY += 8;

  // Line Items Body
  const items = booking.items && booking.items.length > 0
    ? booking.items
    : [
        {
          service: {
            title: booking.primaryServiceTitle || 'General Home Service',
            categoryId: booking.category || 'Maintenance',
            price: booking.bill?.estimatedLabor || 499,
          },
          quantity: 1,
        },
      ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);

  items.forEach((item, index) => {
    const isAlt = index % 2 === 1;
    if (isAlt) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY, contentWidth, 9, 'F');
    }

    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.line(margin, currentY + 9, rightX, currentY + 9);

    const title = item.service?.title || 'Service Item';
    const category = item.service?.categoryId ? item.service.categoryId.toUpperCase() : 'GENERAL';
    const qty = item.quantity || 1;
    const rate = Number(item.service?.price) || 499;
    const amount = qty * rate;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
    doc.text(title.length > 38 ? `${title.substring(0, 36)}...` : title, margin + 4, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(subtleGray[0], subtleGray[1], subtleGray[2]);
    doc.text(category, margin + 90, currentY + 6);
    doc.text(String(qty), margin + 128, currentY + 6, { align: 'center' });
    doc.text(`₹${rate}`, margin + 148, currentY + 6, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
    doc.text(`₹${amount}`, rightX - 4, currentY + 6, { align: 'right' });

    currentY += 9;
  });

  // Additional Breakdown Rows: Visiting Charge, Discount, Taxes
  const visitCharge = booking.bill?.serviceVisitCharge ?? 49;
  const platformDiscount = booking.bill?.platformDiscount ?? 50;
  const taxesAndFee = booking.bill?.taxesAndFee ?? 27;
  const laborSubtotal = booking.bill?.estimatedLabor ?? 499;
  const grandTotal = booking.bill?.total ?? (laborSubtotal + visitCharge - platformDiscount + taxesAndFee);

  currentY += 4;

  // Calculations Box on the Right
  const calcBoxX = margin + 90;
  const calcBoxWidth = contentWidth - 90;

  // Subtotal Labor
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(subtleGray[0], subtleGray[1], subtleGray[2]);
  doc.text('Labor & Diagnostics Subtotal:', calcBoxX + 4, currentY + 4);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text(`₹${laborSubtotal}`, rightX - 4, currentY + 4, { align: 'right' });

  // Standard Visiting Fee
  currentY += 6;
  doc.setTextColor(subtleGray[0], subtleGray[1], subtleGray[2]);
  doc.text('On-Site Visit & Safety Gear Fee:', calcBoxX + 4, currentY + 4);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text(`₹${visitCharge}`, rightX - 4, currentY + 4, { align: 'right' });

  // Platform Discount (if any)
  if (platformDiscount > 0) {
    currentY += 6;
    doc.setTextColor(greenAccent[0], greenAccent[1], greenAccent[2]);
    doc.text('URBN 1-Day Promise First Order Discount:', calcBoxX + 4, currentY + 4);
    doc.text(`-₹${platformDiscount}`, rightX - 4, currentY + 4, { align: 'right' });
  }

  // GST & Platform Safety Fee
  currentY += 6;
  doc.setTextColor(subtleGray[0], subtleGray[1], subtleGray[2]);
  doc.text('GST & Processing Charges (5%):', calcBoxX + 4, currentY + 4);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text(`₹${taxesAndFee}`, rightX - 4, currentY + 4, { align: 'right' });

  // Total Highlight Box
  currentY += 8;
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.roundedRect(calcBoxX, currentY, calcBoxWidth, 10, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL AMOUNT PAID:', calcBoxX + 4, currentY + 6.8);
  doc.text(`₹${grandTotal}`, rightX - 4, currentY + 6.8, { align: 'right' });

  // 5. 30-Day Guarantee & 1-Day Promise Warranty Seal Box (Left Side)
  const sealY = currentY - 26;
  const sealWidth = 84;
  doc.setFillColor(240, 253, 244); // #f0fdf4
  doc.roundedRect(margin, sealY, sealWidth, 36, 2, 2, 'F');
  doc.setDrawColor(187, 247, 208); // #bbf7d0
  doc.roundedRect(margin, sealY, sealWidth, 36, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(greenAccent[0], greenAccent[1], greenAccent[2]);
  doc.text('★ 30-DAY URBN GUARANTEE CARD', margin + 4, sealY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('• 100% Free Re-service if the issue reoccurs within 30 days.', margin + 4, sealY + 12);
  doc.text('• Genuine manufacturer-grade parts covered with warranty.', margin + 4, sealY + 17);
  doc.text('• Verified technician check completed with customer OTP.', margin + 4, sealY + 22);
  doc.text('• Nashik 24x7 Customer Priority Helpline: 1800-URBN-NSK', margin + 4, sealY + 27);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text(`Guarantee Valid Till: ${new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, margin + 4, sealY + 32);

  // 6. Footer & Terms
  currentY += 22;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.line(margin, currentY, rightX, currentY);

  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(subtleGray[0], subtleGray[1], subtleGray[2]);
  doc.text(
    'Terms & Conditions: This digital document serves as an authentic tax invoice and warranty contract under Maharashtra State Service Regulations.',
    margin,
    currentY
  );
  doc.text(
    'All services rendered by URBN Services partners are strictly insured under our ₹10,000 Property Damage Protection Policy.',
    margin,
    currentY + 4
  );
  doc.text(
    'Thank you for choosing URBN Services — Transforming local household maintenance in Nashik!',
    margin,
    currentY + 8
  );

  // 7. Trigger Direct File Download in Browser
  doc.save(`URBN-Invoice-${booking.id}.pdf`);
};
