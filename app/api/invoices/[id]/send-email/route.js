import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Invoice from '@/app/lib/models/Invoice';
import nodemailer from 'nodemailer';
import { generateInvoicePDF } from '@/app/lib/pdf/generateInvoicePDF';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const { email, customMessage } = await request.json();

    console.log('📧 Sending invoice email for ID:', id, 'to:', email);

    // Check if email credentials exist
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email configuration error: EMAIL_USER and EMAIL_PASS must be set in environment variables' 
        },
        { status: 500 }
      );
    }

    // Find the invoice with populated data
    const invoice = await Invoice.findById(id)
      .populate('booking')
      .populate('client')
      .lean();

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Check if client email exists
    const recipientEmail = email || invoice.clientEmail;
    if (!recipientEmail || recipientEmail.trim() === '') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Client email is not available. Please add an email address to the client before sending.' 
        },
        { status: 400 }
      );
    }

    // Company information
    const companyInfo = {
      name: "Pack & Attack Removal Ltd",
      address: "Based in London — proudly serving all of Greater London, with nationwide moves available.",
      phone: "07577 441 654 / 07775 144 475",
      email: "info@Packattackremovalltd.com",
      website: "www.packattackremovals.com",
    };

    // Generate PDF using server-side function
    let pdfBuffer;
    try {
      pdfBuffer = await generateInvoicePDF(invoice, companyInfo);
    } catch (pdfError) {
      console.error('❌ Error generating PDF:', pdfError);
      return NextResponse.json(
        { success: false, error: 'Failed to generate PDF: ' + pdfError.message },
        { status: 500 }
      );
    }

    // Create email transporter - SIMPLIFIED like your quotes logic
    const transporter = nodemailer.createTransport({
      service: "gmail", // or your provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Default message if not provided
    const defaultMessage = `Dear ${invoice.clientName},

Please find attached your invoice ${invoice.invoiceNumber} for the amount of $${invoice.totalAmount}.

Invoice Details:
- Invoice Number: ${invoice.invoiceNumber}
- Invoice Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}
- Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}
- Total Amount: $${invoice.totalAmount}
- Amount Paid: $${invoice.amountPaid || 0}
- Remaining Balance: $${invoice.remainingAmount || invoice.totalAmount}

Payment Status: ${invoice.paymentStatus || 'unpaid'}

If you have any questions, please don't hesitate to contact us.

Thank you for your business!

Best regards,
${companyInfo.name}
${companyInfo.phone}
${companyInfo.email}
${companyInfo.website}`;

    // Email options
    const mailOptions = {
      from: `"${companyInfo.name}" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Invoice ${invoice.invoiceNumber} - ${companyInfo.name}`,
      text: customMessage || defaultMessage,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1E3A8A; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${companyInfo.name}</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #1E3A8A;">Invoice ${invoice.invoiceNumber}</h2>
            
            <p>Dear <strong>${invoice.clientName}</strong>,</p>
            
            <p>Please find attached your invoice for the amount of <strong>$${invoice.totalAmount}</strong>.</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1E3A8A;">Invoice Summary</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Invoice Number:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">${invoice.invoiceNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Invoice Date:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">${new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Due Date:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">${new Date(invoice.dueDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Total Amount:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">$${invoice.totalAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Amount Paid:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">$${invoice.amountPaid || 0}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Remaining Balance:</strong></td>
                  <td style="padding: 8px 0; text-align: right; color: ${invoice.remainingAmount > 0 ? '#DC2626' : '#059669'};">
                    $${invoice.remainingAmount || invoice.totalAmount}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Payment Status:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">
                    <span style="background-color: ${
                      invoice.paymentStatus === 'paid' ? '#DCFCE7' : 
                      invoice.paymentStatus === 'partial' ? '#FEF3C7' : '#FEE2E2'
                    }; padding: 4px 8px; border-radius: 4px; color: ${
                      invoice.paymentStatus === 'paid' ? '#166534' : 
                      invoice.paymentStatus === 'partial' ? '#92400E' : '#991B1B'
                    };">
                      ${(invoice.paymentStatus || 'unpaid').toUpperCase()}
                    </span>
                  </td>
                </tr>
              </table>
            </div>
            
            ${invoice.deliveryConfirmed ? `
              <div style="background-color: #DCFCE7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #166534;"><strong>✓ Delivery Confirmed</strong> on ${new Date(invoice.deliveryConfirmedAt).toLocaleDateString()}</p>
              </div>
            ` : ''}
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Thank you for your business!</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
            
            <div style="text-align: center; color: #666; font-size: 12px;">
              <p><strong>${companyInfo.name}</strong></p>
              <p>${companyInfo.address}</p>
              <p>Phone: ${companyInfo.phone} | Email: ${companyInfo.email}</p>
              <p>${companyInfo.website}</p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice_${invoice.invoiceNumber}.pdf`,
          content: Buffer.from(pdfBuffer),
          contentType: 'application/pdf',
        },
      ],
    };

    // Send email
    console.log('📤 Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);

    // Update invoice with email sent status
    await Invoice.findByIdAndUpdate(id, {
      emailSent: true,
      emailSentAt: new Date(),
      emailSentTo: recipientEmail,
      status: 'sent',
    });

    return NextResponse.json({
      success: true,
      message: 'Invoice sent successfully',
      messageId: info.messageId,
    });

  } catch (error) {
    console.error('❌ Error sending invoice email:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}