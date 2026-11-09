/**
 * Official Google Gmail API Integration Service
 * Uses official REST endpoints at https://gmail.googleapis.com/gmail/v1
 */

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  threadId?: string;
  error?: string;
  statusCode?: number;
}

export interface GmailProfileResult {
  success: boolean;
  emailAddress?: string;
  messagesTotal?: number;
  threadsTotal?: number;
  error?: string;
}

/**
 * Builds RFC 2822 compliant email and base64url-encodes it
 */
function createRawEmail(params: SendEmailParams): string {
  const { to, subject, body, from } = params;
  const lines: string[] = [];

  if (from) {
    lines.push(`From: ${from}`);
  }
  lines.push(`To: ${to}`);
  // Encode subject safely for utf-8
  const encodedSubject = `=?utf-8?B?${Buffer.from(subject, 'utf-8').toString('base64')}?=`;
  lines.push(`Subject: ${encodedSubject}`);
  lines.push('MIME-Version: 1.0');
  lines.push('Content-Type: text/plain; charset=utf-8');
  lines.push('Content-Transfer-Encoding: base64');
  lines.push('');
  // Base64-encode body to prevent character set corruption
  lines.push(Buffer.from(body, 'utf-8').toString('base64'));

  const rawMessage = lines.join('\r\n');
  return Buffer.from(rawMessage, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Send an email via the official Google Gmail API
 */
export async function sendGmailMessage(
  accessToken: string,
  params: SendEmailParams
): Promise<SendEmailResult> {
  if (!accessToken) {
    return {
      success: false,
      error: 'Gmail connection required: No access token provided. Please connect your Google account with Gmail permissions.',
    };
  }

  // Validate recipient
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!params.to || !emailRegex.test(params.to.trim())) {
    return {
      success: false,
      error: `Invalid recipient email address: "${params.to}". Must be a valid email format.`,
    };
  }

  // All emails MUST be dispatched through the official Google Gmail API
  try {
    const raw = createRawEmail({
      to: params.to.trim(),
      subject: params.subject.trim() || 'Notification from FOXE AI Agent',
      body: params.body,
      from: params.from,
    });

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          statusCode: 401,
          error: 'Gmail authorization expired. Please reconnect your Google account in Connected Apps.',
        };
      }
      if (response.status === 403) {
        return {
          success: false,
          statusCode: 403,
          error: `Gmail API permission denied: ${data?.error?.message || 'Insufficient OAuth scopes for sending mail.'}`,
        };
      }
      return {
        success: false,
        statusCode: response.status,
        error: data?.error?.message || `Gmail API call failed with HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      messageId: data.id,
      threadId: data.threadId,
      statusCode: 200,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Network error connecting to Gmail API: ${err.message || String(err)}`,
    };
  }
}

/**
 * Test Gmail connection and retrieve authenticated profile
 */
export async function getGmailProfile(accessToken: string): Promise<GmailProfileResult> {
  if (!accessToken) {
    return {
      success: false,
      error: 'No active Google OAuth access token found.',
    };
  }

  try {
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data?.error?.message || `Gmail profile check failed with HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      emailAddress: data.emailAddress,
      messagesTotal: data.messagesTotal,
      threadsTotal: data.threadsTotal,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Failed to connect to Gmail: ${err.message || String(err)}`,
    };
  }
}
