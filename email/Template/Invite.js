export default function generateInviteEmail({ name, inviteLink, organizationName }) {
    const safeName = name || "there";
    const safeOrganizationName = organizationName || "Upblit";

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>You have been invited</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                background: #0f172a;
                font-family: Arial, sans-serif;
                color: #e2e8f0;
            }
            .shell {
                max-width: 640px;
                margin: 0 auto;
                padding: 32px 20px;
            }
            .card {
                background: linear-gradient(180deg, #111827 0%, #0b1220 100%);
                border: 1px solid rgba(148, 163, 184, 0.18);
                border-radius: 20px;
                padding: 32px;
                box-shadow: 0 24px 80px rgba(15, 23, 42, 0.45);
            }
            .eyebrow {
                display: inline-block;
                padding: 6px 12px;
                border-radius: 999px;
                background: rgba(34, 197, 94, 0.12);
                color: #86efac;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }
            h1 {
                margin: 18px 0 12px;
                font-size: 30px;
                line-height: 1.15;
                color: #f8fafc;
            }
            p {
                margin: 0 0 14px;
                line-height: 1.7;
                color: #cbd5e1;
                font-size: 16px;
            }
            .cta {
                display: inline-block;
                margin: 20px 0 8px;
                padding: 14px 22px;
                border-radius: 14px;
                background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
                color: #04130a !important;
                text-decoration: none;
                font-weight: 700;
            }
            .linkbox {
                margin-top: 16px;
                padding: 14px 16px;
                border-radius: 14px;
                background: rgba(15, 23, 42, 0.72);
                border: 1px solid rgba(148, 163, 184, 0.18);
                word-break: break-all;
                color: #93c5fd;
                font-size: 13px;
            }
            .footer {
                margin-top: 24px;
                font-size: 12px;
                color: #94a3b8;
            }
        </style>
    </head>
    <body>
        <div class="shell">
            <div class="card">
                <span class="eyebrow">Invitation</span>
                <h1>${safeName}, you have been invited to ${safeOrganizationName}</h1>
                <p>
                    Someone on the ${safeOrganizationName} team created a secure invite for you.
                    Use the button below to review the invite and join the workspace.
                </p>
                <a class="cta" href="${inviteLink}">Accept invite</a>
                <div class="linkbox">${inviteLink}</div>
                <p>
                    If you were not expecting this email, you can safely ignore it.
                </p>
                <div class="footer">
                    © ${new Date().getFullYear()} ${safeOrganizationName}
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}