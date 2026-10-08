const CATEGORIES_KEY = "categories";
const SETTINGS_KEY = "settings";

const DEFAULT_SETTINGS = {
  downloadEyebrow: "MOBILE",
  downloadTitle: "Take it<br>with you.",
  downloadText: "Put your Android APK here and use the button below to download it.",
  downloadButton: "Download APK ↓",
  downloadUrl: "app-release.apk"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}

function authorized(request, env) {
  return !!env.ADMIN_PASSWORD &&
    request.headers.get("X-Admin-Password") === env.ADMIN_PASSWORD;
}

async function getCategories(env) {
  const raw = await env.CATEGORIES.get(CATEGORIES_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

async function getSettings(env) {
  const raw = await env.CATEGORIES.get(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }; }
  catch { return DEFAULT_SETTINGS; }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/api/admin/check") {
      if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
      return json({ ok: true });
    }

    if (request.method === "GET" && url.pathname === "/api/categories") {
      return json(await getCategories(env));
    }

    if (request.method === "PUT" && url.pathname === "/api/categories") {
      if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
      try {
        const item = await request.json();
        if (!item || !item.name || !item.url) {
          return json({ error: "name and url are required." }, 400);
        }

        const categories = await getCategories(env);
        const category = {
          id: item.id || crypto.randomUUID(),
          name: String(item.name).trim(),
          url: String(item.url).trim(),
          icon: String(item.icon || "📚").trim(),
          logo: String(item.logo || "").trim(),
          description: String(item.description || "").trim()
        };

        const index = categories.findIndex(c => String(c.id) === String(category.id));
        if (index >= 0) categories[index] = category;
        else categories.push(category);

        await env.CATEGORIES.put(CATEGORIES_KEY, JSON.stringify(categories));
        return json({ ok: true, category, categories });
      } catch {
        return json({ error: "Invalid category data." }, 400);
      }
    }

    if (request.method === "DELETE" && url.pathname === "/api/categories") {
      if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
      const id = url.searchParams.get("id");
      if (!id) return json({ error: "Missing id." }, 400);

      const categories = await getCategories(env);
      const updated = categories.filter(c => String(c.id) !== String(id));
      await env.CATEGORIES.put(CATEGORIES_KEY, JSON.stringify(updated));
      return json({ ok: true, categories: updated });
    }

    if (request.method === "GET" && url.pathname === "/api/settings") {
      return json(await getSettings(env));
    }

    if (request.method === "POST" && url.pathname === "/api/settings") {
      if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
      try {
        const incoming = await request.json();
        const settings = {
          ...DEFAULT_SETTINGS,
          ...incoming,
          downloadEyebrow: String(incoming.downloadEyebrow ?? DEFAULT_SETTINGS.downloadEyebrow),
          downloadTitle: String(incoming.downloadTitle ?? DEFAULT_SETTINGS.downloadTitle),
          downloadText: String(incoming.downloadText ?? DEFAULT_SETTINGS.downloadText),
          downloadButton: String(incoming.downloadButton ?? DEFAULT_SETTINGS.downloadButton),
          downloadUrl: String(incoming.downloadUrl ?? DEFAULT_SETTINGS.downloadUrl)
        };
        await env.CATEGORIES.put(SETTINGS_KEY, JSON.stringify(settings));
        return json({ ok: true, settings });
      } catch {
        return json({ error: "Invalid settings." }, 400);
      }
    }

    return env.ASSETS.fetch(request);
  }
};
