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

    await page.goto(url, { waitUntil: 'networkidle' });

    // Aguarda seletor com as badges laranjas
    await page.waitForSelector("span.badge-orange", { timeout: 5000 });

    // Extrai o texto do Impact Score
    const score = await page.evaluate(() => {
      const badges = Array.from(document.querySelectorAll("span.badge-orange"));
      const impactBadge = badges.find(b => b.textContent.includes("Impact Score:"));
      return impactBadge ? impactBadge.textContent.split(":")[1].trim() : null;
    });

    await browser.close();

    res.json({ issn, score });
  } catch (error) {
    console.error("Erro interno:", error);
    res.status(500).json({ error: "Erro interno", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
