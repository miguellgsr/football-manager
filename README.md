# FM Mate

Site para Football Manager: planejador de elenco, sugestões de transferência e táticas com IA (Claude), comparador, contratos, jovens promessas e shortlist.

## Como os dados entram (save online, sem exportação)

O FM não exporta CSV/HTML nativamente nas versões recentes, e o plugin BepInEx não funciona em save online. Por isso o caminho principal é a aba **Importar → por print**:

1. No jogo, abra **Elenco** com uma visão que mostre atributos (técnicos/mentais/físicos). Tire prints (3 por vez é o ideal).
2. Opcional: tire também um print de uma visão de **Contratos** (fim, salário, valor).
3. Para alvos de transferência, tire prints da **Busca de Jogadores** ou do perfil do jogador (aba Atributos) e importe como **Shortlist**.
4. Envie os prints no site, confira a prévia e adicione. Jogadores com o mesmo nome são combinados (dá para enviar atributos e contratos em prints separados).

Também há importação de CSV/HTML (caso use um save offline com exportação) e cadastro manual.

> Atributos escondidos (mostrados como "?" ou em intervalo) são ignorados. Revise os números lidos clicando no jogador.

## Saves, abas e IA

- **Home:** escolha, crie, renomeie, exporte ou exclua saves. Cada save tem elenco, shortlist, escalação, táticas e conversa de transferências separados.
- **Planejamento:** todos os jogadores no campo por posição, com lacunas (sem jogador / sem reserva), idade e nível técnico, para a formação de referência.
- **Importar:** um print por jogador, vários prints do mesmo jogador, ou prints de listas. Ctrl+V cola um print.
- **Transferências IA:** chat que lê o elenco e a shortlist; aceita prints (ex.: um jogador de referência para achar parecidos).
- **Táticas IA:** lê o elenco completo, compara formações/estilos e recomenda a melhor combinação.

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha ANTHROPIC_API_KEY (e ACCESS_CODE)
npm run dev
```

## Publicar no Vercel

1. Suba esta pasta para um repositório no GitHub.
2. No Vercel: **Add New → Project** → importe o repositório (framework: Next.js, sem configuração extra).
3. Em **Settings → Environment Variables**, defina:
   - **Gratuito:** `AI_PROVIDER=gemini` e `GEMINI_API_KEY` (chave grátis em aistudio.google.com/apikey, sem cartão). Opcional: `GEMINI_MODEL` (padrão `gemini-2.5-flash`).
   - **Ou Claude (pago por uso):** `AI_PROVIDER=anthropic` e `ANTHROPIC_API_KEY`. Opcional: `ANTHROPIC_MODEL`.
   - `ACCESS_CODE` — um código que só você sabe (evita que estranhos usem sua chave). Digite o mesmo código na aba **Extras & Clube** do site.
4. Faça o deploy.

## Notas técnicas

- Dados do elenco ficam no `localStorage` do navegador (use **Backup** na aba Extras para levar a outro aparelho).
- As imagens são reduzidas no navegador (1600 px, JPEG) e enviadas em lotes de 3, para respeitar o limite de corpo das funções do Vercel.
- A IA não tem acesso à base completa do FM: ela descreve o perfil ideal, dá filtros para a Busca de Jogadores do jogo e ranqueia os candidatos que você puser na shortlist.
- O "encaixe" (0–100) dos jogadores é calculado localmente por pesos de atributos por função (`lib/roles.ts`), ajuste os pesos ao seu gosto.
