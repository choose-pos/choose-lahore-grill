import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_KEY);

export async function POST(request: NextRequest) {
  try {
    const {
      firstname,
      lastname,
      phonenumber,
      email,
      eventdate,
      noofpeople,
      management_message,
      occasion,
      budgetPerPerson,
    } = await request.json();

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Catering Inquiry</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #222; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #4a5568; }
          .info { margin-bottom: 20px; }
          .label { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>New Party Inquiry</h1>
          <div class="info">
            <p><span class="label">Name:</span> ${firstname} ${lastname}</p>
            <p><span class="label">Phone:</span> ${phonenumber}</p>
            <p><span class="label">Email:</span> ${email}</p>
            <p><span class="label">Event Date:</span> ${eventdate}</p>
            <p><span class="label">Number of People:</span> ${noofpeople}</p>
            <p><span class="label">Occasion:</span> ${occasion}</p>
            <p><span class="label">Of hours:</span> ${budgetPerPerson}</p>
            <p><span class="label">Message:</span> ${management_message}</p>
           
          </div>
        </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: "Lahore Grill <lahoregrill@updates.lahoregrill.com>",
      to: ["altaf1.mughal@gmail.com"],
      subject: "Lahore Grill: Party Inquiry",
      html: htmlTemplate,
    });

    if (error || !data) {
      console.error("Error sending email:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Email sent successfully", id: data.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in API handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
