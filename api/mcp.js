const portfolio = {
  name: "Dev Jani",
  url: "https://d-ev-portfolio.vercel.app/",
  role: "AI researcher, cybersecurity practitioner, and software engineer",
  location: "Gandhinagar, Gujarat, India",
  email: "dev.j.jani2004@gmail.com",
  resources: {
    research: "https://d-ev-portfolio.vercel.app/research",
    projects: "https://d-ev-portfolio.vercel.app/projects",
    experience: "https://d-ev-portfolio.vercel.app/experience",
    about: "https://d-ev-portfolio.vercel.app/about",
    contact: "https://d-ev-portfolio.vercel.app/contact",
    index: "https://d-ev-portfolio.vercel.app/llms.txt"
  }
};

function reply(res, payload) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Vary", "Accept, Accept-Encoding");
  res.end(JSON.stringify(payload));
}

function handler(req, res) {
  if (req.method === "GET") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Vary", "Accept, Accept-Encoding");
    res.end('event: endpoint\ndata: {"transport":"streamable-http","message":"Use POST for JSON-RPC requests."}\n\n');
    return;
  }
  if (req.method !== "POST") {
    res.statusCode = 405; res.setHeader("Allow", "GET, POST"); res.end(); return;
  }
  const message = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const id = message?.id;
  if (message?.method === "initialize") return reply(res, { jsonrpc: "2.0", id, result: { protocolVersion: "2025-03-26", capabilities: { tools: {} }, serverInfo: { name: "dev-jani-portfolio", version: "1.0.0" } } });
  if (message?.method === "tools/list") return reply(res, { jsonrpc: "2.0", id, result: { tools: [{ name: "get_portfolio", description: "Get Dev Jani's public professional profile and canonical portfolio links.", inputSchema: { type: "object", properties: {}, additionalProperties: false } }] } });
  if (message?.method === "tools/call" && message.params?.name === "get_portfolio") return reply(res, { jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(portfolio, null, 2) }] } });
  return reply(res, { jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } });
}

module.exports = handler;
