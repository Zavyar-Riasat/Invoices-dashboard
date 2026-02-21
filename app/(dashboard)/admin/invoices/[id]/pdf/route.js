import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Invoice from '@/app/lib/models/Invoice';
import { generateInvoicePDF } from '@/app/lib/pdf/generateInvoicePDF';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;

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

    // Company information
    const companyInfo = {
      name: "Pack & Attack Removal Ltd",
      address: "Based in London — proudly serving all of Greater London, with nationwide moves available.",
      phone: "07577 441 654 / 07775 144 475",
      email: "info@Packattackremovalltd.com",
      website: "www.packattackremovals.com",
    };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoice, companyInfo);

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice_${invoice.invoiceNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}