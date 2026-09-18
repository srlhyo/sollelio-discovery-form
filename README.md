# Sollelio · Do Luxo à Mesa — Formulário Digital de Product Discovery (Ronda 3)

Aplicação digital moderna e mobile-first desenhada especificamente para recolher feedback honesto, aprofundado e seguro dos colaboradores/staff de eventos para o Product Discovery da **Sollelio** e **Do Luxo à Mesa**.

---

## 🎯 Principais Destaques de UX e Arquitetura

1. **22 Perguntas Qualitativas Fiéis ao PDF**:
   - Organizadas nos **5 blocos temáticos originais** (A a E).
   - Não sobrecarrega o utilizador com uma lista interminável de uma só página nem com o cansaço de 22 ecrãs individuais ("stepped thematic chunks").
   - Inclui chips de clique rápido para quebrar o "bloqueio da página em branco" e acelerar a reflexão.

2. **Ditado por Voz Nativo (Speech-to-Text)**:
   - Integrado diretamente em cada campo de texto (suporte em pt-PT).
   - O colaborador de eventos pode simplesmente falar em vez de digitar parágrafos longos no teclado virtual do telemóvel.

3. **Garantia Arquitetural de Anonimato & Segurança Psicológica**:
   - Escolha claríssima no início: **"Responder Identificado"** vs **"100% Anónimo"**.
   - Em modo anónimo, o servidor recusa e nunca armazena nomes, contactos, endereços IP ou identificadores de dispositivo.
   - Reforço de segurança psicológica na pergunta sensível sobre erros (Q8), desmistificando o medo de julgamento.

4. **Persistência Concorrente e Autosave Resiliente**:
   - Motor SQLite de alta performance com **WAL Mode (Write-Ahead Logging)** nativo no Node.js 26.
   - Cada colaborador possui uma sessão independente com token criptográfico seguro.
   - Autosave contínuo com fallback offline no `localStorage`: se a rede falhar ou a bateria acabar, nada é perdido.
   - Submissão atómica com prevenção de *double-submits*.

5. **Painel de Gestão e Análise de Product Discovery (`/admin`)**:
   - **Síntese Temática**: Permite ler todas as respostas à mesma pergunta lado a lado (ex: comparar todas as perspetivas sobre "WhatsApp vs Plataforma" ou "Critérios de aceitação").
   - **Explorador Individual**: Consulta a ficha completa de cada colaborador.
   - **Exportação CSV**: Base de dados completa com BOM UTF-8 para Excel / Sheets.
   - **Relatório PDF Oficial**: Gera automaticamente um dossiê editorial em formato A4 para análise interna e partilha executiva.

---

## 🚀 Como Executar

### 1. Instalação e Desenvolvimento
```bash
# Instalar dependências (caso seja clonado noutro ambiente)
npm install

# Iniciar em modo de desenvolvimento
npm run dev
```

O formulário fica disponível em: `http://localhost:3000`  
O painel de administração fica em: `http://localhost:3000/admin`  
*(Chave de acesso padrão: `sollelio-discovery-2026`)*

### 2. Build de Produção
```bash
npm run build
npm start
```

### 3. Validação Automatizada de Sistema
Para testar concorrência multissessão, isolamento e integridade do anonimato:
```bash
npm run test:system # ou npx tsx scripts/verify_system.js
```

---

## 🔒 Variáveis de Ambiente (Opcional)

Podes definir um ficheiro `.env.local` na raiz:
```env
ADMIN_KEY="sollelio-discovery-2026"
```
