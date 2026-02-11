/**
 * Email Service
 *
 * Handles sending emails for notifications:
 * - New tender invitations
 * - Deadline reminders (3 days, 1 day before)
 * - Bid submissions
 * - Contract signing requests
 *
 * Supports multiple backends:
 * - SendGrid API (direct)
 * - Firebase Functions (HTTP callable)
 * - Firebase Extensions Trigger Email (via Firestore)
 */

import { getDocument } from "../services/firestore";

/**
 * Map email/notification type to user preference key.
 * Keys must match exactly: NotificationPreferencesSection.jsx DEFAULT_PREFERENCES / users.{userId}.notificationPreferences
 */
const EMAIL_TYPE_TO_PREFERENCE = {
    TENDER_INVITATION: "invitationNotifications",
    NEW_BID: "bidNotifications",
    CONTRACT_SIGNED: "contractNotifications",
    CONTRACT_UPDATED: "contractNotifications",
    DEADLINE_REMINDER: "deadlineReminderNotifications",
};

/** In-memory cache: userId -> { prefs } or { error: true }. Avoids repeated Firestore reads for same user in same execution. */
const preferenceCache = new Map();

/**
 * Check if the system should send an email to this user for the given notification type.
 * Loads users/{userId}.notificationPreferences and checks emailNotifications (master) and the specific toggle.
 * Fail-closed: if preferences cannot be loaded, returns false (do not send).
 * @param {string|null|undefined} userId - User ID (if missing, logs warning and returns true to preserve current behaviour when user unknown)
 * @param {string} notificationType - One of EMAIL_TYPE_TO_PREFERENCE keys (e.g. TENDER_INVITATION, NEW_BID)
 * @returns {Promise<boolean>} true if email should be sent, false otherwise
 */
export const shouldSendEmail = async (userId, notificationType) => {
    if (!userId) {
        console.warn("shouldSendEmail: missing userId, sending by default", {
            notificationType,
        });
        return true;
    }

    try {
        let entry = preferenceCache.get(userId);
        if (!entry) {
            const userDoc = await getDocument("users", userId);
            if (!userDoc) {
                console.warn(
                    "shouldSendEmail: user document not found, not sending",
                    { userId, notificationType },
                );
                preferenceCache.set(userId, { error: true });
                return false;
            }
            const prefs = userDoc.notificationPreferences || {};
            entry = { prefs };
            preferenceCache.set(userId, entry);
        }

        if (entry.error) {
            return false;
        }

        const preferences = entry.prefs;
        if (preferences.emailNotifications === false) return false;

        const preferenceKey = EMAIL_TYPE_TO_PREFERENCE[notificationType];
        if (!preferenceKey) return true;
        return preferences[preferenceKey] !== false;
    } catch (error) {
        console.error(
            "shouldSendEmail: could not verify preferences, not sending",
            { userId, notificationType, error },
        );
        preferenceCache.set(userId, { error: true });
        return false;
    }
};

/**
 * Email configuration
 * Can be set via environment variables or Firebase config
 */
const getEmailConfig = () => {
    return {
        // SendGrid API Key (if using SendGrid directly)
        sendGridApiKey: import.meta.env.VITE_SENDGRID_API_KEY || null,

        // Firebase Function URL (if using Cloud Functions)
        functionUrl: import.meta.env.VITE_EMAIL_FUNCTION_URL || null,

        // From email address
        fromEmail: import.meta.env.VITE_EMAIL_FROM || "noreply@smartplan.no",
        fromName:
            import.meta.env.VITE_EMAIL_FROM_NAME || "Smartplan Anskaffelse",

        // Base URL for links in emails
        baseUrl: import.meta.env.VITE_APP_URL || window.location.origin,

        // Enable/disable email sending (for development)
        enabled: import.meta.env.VITE_EMAIL_ENABLED !== "false",
    };
};

/**
 * Get user email address from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} User email or null
 */
const getUserEmail = async (userId) => {
    try {
        if (!userId) return null;
        const user = await getDocument("users", userId);
        return user?.email || null;
    } catch (error) {
        console.error("Error getting user email:", error);
        return null;
    }
};

