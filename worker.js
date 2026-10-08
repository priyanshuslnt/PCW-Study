const CATEGORIES_KEY = "categories";

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
  const password = request.headers.get("X-Admin-Password");
  return !!env.ADMIN_PASSWORD && password === env.ADMIN_PASSWORD;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Admin password check without changing any data.
    if (request.method === "GET" && url.pathname === "/api/admin/check") {
      if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
      return json({ ok: true });
    }

    // Public API: load categories for the main website.
    if (request.method === "GET" && url.pathname === "/api/categories") {
      const raw = await env.CATEGORIES.get(CATEGORIES_KEY);
      if (!raw) return json([]);
      try {
        return json(JSON.parse(raw));
      } catch {
        return json([]);
      }
    }

    // Admin API: replace all categories.
    if (request.method === "POST" && url.pathname === "/api/categories") {
      if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);

      try {
        const categories = await request.json();
        if (!Array.isArray(categories)) {
          return json({ error: "Categories must be an array." }, 400);
        }
        await env.CATEGORIES.put(CATEGORIES_KEY, JSON.stringify(categories));
        return json({ ok: true, categories });
      } catch {
        return json({ error: "Invalid JSON." }, 400);
      }
    }

    // Admin API: add one category.
    if (request.method === "PUT" && url.pathname === "/api/categories") {
      if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);

      try {
        const item = await request.json();
        if (!item || typeof item !== "object" || !item.name || !item.url) {
          return json({ error: "name and url are required." }, 400);
        }

        const raw = await env.CATEGORIES.get(CATEGORIES_KEY);
        const categories = raw ? JSON.parse(raw) : [];
        const category = {
          id: item.id || crypto.randomUUID(),
          name: String(item.name).trim(),
          url: String(item.url).trim(),
          icon: String(item.icon || "📚"),
          description: String(item.description || "").trim()
        };

        categories.push(category);
        await env.CATEGORIES.put(CATEGORIES_KEY, JSON.stringify(categories));
        return json({ ok: true, category, categories });
      } catch {
        return json({ error: "Invalid category data." }, 400);
      }
    }

    // Admin API: delete category by ?id=...
    if (request.method === "DELETE" && url.pathname === "/api/categories") {
      if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);

      const id = url.searchParams.get("id");
      if (!id) return json({ error: "Missing id." }, 400);

      const raw = await env.CATEGORIES.get(CATEGORIES_KEY);
      const categories = raw ? JSON.parse(raw) : [];
      const updated = categories.filter(item => String(item.id) !== String(id));

      await env.CATEGORIES.put(CATEGORIES_KEY, JSON.stringify(updated));
      return json({ ok: true, categories: updated });
    }

    // Let Cloudflare serve index.html and the other files in the repo.
    return env.ASSETS.fetch(request);
  }
};
