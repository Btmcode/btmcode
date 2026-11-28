# BTMCode Gmail API contact delivery setup

The contact form sends enquiries directly through the Gmail API. It requests only the `https://www.googleapis.com/auth/gmail.send` scope; it does not read or manage the mailbox.

## Required Google setup

1. Open Google Cloud Console and select or create a project.
2. Enable **Gmail API** for that project.
3. Open **Google Auth Platform**. Configure the app name and support/contact email. Choose **External** for a personal `@gmail.com` account and add `devcloudpy@gmail.com` as a test user while testing.
4. Under **Data Access**, add only this scope: `https://www.googleapis.com/auth/gmail.send`.
5. Create an OAuth 2.0 client ID of type **Web application**. Add this exact authorized redirect URI:
   `https://developers.google.com/oauthplayground`
6. Open [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground). Select the gear icon, enable **Use your own OAuth credentials**, and enter the OAuth client ID and client secret from Google Cloud.
7. In Step 1, enter and authorize `https://www.googleapis.com/auth/gmail.send` using the account `devcloudpy@gmail.com`.
8. In Step 2, exchange the authorization code for tokens. Copy the **refresh_token** from the token response. Never place it in source code or send it in chat.

## Vercel environment variables

Set these for Production (and Preview/Development if needed):

- `GMAIL_CLIENT_ID` — OAuth client ID
- `GMAIL_CLIENT_SECRET` — OAuth client secret (**Sensitive**)
- `GMAIL_REFRESH_TOKEN` — refresh token (**Sensitive**)
- `GMAIL_SENDER_EMAIL` — `devcloudpy@gmail.com`
- `CONTACT_TO_EMAIL` — `devcloudpy@gmail.com`

After saving the variables, redeploy the project. The contact API exchanges the refresh token for a short-lived access token and calls `users.messages.send`.

## OAuth publishing status and token lifetime

An External OAuth app left in **Testing** issues refresh tokens that expire after 7 days when Gmail scopes are requested. For ongoing production use, the consent screen must move out of Testing. The `gmail.send` scope is sensitive and Google may require OAuth verification for wider public use. An unverified app may show a warning and is subject to Google's user limits. Do not treat a Testing token as a durable production credential.

Google references:
- [Gmail API server-side OAuth](https://developers.google.com/workspace/gmail/api/auth/web-server)
- [OAuth web-server flow and offline access](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Gmail send scope and verification](https://developers.google.com/workspace/gmail/api/auth/scopes)
- [Gmail message sending format](https://developers.google.com/workspace/gmail/api/guides/sending)

## Runtime behavior

- The destination is fixed by `CONTACT_TO_EMAIL`; the visitor cannot choose the recipient.
- The sender must be the mailbox that authorized the refresh token.
- The visitor's address is added only as `Reply-To`.
- Missing OAuth configuration returns HTTP 503. A revoked/expired refresh token returns a re-authorization error; throttling returns HTTP 429.
- Contact form submissions are not stored in a BTMCode website database.
