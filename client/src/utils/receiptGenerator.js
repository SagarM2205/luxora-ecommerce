import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatPrice } from './formatters';

export const generateReceipt = (order) => {
  const doc = new jsPDF();
  
  // Set up document properties
  doc.setProperties({
    title: `Receipt - ${order._id}`,
    subject: 'Order Receipt',
    author: 'LUXORA'
  });

  // Basic styling colors
  const primaryColor = [10, 10, 15]; // Almost black
  const accentColor = [124, 92, 252]; // Branding Indigo

  // Header
  doc.setFontSize(24);
  doc.setTextColor(...accentColor);
  doc.setFont('helvetica', 'bold');
  doc.text('LUXORA', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.text('Premium Fashion E-Commerce', 14, 28);

  // Receipt Title & Details
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT RECEIPT', 14, 45);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  doc.text(`Order ID: #${order._id.substring(0, 8).toUpperCase()}`, 14, 55);
  doc.text(`Date: ${orderDate}`, 14, 61);
  doc.text(`Payment: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay (Paid)'}`, 14, 67);

  // Billing To
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 120, 45);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const addr = order.shippingAddress;
  const addressLines = [
    addr.fullName,
    `Phone: ${addr.phone}`,
    addr.street,
    `${addr.city}, ${addr.state} - ${addr.pincode}`,
    addr.country
  ];

  addressLines.forEach((line, i) => {
    doc.text(line, 120, 52 + (i * 6));
  });

  // Items Table
  const tableColumn = ["Item", "Size", "Quantity", "Price", "Total"];
  const tableRows = [];

  order.items.forEach(item => {
    const itemData = [
      item.name,
      item.size || '-',
      item.quantity.toString(),
      formatPrice(item.price),
      formatPrice(item.price * item.quantity),
    ];
    tableRows.push(itemData);
  });

  autoTable(doc, {
    startY: 85,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { 
      fillColor: accentColor, 
      textColor: 255, 
      fontStyle: 'bold' 
    },
    styles: { 
      fontSize: 10,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 250]
    },
    margin: { top: 85 },
  });

  // Footer Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', 140, finalY);
  doc.setFont('helvetica', 'normal');
  doc.text(formatPrice(order.itemsPrice || order.totalPrice), 170, finalY);

  doc.setFont('helvetica', 'bold');
  doc.text('Tax (18%):', 140, finalY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(formatPrice(order.taxPrice || 0), 170, finalY + 7);

  let currentY = finalY + 14;

  if (order.discount > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94);
    doc.text(`Discount:`, 140, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`-${formatPrice(order.discount)}`, 170, currentY);
    doc.setTextColor(10, 10, 15);
    currentY += 7;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Shipping:', 140, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(formatPrice(order.shippingPrice || 0), 170, currentY);

  // Total Line
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(140, currentY + 4, 195, currentY + 4);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accentColor);
  doc.text('Total:', 140, currentY + 11);
  doc.text(formatPrice(order.totalPrice), 170, currentY + 11);

  // Bottom Footer message
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for shopping at Luxora!', 105, 280, { align: 'center' });
  doc.text('If you have any questions concerning this receipt, contact support@luxora.com', 105, 285, { align: 'center' });

  // Download logic
  doc.save(`Luxora_Receipt_${order._id.substring(0, 8).toUpperCase()}.pdf`);
};
