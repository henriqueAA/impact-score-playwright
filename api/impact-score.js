import express from 'express';
import { chromium } from 'playwright';

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/impact-score', async (req, res) => {
  const issn = req.query.issn;

    // --- Início da configuração manual do CORS ---
    // Permite que qualquer origem acesse seu recurso.
    // Para maior segurança, você pode substituir '*' pelo domínio específico do seu frontend,
    // ex: 'http://127.0.0.1:5501'
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Métodos HTTP permitidos
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Cabeçalhos permitidos na requisição

    // Lida com requisições OPTIONS (preflight requests)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200); // Responde com sucesso para a requisição de preflight
    }
    // --- Fim da configuração manual do CORS ---

  if (!issn) return res.status(400).json({ error: "ISSN não fornecido" });

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const url = `https://www.resurchify.com/find/?query=${issn}`;
    await page.goto(url, { waitUntil: 'networkidle' });

    let score = null;
    try {
      // Espera o <b> que contém o ícone do Impact Score
      await page.waitForSelector('b:has(img[src*="if.svg"])', { timeout: 1500 });

      // Extrai o texto de dentro da tag <b>
      score = await page.evaluate(() => {
        const bTags = Array.from(document.querySelectorAll('b'));
        const impact = bTags.find(b =>
          b.textContent.includes('Impact Score:') &&
          b.querySelector('img[src*="if.svg"]')
        );
        const text = impact?.textContent || '';
        const match = text.match(/Impact Score:\s*([\d.]+)/i);
        return match ? match[1] : null;
      });
    } catch (waitErr) {
      console.warn("Impact Score não encontrado dentro do tempo limite.");
    }

    await browser.close();
    res.json({ issn, score });
  } catch (err) {
    if (browser) await browser.close();
    console.error("Erro interno:", err);
    res.status(500).json({ error: "Erro interno", details: err.message });
  }
});

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});