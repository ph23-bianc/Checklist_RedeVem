# Integração Claude Code + Obsidian

Este repositório foi estruturado como conteúdo compatível com Obsidian: as notas em `Checklist Lojas/` usam frontmatter YAML, tags, wikilinks (`[[...]]`) e caixas de seleção — tudo reconhecido nativamente pelo Obsidian.

## Situação atual

- **Seu vault local:** `C:\Users\rapha\OneDrive\Área de Trabalho\Second Brain - Obsidian`
- **Este repositório:** conteúdo do checklist convertido de PDF para notas Obsidian.

Sessões do Claude Code na web/nuvem rodam em um servidor remoto e **não enxergam os arquivos do seu computador**. Para o Claude Code trabalhar diretamente dentro do seu vault, use uma das opções abaixo.

## Opção 1 — Claude Code local no vault (recomendado)

1. Instale o Claude Code no Windows (aplicativo desktop ou CLI: `npm install -g @anthropic-ai/claude-code`).
2. Abra um terminal na pasta do vault:
   ```powershell
   cd "C:\Users\rapha\OneDrive\Área de Trabalho\Second Brain - Obsidian"
   claude
   ```
3. Pronto: o Claude Code lê e edita as notas do vault diretamente. Peça, por exemplo, "crie uma nota diária" ou "organize minhas notas de reunião".
4. (Opcional) Crie um arquivo `CLAUDE.md` na raiz do vault descrevendo suas convenções (estrutura de pastas, formato de frontmatter, tags) — o Claude Code o lê automaticamente em cada sessão.

## Opção 2 — Sincronizar este repositório com o vault (Obsidian Git)

1. No Obsidian, instale o plugin da comunidade **Obsidian Git**.
2. Clone este repositório para dentro do vault (ou como um vault próprio):
   ```powershell
   git clone https://github.com/ph23-bianc/checklist_redevem.git
   ```
3. O plugin sincroniza automaticamente: o que o Claude Code (web ou local) enviar ao GitHub aparece no Obsidian, e vice-versa.

## Avisos

- **OneDrive + Obsidian:** manter o vault dentro do OneDrive pode gerar conflitos de sincronização (arquivos `.obsidian` sendo travados/duplicados). Se notar problemas, considere mover o vault para fora do OneDrive e usar Git ou Obsidian Sync.
- **Acentos em nomes de arquivo:** os nomes usados aqui (com acentos e espaços) funcionam normalmente no Windows e no Obsidian.

## Estrutura criada

```
Checklist Lojas/
├── Checklist de Lojas - Índice.md   ← nota hub, com links para todas as seções
├── 01 - Aparência Externa.md
├── 02 - Gôndolas.md
├── 03 - Ilha de Congelados e Geladeiras.md
├── 04 - Padaria.md
├── 05 - Açougue.md
├── 06 - FLV.md
├── 07 - Caixas.md
├── 08 - Atendimento.md
├── 09 - Promoção, Comunicação e Competitividade.md
└── 10 - Geral.md
```

Cada nota de seção contém os itens do checklist original como tarefas (`- [ ]`) e uma tabela de Plano de Ação (Plano, Objetivo, Responsável, Prazo), replicando as colunas do PDF.
