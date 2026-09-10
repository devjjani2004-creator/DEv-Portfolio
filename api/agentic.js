const site = "https://d-ev-portfolio.vercel.app";

const pages = {
  "/": { file: "/index.html", title: "Dev Jani — AI Researcher & Engineer", summary: "AI researcher, cybersecurity practitioner, and software engineer building secure, intelligent systems." },
  "/about": { file: "/about.html", title: "About Dev Jani", summary: "Background, skills, operating principles, and professional profile." },
  "/research": { file: "/research.html", title: "Dev Jani Research", summary: "Research across edge LLM alignment, federated learning, smart grids, and sustainable AI." },
  "/projects": { file: "/projects.html", title: "Dev Jani Projects", summary: "Selected AI, security, IoT, and software projects." },
  "/experience": { file: "/experience.html", title: "Dev Jani Experience", summary: "Research, cybersecurity, software engineering, and leadership experience." },
  "/contact": { file: "/contact.html", title: "Contact Dev Jani", summary: "Professional contact information and collaboration guidance." },
  "/privacy": { file: "/privacy.html", title: "Dev Jani Portfolio Privacy", summary: "Privacy practices for this informational personal portfolio." }
};

function markdownPage(path, page) {
  return `# ${page.title}\n\n${page.summary}\n\nCanonical page: ${site}${path}\n\n## Continue\n\n- [Portfolio home](${site}/)\n- [Research](${site}/research)\n- [Projects](${site}/projects)\n- [Experience](${site}/experience)\n- [About](${site}/about)\n- [Contact](${site}/contact)\n\nFor a complete agent-readable index, see [llms.txt](${site}/llms.txt) and [sitemap.xml](${site}/sitemap.xml).\n`;
}

function notFoundMarkdown(path) {
  return `# Not found\n\nNo public page exists at \`${path}\`. This response intentionally uses HTTP 404.\n\n## Where to look next\n\n- [Portfolio home](${site}/)\n- [Research](${site}/research)\n- [Projects](${site}/projects)\n- [About](${site}/about)\n- [Contact](${site}/contact)\n- [Agent index (llms.txt)](${site}/llms.txt)\n- [XML sitemap](${site}/sitemap.xml)\n`;
}

function acceptsMarkdown(accept = "") {
  return accept.toLowerCase().split(",").some(value => value.trim().startsWith("text/markdown"));
}

function setCommonHeaders(res) {
  res.setHeader("Vary", "Accept, Accept-Encoding");
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
}

function handler(req, res) {
  const path = req.query?.path || "/";
  const page = pages[path];
  const wantsMarkdown = acceptsMarkdown(req.headers?.accept);
  setCommonHeaders(res);

  if (!page) {
    res.statusCode = 404;
    res.setHeader("Content-Type", wantsMarkdown ? "text/markdown; charset=utf-8" : "text/plain; charset=utf-8");
    res.end(wantsMarkdown ? notFoundMarkdown(path) : "Not found. See /llms.txt or /sitemap.xml for public pages.\n");
    return;
  }

  if (wantsMarkdown) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.end(markdownPage(path, page));
    return;
  }

  res.statusCode = 307;
  res.setHeader("Location", page.file);
  res.end();
}

module.exports = handler;
module.exports.acceptsMarkdown = acceptsMarkdown;
module.exports.notFoundMarkdown = notFoundMarkdown;
