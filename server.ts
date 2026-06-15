import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use body-parser for generic raw body to support the Proxy HTTP request tool
  app.use(express.json({ limit: "50mb" }));
  app.use(express.text({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Route for HTTP Client Proxy (bypasses CORS for the desktop-like experience)
  app.post("/api/proxy", async (req, res) => {
    try {
      const { url, method, headers, body } = req.body;
      
      const response = await fetch(url, {
        method: method || "GET",
        headers: headers || {},
        ...(method !== "GET" && method !== "HEAD" ? { body } : {}),
      });

      const responseText = await response.text();
      let responseBody = responseText;
      let finalJson = false;

      // Attempt to parse as JSON for cleaner formatting
      try {
        responseBody = JSON.parse(responseText);
        finalJson = true;
      } catch (e) {
        // Not JSON
      }

      res.status(response.status).json({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        isJson: finalJson,
        data: responseBody,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
