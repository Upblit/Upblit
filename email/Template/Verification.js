export default function generateVerificationEmail({ name, verificationLink }) {
  return `
  <div style="font-family: Arial, sans-serif; background:#f6f8fb; padding:40px 0; color:#0f172a;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:20px; overflow:hidden; border:1px solid #e2e8f0;">
      <div style="padding:40px; background:linear-gradient(180deg,#08111a 0%,#0f172a 100%); color:#ffffff;">
        <p style="margin:0 0 12px; text-transform:uppercase; letter-spacing:0.2em; font-size:12px; color:#67e8f9;">Upblit</p>
        <h1 style="margin:0; font-size:30px; line-height:1.2;">Verify your email address</h1>
        <p style="margin:14px 0 0; font-size:16px; line-height:1.6; color:#cbd5e1;">Hi ${name}, click the button below to finish creating your account.</p>
      </div>
      <div style="padding:40px;">
        <p style="margin:0 0 24px; font-size:15px; line-height:1.7; color:#334155;">This confirmation link will activate your account and let you sign in with email and password.</p>
        <a href="${verificationLink}" style="display:inline-block; background:#0f172a; color:#ffffff; text-decoration:none; padding:14px 22px; border-radius:999px; font-weight:700;">Confirm email</a>
        <p style="margin:24px 0 0; font-size:13px; line-height:1.6; color:#64748b;">If the button does not work, copy this link into your browser:<br /><a href="${verificationLink}" style="color:#0f172a; word-break:break-all;">${verificationLink}</a></p>
      </div>
    </div>
  </div>
  `;
}