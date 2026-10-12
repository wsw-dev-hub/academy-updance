# academy-updance

Área de membros, painel admin, login e API da Up Dance, em um Worker próprio do Cloudflare chamado `academy` (`https://academy.updance.workers.dev`).

Usa o **mesmo D1** (`updance_db`) e o **mesmo KV** do blog: contas, sessões, regras de acesso e progresso são os mesmos dados. O blog continua com o conteúdo público e a newsletter.

## Antes do primeiro deploy

1. **Copiar três imagens do repositório do blog.** Elas não vieram nos envios e as pastas estão vazias aqui:
   - `public/images/icons/udx-icon.ico`
   - `public/images/icons/udx-icon.png`
   - `public/admin/avaliacoes/logos/Norte Danse.png` (logo padrão do editor de avaliações)

   Sem elas o site funciona, mas o ícone da aba, o ícone do topo e o logo do editor aparecem quebrados.
2. **Rodar o SQL** de `sql/2026-10-regras-acesso-trilhas.sql` no D1 Studio. Ele corrige a regra da trilha do Intermediário e cria a do Técnico. Pode ser rodado mais de uma vez.
3. **Revisar `public/admin/avaliacoes/index.html`** se o repositório for público: o modelo de ficha traz o primeiro nome de uma aluna. Troque por um nome fictício ou mantenha o repositório privado.

## Deploy (GitHub → Cloudflare Workers Builds)

| Campo | Valor |
|---|---|
| Nome do Worker | `academy` (tem de ser igual ao `name` do `wrangler.toml`) |
| Build command | deixar vazio (não há etapa de build) |
| Deploy command | `npx wrangler deploy` |
| Diretório raiz | `/` |

Depois do primeiro deploy, cadastre no Worker `academy` os dois **segredos**, com os mesmos valores usados no blog. Segredos são por Worker; os do blog não valem aqui.

- `GMAIL_APP_PASSWORD` — sem ele nenhum e-mail sai (confirmação de conta, link de acesso, redefinição de senha).
- `ADMIN_SETUP_KEY` — usado só por `/api/admin/setup`.

O KV, o D1 e a variável `GMAIL_USER` vêm do `wrangler.toml` e são aplicados no deploy.

## Estrutura

```
worker/
  index.js              Worker: rotas, autenticação, portaria de acesso, API
  worker_produtos.js    módulo de produtos (admin)
  worker_avaliacoes.js  módulo de avaliações (admin e membro)
public/                 servido como está (não há build)
  membros/              hub, áreas por nível, trilhas, desafios, progresso
  entrar/  reset-senha/ login e nova senha
  admin/  admin-login/  painel, editor de avaliações, login do admin
  css/  js/  images/    estilos, motores e dados das trilhas, ícones
  404.html              página de "não encontrada"
sql/                    ajuste de regras de acesso (rodar uma vez)
wrangler.toml           configuração do Worker
```

## Como as requisições são tratadas

- `/css/*`, `/js/*`, `/images/*` são entregues direto, sem passar pelo Worker.
- Todo o resto passa primeiro pelo Worker (`run_worker_first` no `wrangler.toml`):
  - `/api/*` — API.
  - `/membros/*` — exige sessão de membro; áreas com `path_prefix` em `resources` exigem também o tipo liberado em `access_rules`.
  - `/admin/*` — exige sessão de admin.
  - `/` e os caminhos do blog (`/contato/`, `/planos/`, `/trilhas/`, `/apps/`, `/aluno/`, `/premium/`, `/estagio/`, `/intermediario/`, `/iniciante/`, `/free/`) — redirecionados para `https://blog.updance.workers.dev` com o mesmo caminho. A lista é `BLOG_PREFIXES` em `worker/index.js`.
  - qualquer outro caminho — arquivo de `public/`, ou `404.html`.

Ao sair (botão "Sair"), o membro vai para a raiz, que redireciona para o blog.

## O que mudou em relação aos arquivos do blog

`worker/index.js` é o `index.js` do blog com 12 alterações:

1. imports dos módulos apontando para a pasta `worker/`;
2. constantes `BLOG_ORIGIN` e `BLOG_PREFIXES`;
3. `LEVEL_ORDER` na ordem base → topo;
4. redirecionamento da raiz e dos caminhos do blog;
5. rotas `/api/admin/trilhas/fila` e `/api/admin/trilhas/avaliar`;
6. trilha do Nível Técnico em `TRILHAS`;
7. a 11. trilhas lendo e gravando em `trilha_progresso`, `trilha_desafios` e `trilha_insignias` (antes `talent_*`), e erro da trilha sem expor detalhes internos;
12. funções `trilhasFila` e `trilhasAvaliar`.

Nas páginas e motores:

- `public/js/trilha.js` — o clique em um nó passa a selecionar esse nó no painel de desafios.
- `public/membros/nivel-intermediario/index.html` — rota do estado da trilha corrigida.
- `public/membros/nivel-tecnico/arvore-de-habilidades/index.html` — total de 4120 XPE no texto.

Arquivos novos: `wrangler.toml`, `package.json`, `package-lock.json`, `public/404.html`, `public/.assetsignore`, `sql/`.

Todos os demais arquivos são cópias idênticas dos originais.

## Conferência depois do deploy

- `academy.updance.workers.dev/` cai no blog.
- `academy.updance.workers.dev/membros/` sem login leva para `/entrar/`.
- Login com uma conta existente abre o hub com os cards.
- Em uma trilha, clicar em um nó troca o painel; "Enviar" mostra "aguardando validação".
- `/admin/` sem login leva para `/admin-login/`; o login de admin abre o painel.
- "Sair" leva ao blog.

## Rodar localmente

```
npm install
npm run dev
```

`npm run check` empacota o Worker sem publicar.

## Pendências conhecidas

- **Corte no blog ainda não feito.** O blog segue servindo a área de membros em paralelo. Sessões são por endereço: quem entrar no academy não está logado no blog, e vice-versa.
- **Fila de aprovação sem tela.** As rotas de fila (talentos e trilhas) existem na API, mas o painel admin não tem tela que as use.
- **Conteúdo fora de `/membros/`** (`/premium/…`, `/aluno/…`, e-books etc.) continua no blog e sem controle de acesso.
- **Estilos ausentes no painel da trilha.** O motor gera as classes `.is-selected`, `.tt-challenge__icon`, `.tt-challenge__ok`, `.tt-panel__lock`, `.tt-title` e `.is-earned`, que nenhum CSS define.
