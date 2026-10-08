PRIYANSHU RAJ STUDY HUB
=======================

PUBLIC SITE
- Public visitors can only view/open categories and save them locally.
- The "+ Add Category" control is NOT shown on the public homepage.

ADMIN
- Open admin.html to manage categories.
- Change the default password "change-me" inside admin.html before uploading.
- Add, edit and delete categories from the admin page.

IMPORTANT
This package is a static frontend. The admin password is client-side, so it is not strong server-side security.
Also, localStorage changes are browser-specific. If you need ONE admin account whose category changes automatically appear for ALL visitors, connect the admin page to a Cloudflare Worker/KV/D1 (or another backend).

APK
Put your Android APK in this same folder as app-release.apk.
