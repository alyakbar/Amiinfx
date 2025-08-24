export function generatePurchaseConfirmationTemplate(
  name: string, 
  courseName: string, 
  amount: number, 
  currency: string,
  transactionId: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin: 0;">Amiin FX</h1>
          <p style="color: #666; margin: 5px 0;">Trading Excellence Platform</p>
        </div>
        
        <h2 style="color: #16a34a; text-align: center;">🎉 Purchase Confirmed!</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Hi ${name},
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          Thank you for your purchase! Your payment has been successfully processed and you now have access to:
        </p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
          <h3 style="color: #1e40af; margin: 0 0 10px 0;">${courseName}</h3>
          <p style="color: #666; margin: 0; line-height: 1.6;">
            You now have instant access to all course materials, video lessons, and exclusive content.
          </p>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="color: #075985; margin: 0 0 10px 0;">Payment Details:</h4>
          <p style="color: #0c4a6e; margin: 5px 0;">Amount: <strong>${currency} ${amount}</strong></p>
          <p style="color: #0c4a6e; margin: 5px 0;">Transaction ID: <strong>${transactionId}</strong></p>
          <p style="color: #0c4a6e; margin: 5px 0;">Date: <strong>${new Date().toLocaleDateString()}</strong></p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/course/dashboard" 
             style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin-right: 10px;">
            Access Your Course
          </a>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Go to Dashboard
          </a>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="color: #92400e; margin: 0 0 10px 0;">What's Next?</h4>
          <ul style="color: #78350f; margin: 0; padding-left: 20px; line-height: 1.6;">
            <li>Check your dashboard for course access</li>
            <li>Download any available course materials</li>
            <li>Join our exclusive community</li>
            <li>Start implementing the strategies immediately</li>
          </ul>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          If you have any questions or need assistance accessing your course, please don't hesitate to contact our support team.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
          <p style="color: #999; font-size: 14px;">
            Best regards,<br>
            The Amiin FX Team
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 10px;">
            This is an automated confirmation email. Please keep this for your records.
          </p>
        </div>
      </div>
    </div>
  `;
}
