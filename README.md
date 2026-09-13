# 📖 Gerador de Histórias Infantis & Storyboard

Aplicativo interativo para criação de histórias infantis personalizadas com inteligência artificial, geração automática de ilustrações, narração em áudio, visualização em storyboard com prompts prontos para Midjourney/DALL-E e exportação em formato **Jornalzinho Infantil** imprimível.

---

## ✨ Funcionalidades Principais

- **Narrativa Estruturada em 3 Capítulos**: Gera uma historinha infantil completa, com começo, meio e fim, sinopse acolhedora e lição moral adaptada para a faixa etária.
- **Ilustrações Automáticas**: Criação de imagens lúdicas de alta resolução para cada cena da história com base no estilo artístico escolhido (Aquarela, 3D Pixar, Giz de Cera, Livro Clássico, etc.).
- **Prompts de Storyboard em Inglês**: Para quem deseja gerar imagens externas no Midjourney v6 ou DALL-E 3, a IA cria prompts detalhados com descrição de iluminação, paleta de cores e consistência visual da personagem.
- **Narração com Voz Acolhedora**: Leitura em voz alta com controles de reprodução (play, pause, velocidade e tom), proporcionando uma experiência calma e agradável para crianças na hora de dormir.
- **Jornalzinho Infantil Imprimível**: Layout especial diagramado como página de jornalzinho/revista infantil com espaço para colorir, moral da história e pronto para impressão ou salvar em PDF.
- **Consistência de Personagem**: Criação de um guia visual de traços e vestimentas para manter a mesma identidade visual do protagonista em todas as cenas.
- **Versão Python / Streamlit inclusa**: Acompanha o script `app.py` com implementação completa em Python para execução local com Streamlit.

---

## 🛠️ Tecnologias Utilizadas

### Aplicação Web Principal (Node.js + React)
- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Estilização & Animações**: [Tailwind CSS v4](https://tailwindcss.com/), [Motion](https://motion.dev/), [Lucide React](https://lucide.dev/)
- **Backend / Servidor**: [Express](https://expressjs.com/) (Node.js) com rotas seguras para proteção de chaves de API
- **Inteligência Artificial**:
  - **Google Gemini API** via SDK oficial [`@google/genai`](https://www.npmjs.com/package/@google/genai) para criação das narrativas e estruturação JSON
  - **Motor de Difusão Flux**: Geração de ilustrações infantis em alta resolução

### Versão Alternativa (Python)
- **Framework**: [Streamlit](https://streamlit.io/)
- **SDK**: `google-genai` e `python-dotenv`

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior
- [npm](https://www.npmjs.com/)
- Chave de API do Google Gemini ([Google AI Studio](https://aistudio.google.com/))

---

### 1. Clonar e Instalar Dependências

```bash
# Clone o repositório ou acesse o diretório do projeto
cd gerador-historias-infantis

# Instale as dependências
npm install
```

---

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (use `.env.example` como referência):

```env
GEMINI_API_KEY="sua_chave_do_google_gemini_aqui"
```

---

### 3. Rodar em Modo de Desenvolvimento

```bash
npm run dev
```

Acesse no navegador: **`http://localhost:3000`**

---

### 4. Build de Produção

```bash
# Gerar os arquivos otimizados e compilar o servidor
npm run build

# Iniciar o servidor de produção
npm start
```

---

## 🐍 Executando a Versão em Python (Streamlit)

Se desejar executar a versão desktop/web com Python:

```bash
# 1. Instalar as dependências do Python
pip install -r requirements.txt

# 2. Configurar a chave no .env ou exportar a variável:
export GEMINI_API_KEY="sua_chave_do_google_gemini_aqui"

# 3. Executar o Streamlit
streamlit run app.py
```

---

## 📁 Estrutura de Arquivos

```text
├── .env.example              # Modelo de variáveis de ambiente
├── app.py                    # Aplicação alternativa em Python (Streamlit)
├── requirements.txt          # Dependências da versão Python
├── server.ts                 # Servidor Express com rotas de API e proxy Gemini
├── package.json              # Scripts e dependências do Node.js
├── vite.config.ts            # Configuração do Vite e Tailwind CSS
├── src/
│   ├── main.tsx              # Ponto de entrada do React
│   ├── App.tsx               # Componente principal e fluxo de telas
│   ├── types.ts              # Definições de tipos TypeScript da história
│   ├── components/
│   │   ├── StoryForm.tsx           # Formulário para personalização da história
│   │   ├── StoryboardCard.tsx      # Cartão com capítulo, imagem e prompt
│   │   ├── NarrationControlBar.tsx # Barra de controle de áudio e narração
│   │   ├── JornalzinhoView.tsx     # Visualização do jornalzinho imprimível
│   │   └── PythonCodeViewer.tsx    # Visualizador do script app.py integrado
│   └── utils/
│       └── speechUtils.ts          # Utilitários para Web Speech API (TTS)
└── public/                   # Recursos estáticos
```

---

## ⚙️ Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor Express e o Vite em modo de desenvolvimento |
| `npm run build` | Compila o frontend React e empacota o servidor Node.js |
| `npm run start` | Executa o servidor de produção compilado (`dist/server.cjs`) |
| `npm run lint` | Valida erros de sintaxe e tipos TypeScript (`tsc --noEmit`) |

---

## 🛡️ Licença

Este projeto é distribuído sob a licença **MIT**. Sinta-se livre para usar, adaptar e criar histórias mágicas! ✨
