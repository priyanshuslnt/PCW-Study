const CATEGORIES_KEY = "categories";
const SETTINGS_KEY = "settings";

const DEFAULT_SETTINGS = {
  downloadEyebrow: "MOBILE",
  downloadTitle: "Take it with you.",
  downloadText: "Put your Android APK link here and use the button below.",
  downloadButton: "Download APK ↓",
  downloadUrl: ""
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
  const supplied = request.headers.get("X-Admin-Password");
  return Boolean(env.ADMIN_PASSWORD && supplied && supplied === env.ADMIN_PASSWORD);
}

async function getCategories(env) {
  try {
    const raw = await env.CATEGORIES.get(CATEGORIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function getSettings(env) {
  try {
    const raw = await env.CATEGORIES.get(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...(parsed && typeof parsed === "object" ? parsed : {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function cleanCategory(input) {
  return {
    id: String(input.id || crypto.randomUUID()),
    name: String(input.name || "").trim().slice(0, 100),
    icon: String(input.icon || "📚").trim().slice(0, 12),
    logo: String(input.logo || "").trim().slice(0, 2000),
    url: String(input.url || "").trim().slice(0, 2000),
    description: String(input.description || "").trim().slice(0, 500)
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (request.method === "GET" && url.pathname === "/api/admin/check") {
        return authorized(request, env) ? json({ ok: true }) : json({ error: "Unauthorized" }, 401);
      }

      if (request.method === "GET" && url.pathname === "/api/categories") {
        return json(await getCategories(env));
      }

      if (request.method === "PUT" && url.pathname === "/api/categories") {
        if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
        let input;
        try { input = await request.json(); } catch { return json({ error: "Invalid JSON." }, 400); }
        const category = cleanCategory(input || {});
        if (!category.name || !category.url) return json({ error: "Category name and website URL are required." }, 400);

        const categories = await getCategories(env);
        const index = categories.findIndex(item => String(item.id) === category.id);
        if (index >= 0) categories[index] = category;
        else categories.push(category);

        await env.CATEGORIES.put(CATEGORIES_KEY, JSON.stringify(categories));
        return json({ ok: true, category, categories });
      }

      if (request.method === "DELETE" && url.pathname === "/api/categories") {
        if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "Missing category id." }, 400);
        const categories = await getCategories(env);
        const updated = categories.filter(item => String(item.id) !== String(id));
        await env.CATEGORIES.put(CATEGORIES_KEY, JSON.stringify(updated));
        return json({ ok: true, categories: updated });
      }

      if (request.method === "GET" && url.pathname === "/api/settings") {
        return json(await getSettings(env));
      }

      if (request.method === "POST" && url.pathname === "/api/settings") {
        if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
        let incoming;
        try { incoming = await request.json(); } catch { return json({ error: "Invalid JSON." }, 400); }
        incoming = incoming && typeof incoming === "object" ? incoming : {};
        const settings = {
          downloadEyebrow: String(incoming.downloadEyebrow ?? DEFAULT_SETTINGS.downloadEyebrow).trim().slice(0, 80),
          downloadTitle: String(incoming.downloadTitle ?? DEFAULT_SETTINGS.downloadTitle).trim().slice(0, 160),
          downloadText: String(incoming.downloadText ?? DEFAULT_SETTINGS.downloadText).trim().slice(0, 600),
          downloadButton: String(incoming.downloadButton ?? DEFAULT_SETTINGS.downloadButton).trim().slice(0, 80),
          downloadUrl: String(incoming.downloadUrl ?? DEFAULT_SETTINGS.downloadUrl).trim().slice(0, 2000)
        };
        await env.CATEGORIES.put(SETTINGS_KEY, JSON.stringify(settings));
        return json({ ok: true, settings });
      }
    } catch {
      return json({ error: "Server error." }, 500);
    }

    // All non-API requests are handled by Cloudflare's static asset binding.
    return env.ASSETS.fetch(request);
  }
};