/**
 * Send email using SendGrid API
 * @param {Object} emailData - Email data {to, subject, html, text}
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const sendEmailViaSendGrid = async (emailData) => {
    const config = getEmailConfig();

    if (!config.sendGridApiKey) {
        return {
            success: false,
            error: "SendGrid API key not configured",
        };
    }

    try {
        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${config.sendGridApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                personalizations: [
                    {
                        to: [{ email: emailData.to }],
                    },
                ],
                from: {
                    email: config.fromEmail,
                    name: config.fromName,
                },
                subject: emailData.subject,
                content: [
                    {
                        type: "text/plain",
                        value:
                            emailData.text ||
                            emailData.html.replace(/<[^>]*>/g, ""),
                    },
                    {
                        type: "text/html",
                        value: emailData.html,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("SendGrid error:", response.status, errorText);
            return {
                success: false,
                error: `SendGrid API error: ${response.status}`,
            };
        }

        return { success: true };
    } catch (error) {
        console.error("Error sending email via SendGrid:", error);
        return {
            success: false,
            error: error.message || "Failed to send email via SendGrid",
        };
    }
};

/**
 * Send email using Firebase Function
 * @param {Object} emailData - Email data {to, subject, html, text}
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const sendEmailViaFunction = async (emailData) => {
    const config = getEmailConfig();

    if (!config.functionUrl) {
        return {
            success: false,
            error: "Firebase Function URL not configured",
        };
    }

    try {
        const response = await fetch(config.functionUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                to: emailData.to,
                subject: emailData.subject,
                html: emailData.html,
                text: emailData.text || emailData.html.replace(/<[^>]*>/g, ""),
                from: config.fromEmail,
                fromName: config.fromName,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Function error:", response.status, errorText);
            return {
                success: false,
                error: `Function error: ${response.status}`,
            };
        }

        return { success: true };
    } catch (error) {
        console.error("Error sending email via Function:", error);
        return {
            success: false,
            error: error.message || "Failed to send email via Function",
        };
    }
};

/**
 * Send email using Firebase Extensions Trigger Email
 * Creates a document in the emails collection that triggers the extension
 * @param {Object} emailData - Email data {to, subject, html, text}
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const sendEmailViaExtension = async (emailData) => {
    try {
        const { createDocument } = await import("../services/firestore");
        const config = getEmailConfig();

        // Create email document that triggers the extension
        await createDocument("emails", {
            to: emailData.to,
            message: {
                subject: emailData.subject,
                html: emailData.html,
                text: emailData.text || emailData.html.replace(/<[^>]*>/g, ""),
            },
            from: config.fromEmail,
            fromName: config.fromName,
            createdAt: new Date(),
        });

        return { success: true };
    } catch (error) {
        console.error("Error sending email via Extension:", error);
        return {
            success: false,
            error: error.message || "Failed to send email via Extension",
        };
    }
};

/**
 * Send email using the configured method
 * @param {Object} emailData - Email data {to, subject, html, text}
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendEmail = async (emailData) => {
    const config = getEmailConfig();

    // Check if email is enabled
    if (!config.enabled) {
        console.log("Email sending is disabled. Email data:", emailData);
        return {
            success: true,
            skipped: true,
        };
    }

    // Validate required fields
    if (!emailData.to || !emailData.subject || !emailData.html) {
        return {
            success: false,
            error: "Missing required email fields",
        };
    }

    // Try SendGrid first, then Function, then Extension
    if (config.sendGridApiKey) {
        return await sendEmailViaSendGrid(emailData);
    } else if (config.functionUrl) {
        return await sendEmailViaFunction(emailData);
    } else {
        // Try Firebase Extension as fallback
        return await sendEmailViaExtension(emailData);
    }
};

/**
 * Generate HTML email template
 * @param {Object} options - Template options {title, content, actionUrl, actionText}
 * @returns {string} HTML email template
 */
