# Conecta Ação — Plataforma de Doações (ONGs & Doadores)

## 🎯 Sobre o Projeto
Sistema web que conecta **doadores** a **ONGs**. ONGs cadastram pedidos de doação (com meta/quantidade) e acompanham intenções em um **kanban** (Pendentes/Concluídas). Doadores filtram pedidos, registram intenções (quantidade, mensagem, contato) e visualizam quanto **já doaram** e sua **participação (%)** na meta.  
**Stack**: HTML, CSS, JavaScript (frontend) + PHP (API) + MySQL (phpMyAdmin). Executa em XAMPP (Apache + PHP + MySQL).

**Escopo**:
- Autenticação separada (doador/ONG), senhas com `password_hash`.
- CRUD de pedidos (ONG).
- Registro e gestão de intenções (doador ↔ ONG).
- Métricas por pedido: total concluído, restante e contribuição do doador.

---

## 👥 Equipe
- Nome 1 — RA | Papel  
- Nome 2 — RA | Papel  
- Nome 3 — RA | Papel  
- Nome 4 — RA | Papel  
- Nome 5 — RA | Papel  

> Representante: **Nome 1**

---

## 🧪 Testes (Plano)
| ID  | Caso                              | Pré-condição                    | Passos                                                             | Resultado Esperado                                   |
|-----|-----------------------------------|----------------------------------|--------------------------------------------------------------------|------------------------------------------------------|
| CT01| Cadastro ONG                      | Não existir ONG com e-mail X     | Login ONG → “Criar conta” → preencher → enviar                     | ONG criada; senha com hash; redireciona p/ login     |
| CT02| Login ONG                         | ONG existente                    | Login ONG com credenciais corretas                                 | Sessão iniciada; acesso ao painel                    |
| CT03| Criar Pedido (ONG)                | ONG logada                       | Painel ONG → “Criar pedido” (título, cat., qtd) → salvar           | Pedido “ativo” listado e visível ao doador           |
| CT04| Intenção de Doação (Doador)       | Doador logado + pedido ativo     | Painel Doador → “Ver/Doar” → preencher (qtd, msg, contato) → enviar| ONG vê no kanban; card do doador marca “Já doou”     |
| CT05| Concluir Intenção (ONG)           | Intenção pendente                | Kanban → “Marcar concluída”                                        | Vai para Concluídas; “Restante” reduz nos cards      |

---

## 🤖 Testes Automatizados
**Ferramentas**: Postman/Newman (API), Selenium (E2E).  
**Como rodar (Newman):**
```bash
npm i -g newman
newman run tests/postman/conecta-acao.postman_collection.json   -e tests/postman/local.postman_environment.json
```
**Selenium**: executar os scripts em `tests/selenium/` (ex.: Python com `webdriver`).

---

## 📊 Métricas e Estimativas
**Métricas aplicadas** (exemplos sugeridos):
- Cobertura de testes (relatórios do Newman / E2E).
- Qualidade estática: ESLint (JS), Stylelint (CSS), PHP CodeSniffer (PSR-12).
- (Opcional) SonarQube: bugs, code smells, duplicações.

**Estimativas de esforço**:
- Planning Poker para HU01–HU05 (ou T-Shirt sizing por módulo).
- (Opcional) PERT para tarefas críticas (E2E + ajustes DB).

---

## 🔍 Revisão Técnica
**Técnicas**: revisão por pares (PRs), pareamento em módulos críticos, linters (ESLint/Stylelint/PHPCS), (opcional) SonarQube.  
**Resultados** (exemplos a evidenciar):
- PHPCS: aderência PSR-12 > 90%.  
- Linters: 0 erros (warnings documentados).  
- Sonar: 0 bugs críticos; duplicação baixa.

---

## 🔧 Versionamento
**Branches**:
- `main` (estável), `dev` (integração), `feature/<nome>` (funcionalidades), `hotfix/<nome>` (correções).

**PRs & Commits**:
- Commits pequenos e descritivos (`feat(ong): kanban pendente/concluida`).
- PR com descrição, prints/evidências e solicitação de review.

**Links**:
- PRs principais: _inserir_  
- Commits relevantes: _inserir_

---

## 🚀 Execução
1. **Clonar** em `htdocs/conecta-acao` (ou webroot equivalente).  
2. **Banco de dados**:  
   - **Importar dump** via phpMyAdmin **ou**  
   - **Criar schema** importando `migrations/001_init.sql` em `conecta_acao`.  
3. **Configurar** `php/includes/config.php`:
   ```php
   define('DB_HOST','localhost');
   define('DB_PORT','3306');
   define('DB_NAME','conecta_acao');
   define('DB_USER','root');
   define('DB_PASS',''); // ajuste
   ```
4. Iniciar Apache + MySQL (XAMPP).  
5. Acessar `http://localhost/conecta-acao/index.html`.

**Rodar testes**:
- Newman: ver seção “Testes Automatizados”.  
- Selenium: executar scripts em `tests/selenium/`.

---

## 🌐 GitHub Pages
[Link para a landing page do projeto](https://seuusuario.github.io/repositorio)

> A landing é estática (HTML/Markdown/Jekyll) e deve conter: nome, objetivo, pitch (vídeo/link), tecnologias, **prints** (`/docs/prints`), link do repositório e equipe.