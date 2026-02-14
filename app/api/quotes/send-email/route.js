import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const pdfFile = formData.get("file");
    const email = formData.get("email");
    const quoteNumber = formData.get("quoteNumber");
    const clientName = formData.get("clientName");

    if (!pdfFile) {
      return NextResponse.json({ error: "PDF file is missing" }, { status: 400 });
    }

    if (!email || email.trim() === '') {
      return NextResponse.json({ error: "Client email is not available. Please add an email address to the client before sending." }, { status: 400 });
    }

    const buffer = Buffer.from(await pdfFile.arrayBuffer());

    // Configure your SMTP settings
    const transporter = nodemailer.createTransport({
      service: "gmail", // or your provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Pack & Attack" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Quotation ${quoteNumber} - Pack & Attack Removal Ltd`,
      text: `Hello ${clientName},\n\nPlease find your requested quotation attached.\n\nBest regards,\nPack & Attack Team`,
      attachments: [
        {
          filename: `Quote_${quoteNumber}.pdf`,
          content: buffer,
        },
      ],
    });

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}