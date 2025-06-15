# Impact Score API com Playwright

Esta API permite consultar o Impact Score de periódicos a partir do ISSN, acessando o Resurchify.

## Como rodar localmente

1. Instale as dependências:

```bash
npm install
npx playwright install
```

2. Teste localmente com algum framework HTTP (como Express, Vercel Dev, etc).

## Endpoint

`GET /api/impact-score?issn=09042512`

Retorna:

```json
{
  "issn": "09042512",
  "score": "2.34"
}
```

---
Recomenda-se subir este projeto no [Railway](https://railway.app) ou [Render](https://render.com).