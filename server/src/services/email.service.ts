interface SendVerificationEmailParams {
  to: string;
  name: string;
  code: string;
}

const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || '';

export const sendVerificationEmail = async ({ to, name, code }: SendVerificationEmailParams): Promise<void> => {
  console.log('\n========================================');
  console.log('📧 VERIFICATION EMAIL');
  console.log('========================================');
  console.log(`To: ${to}`);
  console.log(`Name: ${name}`);
  console.log(`Code: ${code}`);
  console.log('========================================\n');

  if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: to,
            to_name: name,
            verification_code: code
          }
        })
      });

      if (!response.ok) {
        console.error('EmailJS error:', await response.text());
      } else {
        console.log('✅ Email sent successfully to', to);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  } else {
    console.log('⚠️  EmailJS not configured. Email not sent. Check your .env file.');
  }
};