export async function sendWhatsAppMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  text: string
): Promise<void> {
  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { body: text },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp API error: ${response.status} - ${error}`);
  }
}

export async function markMessageAsRead(
  phoneNumberId: string,
  accessToken: string,
  messageId: string
): Promise<void> {
  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    }),
  });
}
