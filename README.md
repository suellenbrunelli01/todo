# TASKFLOW — Gestão Inteligente de Tarefas e Produtividade

> Uma aplicação web moderna, funcional e de alta performance inspirada nas melhores práticas de produtos SaaS contemporâneos (*Linear*, *Todoist*, *Notion*). Desenvolvida com **HTML5 puro**, **CSS3 puro** e **JavaScript Vanilla**, sem dependências de build ou frameworks.

---

## 📌 Sumário

- [Visão Geral](#-visão-geral)
- [Identidade Visual e Design System](#-identidade-visual-e-design-system)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Planejamento Temporal por Período](#-planejamento-temporal-por-período)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Como Executar](#-como-executar)
- [Persistência de Dados](#-persistência-de-dados)
- [Acessibilidade e Responsividade](#-acessibilidade-e-responsividade)

---

## 🚀 Visão Geral

O **TASKFLOW** foi projetado para profissionais, gestores e equipes que precisam de foco, controle e clareza na execução de suas demandas diárias e estratégicas. A aplicação adota o estilo estético **Minimalist-Constructivist**, priorizando:

- Superfícies limpas e disciplina visual.
- Bordas estruturais de precisão (1px) substituindo sombras pesadas.
- Microinterações fluidas e feedback imediato a cada ação.
- Navegação fluida de página única (*Single Page Application*) sem recarregar a tela.

---

## 🎨 Identidade Visual e Design System

- **Tipografia:**
  - `Plus Jakarta Sans`: Títulos, cabeçalhos de visão e métricas de autoridade visual.
  - `Inter`: Corpo de texto, controles interativos, cards e listas densas.
- **Paleta de Cores & Superfícies:**
  - Superfície Base: `#FFFFFF`
  - Fundo da Aplicação: `#F8FAFC`
  - Superfícies Suaves & Hover: `#F1F5F9`
  - Linhas Estruturais & Bordas: `#E2E8F0`
  - Brand Accent: `#4F46E5` (Índigo de alto contraste)
- **Níveis de Prioridade Semântica:**
  - 🟢 **Baixa:** Verde (`#10B981` / `#ECFDF5`)
  - 🔵 **Média:** Azul (`#3B82F6` / `#EFF6FF`)
  - 🟠 **Alta:** Laranja (`#F59E0B` / `#FFFBEB`)
  - 🔴 **Urgente:** Vermelho (`#F43F5E` / `#FFF1F2`)

---

## ⚡ Funcionalidades Principais

### 1. Sidebar — Menu Lateral
- Logotipo **TASKFLOW PRO**.
- Botão de ação rápida `+ Nova tarefa`.
- Menus inteligentes de navegação com badges de contadores automáticos:
  - *Visão geral*
  - *Minhas tarefas*
  - *Hoje* (destaque para vencimentos imediatos)
  - *Próximas*
  - *Concluídas*
- Seção de **Projetos**:
  - Criação de novos projetos com seletor interativo de cores.
  - Edição e exclusão de projetos.
  - Associação de tarefas diretamente a cada projeto.
- Rodapé com perfil do usuário e menu modal de configurações.

### 2. Header Superior
- Campo de busca em tempo real por título, descrição, projeto ou categoria com botão de limpeza rápida.
- Indicador em formato *pill* de tarefas pendentes.
- Central de notificações com popover expansível exibindo alertas de atraso e tarefas do dia.
- Saudação dinâmica personalizada com data atual formatada por extenso.
- Avatar do usuário conectado.

### 3. Dashboard & Indicadores de Produtividade
- **Cards de Indicadores (Métricas):**
  - Total de Tarefas cadastradas.
  - Tarefas Pendentes em andamento.
  - Tarefas Concluídas.
  - Tarefas Atrasadas (com identificação e borda de alerta visual).
  - *Cards clicáveis que funcionam como atalhos diretos de filtragem*.
- **Barra de Produtividade em Tempo Real:**
  - Barra de progresso com gradiente contínuo.
  - Indicador percentual de aproveitamento e contadores de itens finalizados vs. restantes.

### 4. Gerenciamento Completo de Tarefas (CRUD)
- **Criação e Edição:** Modal ergonômico contendo validação de campos obrigatórios, título, descrição detalhada, data de vencimento, prioridade, projeto, categoria/tags e horizonte de planejamento.
- **Conclusão & Reabertura:** Checkbox interativo com transição suave, efeito riscado e fade visual.
- **Exclusão Segura:** Modal de confirmação para prevenir deleções acidentais.
- **Filtros Combinados:**
  - Filtro por status (*Todas*, *Hoje*, *Próximas*, *Atrasadas*, *Concluídas*).
  - Filtro por prioridade (*Baixa*, *Média*, *Alta*, *Urgente*).
  - Filtro por projeto associado.
  - Ordenação dinâmica por: *Vencimento (Mais próximo / Mais distante)*, *Prioridade (Maior / Menor)* e *Título (A - Z)*.
- **Feedback Visual:** Notificações flutuantes (*Toasts*) automáticas a cada operação realizada.

---

## ⏳ Planejamento Temporal por Período

A aplicação organiza os objetivos em três horizontes temporais, acessíveis via abas interativas no topo do painel:

| Período | Alcance | Foco de Atuação |
| :--- | :--- | :--- |
| **Curto Prazo** | Até 4 meses | Execução tática e entregas ágeis |
| **Médio Prazo** | Até 12 meses | Metas estratégicas e marcos de produto |
| **Longo Prazo** | Até 60 meses | Visão macro e iniciativas estruturais |

*A alternância entre períodos mantém todos os dados cadastrados preservados e atualiza instantaneamente a listagem e os contadores de cada aba.*

---

## 📁 Estrutura do Projeto

O projeto segue rigorosamente a especificação de conter exatamente três arquivos centrais na pasta `public`:

```text
todo/
├── public/
│   ├── index.html     # Marcação semântica e acessível (HTML5)
│   ├── style.css      # Sistema de design modular e responsivo (CSS3)
│   └── script.js      # Lógica da aplicação, SPA e LocalStorage (Vanilla JS)
├── referencia/        # Especificações e referências visuais de design
└── README.md          # Documentação do projeto
```

---

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Semântica estrita (`<header>`, `<aside>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<dialog>` / ARIA).
- **CSS3:**
  - CSS Custom Properties (Variáveis para tokens de design).
  - Flexbox e CSS Grid para o layout bidimensional.
  - Media Queries para adaptação responsiva.
- **JavaScript Vanilla (ES6+):**
  - Manipulação nativa do DOM.
  - Arquitetura de estado centralizado (*State Management* simples e previsível).
  - Validações de formulário sem bibliotecas externas.
- **Recursos Externos via CDN:**
  - [Google Fonts](https://fonts.google.com/) (*Inter* e *Plus Jakarta Sans*).
  - [Font Awesome 6](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css) (Ícones de interface).

---

## 💻 Como Executar

A aplicação não necessita de instaladores, gerenciadores de pacotes (`npm`, `yarn`) ou servidores locais para rodar.

1. Clone ou baixe este repositório.
2. Navegue até a pasta `public/`.
3. Abra o arquivo `index.html` em qualquer navegador web moderno:
   - Google Chrome
   - Microsoft Edge
   - Mozilla Firefox
   - Safari / Opera

> **Dica para desenvolvedores:** Se preferir rodar em um servidor estático local, você pode usar a extensão *Live Server* do VSCode ou o comando Python:
> ```bash
> cd public
> python -m http.server 3000
> ```
> Em seguida, acerte o navegador em `http://localhost:3000`.

---

## 💾 Persistência de Dados

- Todos os dados (tarefas, projetos e configurações do perfil) são gravados automaticamente no **LocalStorage** do navegador.
- Na primeira utilização, o TASKFLOW inicializa dados demonstrativos para você explorar imediatamente a experiência de uso.
- Caso deseje restaurar os dados de exemplo ou limpar a base, utilize a opção disponível no modal de **Configurações** (no canto inferior da Sidebar).

---

## 📱 Acessibilidade e Responsividade

- **Desktop (1024px ou superior):** Layout de alta resolução com sidebar fixa de 250px, dashboard multi-colunas e visão panorâmica.
- **Tablet (768px a 1023px):** Adaptação fluida do grid de métricas e abas temporais.
- **Mobile (abaixo de 768px):** Menu lateral convertido em gaveta off-canvas retrátil com controle de toque e fechamento por clique fora (*backdrop*) ou tecla `ESC`.
- **Acessibilidade:** Suporte completo à navegação por teclado (`Tab`, `Esc` para fechar modais), contraste calibrado e anéis visuais de foco (`:focus-visible`).

---

<p align="center">
  Desenvolvido com foco em excelência de UI/UX Design &bull; <strong>TASKFLOW 2026</strong>
</p>
