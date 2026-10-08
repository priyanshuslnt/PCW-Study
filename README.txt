PRIYANSHU RAJ — CENTRAL ADMIN VERSION
=======================================

This version stores categories centrally in Cloudflare KV.
So:
Admin edits category -> Worker saves it -> every visitor gets the updated category.

FILES
- worker.js       Cloudflare Worker API + static asset handler
- wrangler.toml   Worker/KV configuration
- public/         website files
- public/index.html
- public/admin.html
- public/style.css
- public/script.js

CLOUDFLARE SETUP (one-time)
1. Create a KV namespace in Cloudflare Workers & Pages -> KV.
2. Copy its namespace ID.
3. In wrangler.toml replace:
   4fa0701afb484c8ca6b948b45053f3be
   with the real namespace ID.
4. Set a Worker Secret named ADMIN_PASSWORD. Do NOT put your real password in worker.js.
5. Deploy this Worker project.

After deployment:
- Public site: /
- Admin: /admin.html
- Admin changes are global because categories are stored in KV.

IMPORTANT
The public site has NO Add Category button.
Admin authentication is checked by the Worker using the ADMIN_PASSWORD secret.
Do not put the admin password in public JavaScript.


GitHub upload:
Upload these files to the root of your existing PCW-Study repository. Keep wrangler.toml at the repository root. The Worker name is configured as pcw-study and the KV namespace ID is already filled in. You still need to create the Cloudflare Worker secret ADMIN_PASSWORD in the Worker settings before using /admin.html.
