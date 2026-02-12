import { Resend } from 'resend';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  // 環境変数が設定されていない場合はスキップ（開発時）
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] RESEND_API_KEY not set, skipping email send');
    console.log('[Email] Would send:', { to: options.to, subject: options.subject });
    return { success: true, data: null };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'チェンメシ <noreply@resend.dev>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });

    if (error) {
      console.error('[Email] Send error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[Email] Send exception:', error);
    return { success: false, error };
  }
}
