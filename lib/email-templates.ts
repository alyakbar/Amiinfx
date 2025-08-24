export function generateOTPEmailTemplate(firstName: string, lastName: string, otp: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin: 0;">Amiin FX</h1>
          <p style="color: #666; margin: 5px 0;">Trading Excellence Platform</p>
        </div>
        
        <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Hi ${firstName} ${lastName},
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          Thank you for signing up with Amiin FX! To complete your registration, please use the verification code below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 8px;">
              ${otp}
            </span>
          </div>
        </div>
        
        <p style="color: #666; line-height: 1.6; text-align: center;">
          This code will expire in <strong>10 minutes</strong>.
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          If you didn't create an account with Amiin FX, please ignore this email.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
          <p style="color: #999; font-size: 14px;">
            Best regards,<br>
            The Amiin FX Team
          </p>
        </div>
      </div>
    </div>
  `;
}

export function generateWelcomeEmailTemplate(firstName: string, lastName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin: 0;">Amiin FX</h1>
          <p style="color: #666; margin: 5px 0;">Trading Excellence Platform</p>
        </div>
        
        <h2 style="color: #333; text-align: center;">Welcome to Amiin FX!</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Hi ${firstName} ${lastName},
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          Welcome to Amiin FX! Your account has been successfully created and verified. You can now access all our premium trading features:
        </p>
        
        <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
          <li>Premium trading signals</li>
          <li>Comprehensive trading courses</li>
          <li>1-on-1 coaching sessions</li>
          <li>Trading strategies and analysis</li>
          <li>Exclusive community access</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Access Your Dashboard
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          If you have any questions or need assistance, feel free to reach out to our support team.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
          <p style="color: #999; font-size: 14px;">
            Best regards,<br>
            The Amiin FX Team
          </p>
        </div>
      </div>
    </div>
  `;
}
