import express from 'express';
import { chromium } from 'playwright';

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/impact-score', async (req, res) => {
  try {
    const issn = req.query.issn;
    if (!issn) return res.status(400).json({ error: "ISSN não fornecido" });

    const url = `https://www.resurchify.com/find/?query=${issn}`;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const score = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll("span.badge-orange"));
      const span = spans.find(el => el.textContent.includes("Impact Score:"));
      return span ? span.textContent.replace("Impact Score:", "").trim() : null;
    });

    await browser.close();
    res.json({ issn, score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno", details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
