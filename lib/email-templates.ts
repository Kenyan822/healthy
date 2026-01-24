// カテゴリラベル
const CATEGORY_LABELS: Record<string, string> = {
  general: '一般的な質問',
  bug: '不具合報告',
  feature: '機能要望',
  new_menu: '新メニュー情報',
  correction: '価格・栄養情報の訂正',
  other: 'その他',
};

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category;
}

// 管理者への通知メール
export function contactAdminNotification(data: {
  id: string;
  name: string | null;
  email: string;
  category: string;
  subject: string;
  message: string;
  chainName?: string;
  menuName?: string;
  sourceUrl?: string;
  createdAt: string;
}) {
  const categoryLabel = getCategoryLabel(data.category);
  const isInfoSubmission = ['new_menu', 'correction'].includes(data.category);

  return {
    subject: `【${isInfoSubmission ? '情報提供' : 'お問い合わせ'}】${data.subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #433422;">新しい${isInfoSubmission ? '情報提供' : 'お問い合わせ'}がありました</h2>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666; width: 120px;"><strong>ID</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.id}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;"><strong>名前</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.name || '（未入力）'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;"><strong>メール</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
              <a href="mailto:${data.email}">${data.email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;"><strong>カテゴリ</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${categoryLabel}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;"><strong>件名</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.subject}</td>
          </tr>
          ${data.chainName ? `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;"><strong>チェーン店</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.chainName}</td>
          </tr>
          ` : ''}
          ${data.menuName ? `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;"><strong>メニュー名</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.menuName}</td>
          </tr>
          ` : ''}
          ${data.sourceUrl ? `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;"><strong>情報源URL</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
              <a href="${data.sourceUrl}">${data.sourceUrl}</a>
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;"><strong>受信日時</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.createdAt}</td>
          </tr>
        </table>

        <h3 style="color: #433422; margin-top: 24px;">内容</h3>
        <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; white-space: pre-wrap;">
${data.message}
        </div>
      </div>
    `,
  };
}

// 送信者への確認メール
export function contactConfirmation(data: {
  name: string | null;
  subject: string;
  category: string;
}) {
  const categoryLabel = getCategoryLabel(data.category);
  const isInfoSubmission = ['new_menu', 'correction'].includes(data.category);
  const displayName = data.name || 'お客様';

  return {
    subject: `【ヘルシー検索】${isInfoSubmission ? '情報提供' : 'お問い合わせ'}を受け付けました`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <p>${displayName} 様</p>

        <p>この度は${isInfoSubmission ? '情報をご提供' : 'お問い合わせ'}いただき、ありがとうございます。</p>

        <p>以下の内容で受け付けました。</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f9f9f9; border-radius: 8px;">
          <tr>
            <td style="padding: 12px; color: #666; width: 100px;"><strong>カテゴリ</strong></td>
            <td style="padding: 12px;">${categoryLabel}</td>
          </tr>
          <tr>
            <td style="padding: 12px; color: #666;"><strong>件名</strong></td>
            <td style="padding: 12px;">${data.subject}</td>
          </tr>
        </table>

        <p>内容を確認の上、必要に応じてご連絡いたします。</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">

        <p style="color: #666; font-size: 14px;">
          ヘルシー検索<br>
          <a href="https://healthy-search.com" style="color: #90be6d;">https://healthy-search.com</a>
        </p>
      </div>
    `,
  };
}
