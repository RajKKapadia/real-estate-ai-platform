import { getConnectionsByBuilderId } from "@/lib/db/queries/connections";
import { WebsiteConnectionForm } from "@/components/connections/website-connection-form";
import { WhatsAppConnectionForm } from "@/components/connections/whatsapp-connection-form";
import { EmbedCodeDisplay } from "@/components/connections/embed-code-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ConnectionsPage({
  params,
}: {
  params: Promise<{ builderId: string }>;
}) {
  const { builderId } = await params;
  const connections = await getConnectionsByBuilderId(builderId);

  const websiteConn = connections.find((c) => c.connectionType === "website");
  const whatsappConn = connections.find(
    (c) => c.connectionType === "whatsapp"
  );
  const whatsappVerifyToken = whatsappConn?.webhookVerifyToken
    ? whatsappConn.webhookVerifyToken
    : null;

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold">Connections</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <WebsiteConnectionForm
            builderId={builderId}
            connection={websiteConn}
          />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Website Widget Setup Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <ol className="list-decimal space-y-2 pl-4">
                <li>Enter your production domain in Allowed Domain and save.</li>
                <li>Copy the generated embed code shown below.</li>
                <li>Paste it before the closing <code>&lt;/body&gt;</code> tag on your site.</li>
                <li>Deploy your website changes.</li>
                <li>Open your site and confirm the chat widget appears.</li>
                <li>Send a test message and verify it creates a session in this dashboard.</li>
                <li>
                  If widget is not visible, check that the domain exactly matches
                  the allowed domain (no protocol, no extra path).
                </li>
              </ol>
            </CardContent>
          </Card>
          {websiteConn?.embedScriptTag && (
            <EmbedCodeDisplay code={websiteConn.embedScriptTag} />
          )}
        </div>

        <div className="space-y-4">
          <WhatsAppConnectionForm
            builderId={builderId}
            connection={whatsappConn}
            webhookVerifyToken={whatsappVerifyToken}
          />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Meta WhatsApp Setup Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <ol className="list-decimal space-y-2 pl-4">
                <li>
                  Go to Meta for Developers, open your app, and add the WhatsApp product.
                </li>
                <li>
                  In WhatsApp API Setup, copy:
                  Access Token, App Secret, and Phone Number ID.
                </li>
                <li>
                  Paste these values into this form and click Connect WhatsApp.
                </li>
                <li>
                  Copy the generated Webhook URL and Webhook Verify Token from this page.
                </li>
                <li>
                  In Meta Webhooks configuration, paste URL and verify token, then verify.
                </li>
                <li>
                  Subscribe to WhatsApp message events and save.
                </li>
                <li>
                  Send a test WhatsApp message to your business number and confirm
                  a session appears in the Sessions tab.
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