const generateEmailTemplate = (options) => {
    const config = getEmailConfig();
    const { title, content, actionUrl, actionText } = options;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 20px 0; text-align: center; background-color: #1976d2;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Smartplan Anskaffelse</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 20px; background-color: #ffffff;">
                <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 20px;">${title}</h2>
                <div style="color: #666666; font-size: 16px; line-height: 1.6;">
                    ${content}
                </div>
                ${
                    actionUrl && actionText
                        ? `
                <div style="margin-top: 30px; text-align: center;">
                    <a href="${config.baseUrl}${actionUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1976d2; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 500;">${actionText}</a>
                </div>
                `
                        : ""
                }
            </td>
        </tr>
        <tr>
            <td style="padding: 20px; text-align: center; background-color: #f5f5f5; color: #999999; font-size: 12px;">
                <p style="margin: 0;">Dette er en automatisk e-post fra Smartplan Anskaffelse.</p>
                <p style="margin: 5px 0 0 0;">Du mottar denne e-posten fordi du er registrert i systemet.</p>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
};

/**
 * Send email for new tender invitation
 * @param {string} supplierEmail - Supplier email address
 * @param {Object} tender - Tender object
 * @param {string} supplierName - Supplier name (optional)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendTenderInvitationEmail = async (
    supplierEmail,
    tender,
    supplierName = null,
) => {
    if (!supplierEmail) {
        return { success: false, error: "Supplier email is required" };
    }

    const deadlineDate =
        tender.deadline instanceof Date
            ? tender.deadline
            : new Date(tender.deadline);
    const formattedDeadline = deadlineDate.toLocaleDateString("no-NO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const content = `
        <p>Hei${supplierName ? ` ${supplierName}` : ""},</p>
        <p>Du har blitt invitert til å by på følgende anskaffelse:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Tittel:</strong> ${tender.title}</p>
            ${tender.description ? `<p style="margin: 0 0 10px 0;"><strong>Beskrivelse:</strong> ${tender.description.substring(0, 200)}${tender.description.length > 200 ? "..." : ""}</p>` : ""}
            <p style="margin: 0 0 10px 0;"><strong>Frist:</strong> ${formattedDeadline}</p>
            ${tender.contractStandard ? `<p style="margin: 0;"><strong>Kontraktstandard:</strong> ${tender.contractStandard}</p>` : ""}
        </div>
        <p>Klikk på knappen under for å se detaljer og sende inn tilbud.</p>
    `;

    const html = generateEmailTemplate({
        title: "Ny invitasjon til Anskaffelse",
        content,
        actionUrl: `/tenders/${tender.id}`,
        actionText: "Se Anskaffelse",
    });

    return await sendEmail({
        to: supplierEmail,
        subject: `Invitasjon til Anskaffelse: ${tender.title}`,
        html,
    });
};

/**
 * Send email for deadline reminder
 * @param {string} userEmail - User email address
 * @param {Object} tender - Tender object
 * @param {number} daysUntilDeadline - Days until deadline
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendDeadlineReminderEmail = async (
    userEmail,
    tender,
    daysUntilDeadline,
) => {
    if (!userEmail) {
        return { success: false, error: "User email is required" };
    }

    const deadlineDate =
        tender.deadline instanceof Date
            ? tender.deadline
            : new Date(tender.deadline);
    const formattedDeadline = deadlineDate.toLocaleDateString("no-NO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const daysText =
        daysUntilDeadline === 1
            ? "1 dag"
            : daysUntilDeadline === 0
              ? "i dag"
              : `${daysUntilDeadline} dager`;

    const content = `
        <p>Hei,</p>
        <p>Dette er en påminnelse om at fristen for følgende anskaffelse utløper om <strong>${daysText}</strong>:</p>
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0 0 10px 0;"><strong>Tittel:</strong> ${tender.title}</p>
            <p style="margin: 0;"><strong>Frist:</strong> ${formattedDeadline}</p>
        </div>
        <p>Husk å sende inn tilbudet ditt før fristen utløper.</p>
    `;

    const html = generateEmailTemplate({
        title: `Frist påminnelse: ${daysText} igjen`,
        content,
        actionUrl: `/tenders/${tender.id}`,
        actionText: "Se Anskaffelse",
    });

    return await sendEmail({
        to: userEmail,
        subject: `Påminnelse: Frist for "${tender.title}" utløper om ${daysText}`,
        html,
    });
};

/**
 * Send email for bid submission
 * @param {string} senderEmail - Sender email address (tender creator)
 * @param {Object} tender - Tender object
 * @param {Object} bid - Bid object
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendBidSubmissionEmail = async (senderEmail, tender, bid) => {
    if (!senderEmail) {
        return { success: false, error: "Sender email is required" };
    }

    const content = `
        <p>Hei,</p>
        <p>Du har mottatt et nytt tilbud på følgende anskaffelse:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Anskaffelse:</strong> ${tender.title}</p>
            <p style="margin: 0 0 10px 0;"><strong>Leverandør:</strong> ${bid.companyName}</p>
            <p style="margin: 0 0 10px 0;"><strong>Pris:</strong> ${bid.price ? `${bid.price.toLocaleString("no-NO")} kr` : "Ikke spesifisert"}</p>
            <p style="margin: 0;"><strong>Innsendt:</strong> ${new Date(
                bid.submittedAt,
            ).toLocaleDateString("no-NO", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })}</p>
        </div>
        <p>Klikk på knappen under for å se detaljer og vurdere tilbudet.</p>
    `;

    const html = generateEmailTemplate({
        title: "Nytt tilbud mottatt",
        content,
        actionUrl: `/tenders/${tender.id}`,
        actionText: "Se Tilbud",
    });

    return await sendEmail({
        to: senderEmail,
        subject: `Nytt tilbud mottatt: ${tender.title}`,
        html,
    });
};

/**
 * Send email for contract signing request
 * @param {string} supplierEmail - Supplier email address
 * @param {Object} contract - Contract object
 * @param {Object} tender - Tender object
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendContractSigningRequestEmail = async (
    supplierEmail,
    contract,
    tender,
) => {
    if (!supplierEmail) {
        return { success: false, error: "Supplier email is required" };
    }

    const content = `
        <p>Hei,</p>
        <p>En kontrakt har blitt generert for følgende anskaffelse og venter på din signatur:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Kontrakt:</strong> ${tender.title}</p>
            <p style="margin: 0 0 10px 0;"><strong>Kontraktstandard:</strong> ${contract.contractStandard || tender.contractStandard}</p>
            <p style="margin: 0 0 10px 0;"><strong>Pris:</strong> ${contract.price ? `${contract.price.toLocaleString("no-NO")} kr` : "Ikke spesifisert"}</p>
            <p style="margin: 0;"><strong>Versjon:</strong> ${contract.version || 1}</p>
        </div>
        <p>Vennligst gjennomgå kontrakten og signer den så snart som mulig.</p>
    `;

    const html = generateEmailTemplate({
        title: "Kontrakt klar for signering",
        content,
        actionUrl: `/tenders/${contract.tenderId}/contract`,
        actionText: "Se og Signer Kontrakt",
    });

    return await sendEmail({
        to: supplierEmail,
        subject: `Kontrakt klar for signering: ${tender.title}`,
        html,
    });
};

/**
 * Send award letter email to awarded supplier
 * @param {string} supplierEmail - Supplier email address
 * @param {Object} tender - Tender object
 * @param {Object} bid - Awarded bid object
 * @param {Object} project - Project object
 * @param {Date} standstillEndDate - Standstill period end date
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendAwardLetterEmail = async (
    supplierEmail,
    tender,
    bid,
    project,
    standstillEndDate,
) => {
    if (!supplierEmail) {
        return { success: false, error: "Supplier email is required" };
    }

    const formattedStandstillEnd = standstillEndDate.toLocaleDateString(
        "no-NO",
        {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    );

    const content = `
        <p>Hei,</p>
        <p><strong>Gratulerer!</strong> Vi er glade for å informere deg om at ditt tilbud har blitt tildelt kontrakten for følgende anskaffelse:</p>
        <div style="background-color: #d4edda; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #28a745;">
            <p style="margin: 0 0 10px 0;"><strong>Anskaffelse:</strong> ${tender.title}</p>
            ${project?.name ? `<p style="margin: 0 0 10px 0;"><strong>Prosjekt:</strong> ${project.name}</p>` : ""}
            ${tender.contractStandard ? `<p style="margin: 0 0 10px 0;"><strong>Kontraktstandard:</strong> ${tender.contractStandard}</p>` : ""}
            ${bid.price ? `<p style="margin: 0 0 10px 0;"><strong>Tilbudt pris:</strong> ${bid.price.toLocaleString("no-NO")} kr</p>` : ""}
            <p style="margin: 0;"><strong>Tildelt:</strong> ${new Date().toLocaleDateString(
                "no-NO",
                {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                },
            )}</p>
        </div>
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0 0 10px 0;"><strong>⚠️ Viktig informasjon om ventetid (Standstill periode)</strong></p>
            <p style="margin: 0 0 10px 0;">I henhold til norsk anskaffelseslovgivning er det en obligatorisk ventetid (standstill periode) på <strong>10 dager</strong> fra tildelingsdatoen. Denne ventetiden gir andre leverandører mulighet til å klage på tildelingsbeslutningen.</p>
            <p style="margin: 0 0 10px 0;"><strong>Ventetiden utløper:</strong> ${formattedStandstillEnd}</p>
            <p style="margin: 0;">Kontrakten kan <strong>ikke</strong> signeres før ventetiden er utløpt. Hvis det ikke kommer inn klager innen denne datoen, vil kontrakten automatisk bli klar for signering.</p>
        </div>
        <p><strong>Når vil kontrakten være klar?</strong></p>
        <p>Kontrakten vil bli generert og gjort tilgjengelig for signering <strong>etter at ventetiden er utløpt</strong> (${formattedStandstillEnd}). Du vil motta en separat e-post med tildelingsbrev og signeringsanmodning når kontrakten er klar.</p>
        <p>Vi ser frem til et godt samarbeid!</p>
    `;

    const html = generateEmailTemplate({
        title: "Gratulerer - Ditt tilbud er tildelt!",
        content,
        actionUrl: `/tenders/${tender.id}`,
        actionText: "Se Anskaffelse",
    });

    return await sendEmail({
        to: supplierEmail,
        subject: `🎉 Tilbud tildelt: ${tender.title}`,
        html,
    });
};

/**
 * Send rejection email to non-awarded suppliers
 * @param {string} supplierEmail - Supplier email address
 * @param {Object} tender - Tender object
 * @param {Object} bid - Bid object
 * @param {string} awardedCompanyName - Name of awarded company
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendBidRejectionEmail = async (
    supplierEmail,
    tender,
    bid,
    awardedCompanyName,
) => {
    if (!supplierEmail) {
        return { success: false, error: "Supplier email is required" };
    }

    const content = `
        <p>Hei,</p>
        <p><strong>Takk for at du sendte inn tilbud</strong> på følgende anskaffelse:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Anskaffelse:</strong> ${tender.title}</p>
            ${bid.price ? `<p style="margin: 0 0 10px 0;"><strong>Ditt tilbud:</strong> ${bid.price.toLocaleString("no-NO")} kr</p>` : ""}
            <p style="margin: 0;"><strong>Innsendt:</strong> ${new Date(
                bid.submittedAt,
            ).toLocaleDateString("no-NO", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })}</p>
        </div>
        <p>Vi beklager å måtte informere deg om at ditt tilbud <strong>ikke ble tildelt kontrakten</strong> for denne anskaffelsen.</p>
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Kontrakten ble tildelt til:</strong> ${awardedCompanyName}</p>
        </div>
        <p>Vi setter <strong>stor pris på ditt engasjement</strong> og takker deg for tiden du har brukt på å utarbeide og sende inn tilbudet. Vi håper å ha muligheten til å samarbeide med deg på fremtidige anskaffelser.</p>
        <p>Hvis du har spørsmål om vurderingen eller ønsker tilbakemelding på ditt tilbud, er du velkommen til å kontakte oss.</p>
        <p>Igjen, takk for din interesse og deltakelse.</p>
    `;

    const html = generateEmailTemplate({
        title: "Tilbud ikke tildelt",
        content,
        actionUrl: `/tenders/${tender.id}`,
        actionText: "Se Anskaffelse",
    });

    return await sendEmail({
        to: supplierEmail,
        subject: `Tilbud ikke tildelt: ${tender.title}`,
        html,
    });
};

/**
 * Send email to user by user ID (fetches email from Firestore)
 * @param {string} userId - User ID
 * @param {Function} emailFunction - Function that takes email and returns email send result
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendEmailToUser = async (userId, emailFunction) => {
    const userEmail = await getUserEmail(userId);
    if (!userEmail) {
        return {
            success: false,
            error: "User email not found",
        };
    }
    return await emailFunction(userEmail);
};
