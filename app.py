"""
====================================================================
📖 GERADOR DE HISTÓRIAS INFANTIS COM STORYBOARD & PROMPTS DE IMAGEM
====================================================================
Aplicativo desenvolvido em Python com Streamlit e a API do Google Gemini.
Gera uma história infantil em 3 capítulos com prompts descritivos detalhados
em inglês para ferramentas de IA como Midjourney ou DALL-E 3.

Como executar localmente:
1. Instale as dependências:
   pip install streamlit google-genai python-dotenv

2. Configure sua chave de API do Gemini no arquivo .env ou informe na barra lateral:
   GEMINI_API_KEY="sua_chave_aqui"

3. Execute o aplicativo:
   streamlit run app.py
====================================================================
"""

import os
import json
import streamlit as st
from dotenv import load_dotenv

# Carrega variáveis de ambiente de um arquivo .env (se existir)
load_dotenv()

# ==========================================
# 1. CONFIGURAÇÃO DA PÁGINA STREAMLIT
# ==========================================
st.set_page_config(
    page_title="Gerador de Histórias Infantis & Storyboard",
    page_icon="✨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Estilização visual personalizada para um clima acolhedor de livro infantil
st.markdown("""
<style>
    .main-title {
        font-size: 2.3rem;
        font-weight: 800;
        color: #2D3748;
        margin-bottom: 0.2rem;
    }
    .subtitle {
        font-size: 1.1rem;
        color: #718096;
        margin-bottom: 1.5rem;
    }
    .chapter-box {
        background-color: #F7FAFC;
        border-left: 5px solid #4F46E5;
        padding: 1.2rem;
        border-radius: 8px;
        margin-bottom: 1.2rem;
    }
    .prompt-box {
        background-color: #1E1E2E;
        color: #CDD6F4;
        padding: 1rem;
        border-radius: 8px;
        font-family: monospace;
        font-size: 0.9rem;
        margin-top: 0.5rem;
    }
</style>
""", unsafe_allow_html=True)

# ==========================================
# 2. BARRA LATERAL (CONFIGURAÇÕES & API KEY)
# ==========================================
with st.sidebar:
    st.header("⚙️ Configurações")
    
    # Obtém a chave da variável de ambiente ou permite que a usuária digite
    env_api_key = os.getenv("GEMINI_API_KEY", "")
    api_key = st.text_input(
        "Chave da API Gemini:",
        value=env_api_key,
        type="password",
        help="Obtenha sua chave gratuita no Google AI Studio (https://aistudio.google.com/)"
    )
    
    # Seleção de Modelo Gemini
    model_choice = st.selectbox(
        "Modelo do Gemini:",
        options=["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"],
        index=0,
        help="Modelos Flash são rápidos e excelentes para textos criativos e estruturados."
    )
    
    # Estilo visual para os prompts de imagem
    visual_style = st.selectbox(
        "Estilo visual das Ilustrações:",
        options=[
            "Whimsical watercolor children's book illustration, soft pastel tones, cozy lighting",
            "3D animated movie style (Pixar/Disney inspired), rich textures, vibrant warm colors",
            "Vintage storybook illustration, intricate hand-drawn ink and gouache, textured paper",
            "Playful cut-paper collage and clay illustration, tactile, high contrast"
        ],
        index=0,
        help="Esse estilo guiará os prompts em inglês para Midjourney e DALL-E."
    )
    
    st.divider()
    st.subheader("🎙️ Voz da Narração")
    genero_voz = st.radio(
        "Voz do(a) Narrador(a):",
        options=["Feminina (Doce & Acolhedora)", "Masculina (Calma & Serena)"],
        index=0,
        help="Voz suave, amigável e pausada para crianças."
    )
    ritmo_voz = st.selectbox(
        "Ritmo da leitura:",
        options=["Contação de Histórias (0.90x - ideal)", "Hora de Dormir (0.82x - super calma)", "Normal (1.0x)"],
        index=0
    )

    st.divider()
    st.caption("✨ Dica: Copie os prompts gerados em inglês e use diretamente no Midjourney (adicione `--ar 16:9 --v 6.0`) ou no DALL-E 3.")


# ==========================================
# 3. FUNÇÃO QUE CHAMA A API DO GEMINI
# ==========================================
def gerar_historia_e_storyboard(tema: str, personagem: str, moral: str, estilo: str, chave_api: str, modelo: str) -> dict:
    """
    Executa a chamada ao Gemini utilizando as System Instructions estruturadas
    e força a saída em formato JSON contendo os 3 capítulos e os prompts em inglês.
    """
    # Importa o SDK oficial do Google GenAI
    try:
        from google import genai
        from google.genai import types
    except ImportError:
        raise ImportError("O pacote 'google-genai' não está instalado. Execute: pip install google-genai")

    # Inicializa o cliente do Gemini
    client = genai.Client(api_key=chave_api)

    # ------------------------------------------------------------------
    # INSTRUÇÕES INTERNAS PARA A IA (SYSTEM INSTRUCTIONS)
    # ------------------------------------------------------------------
    # Garantem que o modelo respeite estritamente:
    # 1. Narrativa infantil dividida em 3 capítulos curtos e cativantes.
    # 2. Para cada capítulo, um prompt descritivo detalhado em inglês
    #    otimizado para Midjourney e DALL-E com coerência visual.
    # ------------------------------------------------------------------
    system_instruction = f"""
Você é um autor renomado de literatura infantil e diretor de arte especialista em storyboard e prompts para inteligência artificial generativa de imagens (como Midjourney v6 e DALL-E 3).

Sua missão é criar uma história infantil cativante, doce e lúdica em 3 capítulos curtos a partir dos dados do usuário.

REGRAS OBRIGATÓRIAS DE ESTRUTURA:
1. Divida a história estritamente em 3 capítulos curtos:
   - Capítulo 1: O Início da Jornada (Apresentação da personagem e a curiosidade/desejo inicial).
   - Capítulo 2: O Grande Desafio (O momento de superação, dúvida ou aprendizado prático).
   - Capítulo 3: A Resolução e a Celebração (O desfecho carinhoso destacando a lição moral).

2. Para CADA capítulo, você deve fornecer:
   - 'chapter_number': O número do capítulo (1, 2 ou 3).
   - 'chapter_title': Título cativante do capítulo em português.
   - 'story_text': O texto narrativo em português (do Brasil), rico em sensibilidade, magia e adequado para o público infantil.
   - 'scene_description': Resumo da cena chave deste capítulo em português.
   - 'image_prompt': Um prompt altamente descritivo e detalhado EM INGLÊS, otimizado para Midjourney v6 ou DALL-E 3.
     O prompt deve incluir:
     * Descrição consistente da personagem principal (roupas, cores características, traços expressivos).
     * Ambiente e cenário da cena em detalhes.
     * Estilo visual: {estilo}.
     * Iluminação e atmosfera (ex: soft golden hour sunlight, magical whimsical glow).
     * Composição da câmera (ex: wide shot, cinematic storybook spread, eye-level).
     * Termos de qualidade: 'children's book illustration, highly detailed, masterwork, vibrant colors, no text, no letters, no watermark'.

Retorne sua resposta estritamente no formato JSON válido, sem cercaduras markdown extras além do json.
"""

    # Prompt do usuário com os parâmetros fornecidos
    user_prompt = f"""
Por favor, crie uma história infantil completa e os 3 prompts de storyboard com os seguintes parâmetros:
- Tema da história: "{tema}"
- Nome da personagem principal: "{personagem}"
- Lição moral: "{moral}"
"""

    # Esquema JSON rigoroso para garantir a estrutura correta dos 3 capítulos
    response_schema = {
        "type": "OBJECT",
        "properties": {
            "title": {"type": "STRING", "description": "Título mágico do livro infantil"},
            "synopsis": {"type": "STRING", "description": "Breve sinopse carinhosa da história"},
            "character_visual_notes": {"type": "STRING", "description": "Descrição dos traços visuais da personagem para manter consistência nas imagens"},
            "moral_lesson": {"type": "STRING", "description": "A lição moral expressa com carinho"},
            "chapters": {
                "type": "ARRAY",
                "description": "Lista contendo exatamente os 3 capítulos",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "chapter_number": {"type": "INTEGER"},
                        "chapter_title": {"type": "STRING"},
                        "story_text": {"type": "STRING"},
                        "scene_description": {"type": "STRING"},
                        "image_prompt": {"type": "STRING"}
                    },
                    "required": ["chapter_number", "chapter_title", "story_text", "scene_description", "image_prompt"]
                }
            }
        },
        "required": ["title", "synopsis", "character_visual_notes", "moral_lesson", "chapters"]
    }

    import time

    # Lista de modelos candidatos para fallback caso ocorra erro 503 (alta demanda temporária)
    modelos_candidatos = [modelo]
    for alt in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]:
        if alt not in modelos_candidatos:
            modelos_candidatos.append(alt)

    ultimo_erro = None
    for mod in modelos_candidatos:
        for tentativa in range(1, 3):
            try:
                response = client.models.generate_content(
                    model=mod,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.8,
                        response_mime_type="application/json",
                        response_schema=response_schema
                    )
                )

                if not response.text:
                    raise ValueError("A resposta da IA veio vazia.")

                cleaned = response.text.strip()
                if cleaned.startswith("```json"):
                    cleaned = cleaned[7:].strip()
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3].strip()

                return json.loads(cleaned)
            except Exception as e:
                ultimo_erro = e
                err_str = str(e)
                # Se for erro 503 (alta demanda) ou 429, aguarda e tenta novamente
                if "503" in err_str or "demand" in err_str.lower() or "unavailable" in err_str.lower() or "429" in err_str:
                    time.sleep(1.5 * tentativa)
                else:
                    break

    raise ultimo_erro or RuntimeError("Falha ao gerar história com Gemini.")


# ==========================================
# 4. INTERFACE PRINCIPAL (CAMPOS DE ENTRADA)
# ==========================================
st.markdown('<div class="main-title">✨ Gerador de Histórias Infantis & Storyboard</div>', unsafe_allow_html=True)
st.markdown('<div class="subtitle">Crie contos mágicos em 3 capítulos com prompts detalhados para ilustrações no Midjourney ou DALL-E.</div>', unsafe_allow_html=True)

# Sugestões rápidas para inspirar o usuário
with st.expander("💡 Ideias e Sugestões Prontas (Clique para ver exemplos)", expanded=False):
    col_ex1, col_ex2, col_ex3 = st.columns(3)
    with col_ex1:
        st.markdown("**Tema:** Amizade e Cooperação  \n**Personagem:** Nina, a pequena corujinha  \n**Moral:** Juntos conseguimos voar mais longe.")
    with col_ex2:
        st.markdown("**Tema:** Coragem e Superação  \n**Personagem:** Lucas, o leãozinho tímido  \n**Moral:** A verdadeira bravura é tentar mesmo com medo.")
    with col_ex3:
        st.markdown("**Tema:** Curiosidade e Ciência  \n**Personagem:** Pipoca, a gatinha astrônoma  \n**Moral:** O universo se abre para quem não tem medo de perguntar.")

# Formulário de entrada
with st.form(key="story_form"):
    col1, col2 = st.columns(2)
    
    with col1:
        tema = st.text_input(
            "1. Tema da história:",
            placeholder="Ex: Amizade na floresta, Coragem para nadar, Descoberta das cores",
            help="O tema central que guiará a narrativa."
        )
        personagem = st.text_input(
            "2. Nome da personagem principal:",
            placeholder="Ex: Clara, Pipoca a raposinha, Benício, Otto o polvo",
            help="O nome e se desejar uma característica ou espécie da personagem."
        )

    with col2:
        moral = st.text_area(
            "3. Lição moral que a história deve transmitir:",
            placeholder="Ex: Aprender a compartilhar traz alegria; Não devemos julgar os outros pela aparência; O amor da família sempre nos acolhe.",
            help="A mensagem educativa e emocional que o conto deixará para a criança."
        )

    submit_button = st.form_submit_button("🚀 Gerar História e Storyboard", use_container_width=True)


# ==========================================
# 5. PROCESSAMENTO E EXIBIÇÃO DOS RESULTADOS
# ==========================================
if submit_button:
    # Validações de entrada
    if not api_key:
        st.error("⚠️ Por favor, insira sua chave da API do Gemini na barra lateral para continuar.")
    elif not tema.strip():
        st.warning("⚠️ Por favor, preencha o **Tema da história**.")
    elif not personagem.strip():
        st.warning("⚠️ Por favor, preencha o **Nome da personagem principal**.")
    elif not moral.strip():
        st.warning("⚠️ Por favor, preencha a **Lição moral**.")
    else:
        with st.spinner("🪄 Criando a história mágica e formulando os prompts de storyboard..."):
            try:
                dados = gerar_historia_e_storyboard(
                    tema=tema,
                    personagem=personagem,
                    moral=moral,
                    estilo=visual_style,
                    chave_api=api_key,
                    modelo=model_choice
                )
                
                # Armazena os dados na sessão do Streamlit
                st.session_state["dados_historia"] = dados
                st.success("🎉 História e Storyboard gerados com sucesso!")
            except Exception as e:
                st.error(f"Erro ao gerar a história: {str(e)}")

# Se já houver história gerada na sessão, exibe
if "dados_historia" in st.session_state:
    dados = st.session_state["dados_historia"]
    
    st.divider()
    
    # Cabeçalho da História
    st.subheader(f"📚 {dados.get('title', 'História Encantada')}")
    st.markdown(f"*{dados.get('synopsis', '')}*")
    
    col_meta1, col_meta2 = st.columns(2)
    with col_meta1:
        st.info(f"**🌟 Lição Moral:** {dados.get('moral_lesson', '')}")
    with col_meta2:
        st.info(f"**🎨 Guia Visual da Personagem:** {dados.get('character_visual_notes', '')}")

    st.write("### 🗞️ Escolha o Modo de Visualização")
    
    tab_jornal, tab_storyboard = st.tabs([
        "📰 Modo Jornalzinho Infantil (A Gazeta das Crianças)",
        "🎬 Modo Storyboard & Prompts de IA (Midjourney / DALL-E)"
    ])

    chapters = dados.get("chapters", [])
    
    # -------------------------------------------------------------
    # ABA 1: MODO JORNALZINHO INFANTIL (DIAGRAMAÇÃO DE JORNAL)
    # -------------------------------------------------------------
    with tab_jornal:
        st.markdown(f"""
        <div style="background-color: #FCF9F2; border: 2px solid #D8CEBA; border-radius: 16px; padding: 2rem; font-family: serif; color: #24211E; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="border-bottom: 2px solid #24211E; padding-bottom: 6px; font-family: monospace; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; display: flex; justify-content: space-between; color: #5C5346;">
                <span>✨ EDIÇÃO ESPECIAL INFANTIL • ANO I</span>
                <span>PREÇO: 1 GRANDE SORRISO</span>
            </div>
            <div style="text-align: center; border-bottom: 4px double #24211E; padding: 1.5rem 0 1rem 0; margin-bottom: 1.5rem;">
                <div style="font-size: 0.8rem; font-family: sans-serif; font-weight: bold; letter-spacing: 4px; color: #7A6E5C; text-transform: uppercase;">
                    O Semanário dos Sonhos e da Imaginação
                </div>
                <h1 style="font-size: 2.8rem; font-weight: 900; margin: 0.5rem 0; text-transform: uppercase; color: #1A1815;">
                    O Diário Encantado
                </h1>
                <p style="font-style: italic; color: #5C5346; margin: 0;">
                    "Notícias do Reino da Fantasia • Lições de Amor e Coragem para Pequenos Leitores"
                </p>
            </div>
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <h2 style="font-size: 1.9rem; font-weight: bold; color: #1E1B18; margin-bottom: 0.5rem;">
                    {dados.get('title', 'A Grande Aventura')}
                </h2>
                <p style="font-size: 1.1rem; font-style: italic; color: #4A4337; max-width: 800px; margin: auto;">
                    "{dados.get('synopsis', '')}"
                </p>
            </div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)

        # Matérias do Jornal com Imagens Automáticas
        for i, cap in enumerate(chapters):
            col_img, col_txt = st.columns([1, 1.2])
            
            prompt_encoded = cap.get('image_prompt', '').replace('"', '').replace('\n', ' ')
            seed_img = 1000 + i * 777
            img_url = f"https://image.pollinations.ai/prompt/{prompt_encoded}%2C%20storybook%20illustration%2C%20soft%20warm%20colors?width=800&height=600&seed={seed_img}&model=flux&nologo=true"

            with col_img:
                st.image(img_url, caption=f"Ilustração Oficial: {cap.get('scene_description', '')}", use_container_width=True)
            
            with col_txt:
                st.markdown(f"### 📰 Ato {cap.get('chapter_number', i+1)}: {cap.get('chapter_title', '')}")
                st.markdown(f"""
                <div style="font-size: 1.1rem; line-height: 1.8; color: #2B2723; font-family: serif; text-align: justify;">
                    {cap.get('story_text', '')}
                </div>
                """, unsafe_allow_html=True)
            st.divider()

        # Editorial de Fechamento do Jornal
        st.markdown(f"""
        <div style="background-color: #EFE7D2; border: 2px solid #D1C4AB; border-radius: 12px; padding: 1.2rem; font-family: serif;">
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1.2rem; color: #241F18;">❤️ EDITORIAL: A Lição do Dia</h4>
            <p style="font-style: italic; font-size: 1.05rem; margin: 0; color: #3B3428;">
                "{dados.get('moral_lesson', '')}"
            </p>
        </div>
        """, unsafe_allow_html=True)

    # -------------------------------------------------------------
    # ABA 2: MODO STORYBOARD & PROMPTS DE IA
    # -------------------------------------------------------------
    with tab_storyboard:
        tab_titles = [f"Capítulo {c.get('chapter_number', i+1)}: {c.get('chapter_title', '')}" for i, c in enumerate(chapters)]
        
        if tab_titles:
            tabs = st.tabs(tab_titles)
            
            for i, (tab, cap) in enumerate(zip(tabs, chapters)):
                with tab:
                    st.markdown(f"#### 📖 {cap.get('chapter_title', f'Capítulo {i+1}')}")

                    # Imagem Automática do Capítulo
                    prompt_encoded = cap.get('image_prompt', '').replace('"', '').replace('\n', ' ')
                    seed_img = 1000 + i * 777
                    img_url = f"https://image.pollinations.ai/prompt/{prompt_encoded}%2C%20storybook%20illustration%2C%20soft%20warm%20colors?width=800&height=600&seed={seed_img}&model=flux&nologo=true"
                    st.image(img_url, caption=f"Ilustração Gerada Automaticamente (Flux Engine): {cap.get('scene_description', '')}", use_container_width=True)

                    # Botão de Narração em Voz Alta com Voz Suave / Serena
                    import streamlit.components.v1 as components
                    is_female = "Feminina" in genero_voz
                    taxa = 0.82 if "Dormir" in ritmo_voz else (0.90 if "Contação" in ritmo_voz else 1.0)
                    tom = 1.05 if is_female else 0.88
                    texto_limpo = cap.get('story_text', '').replace('"', '\\"').replace('\n', ' ')
                    titulo_limpo = cap.get('chapter_title', '').replace('"', '\\"')

                    components.html(
                        f"""
                        <div style="font-family: sans-serif; display: flex; align-items: center; gap: 8px;">
                            <button onclick="narrarCap_{i}()" style="background: linear-gradient(135deg, #FEF3C7, #FDE68A); color: #92400E; border: 1px solid #F59E0B; padding: 7px 14px; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                                <span>{"👩" if is_female else "👨"}</span>
                                <span>Ouvir com Voz {"Feminina Suave" if is_female else "Masculina Serena"}</span>
                            </button>
                            <button onclick="window.speechSynthesis.cancel()" style="background: #F1F5F9; color: #475569; border: 1px solid #CBD5E1; padding: 7px 12px; border-radius: 9px; font-size: 12px; cursor: pointer;">
                                ⏹️ Parar
                            </button>
                        </div>
                        <script>
                        function narrarCap_{i}() {{
                            window.speechSynthesis.cancel();
                            const utter = new SpeechSynthesisUtterance("{titulo_limpo}. {texto_limpo}");
                            utter.lang = "pt-BR";
                            utter.rate = {taxa};
                            utter.pitch = {tom};
                            const voices = window.speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().startsWith("pt"));
                            const target = voices.find(v => {
                                const n = v.name.toLowerCase();
                                return {"(n.includes('luciana') || n.includes('leticia') || n.includes('maria') || n.includes('female') || n.includes('google'))" if is_female else "(n.includes('felipe') || n.includes('daniel') || n.includes('antonio') || n.includes('male'))"};
                            });
                            if (target) utter.voice = target;
                            window.speechSynthesis.speak(utter);
                        }}
                        </script>
                        """,
                        height=46
                    )
                    
                    # Texto da história
                    st.markdown(f"""
                    <div class="chapter-box">
                        <p style="font-size: 1.15rem; line-height: 1.8; color: #2D3748;">
                            {cap.get('story_text', '')}
                        </p>
                    </div>
                    """, unsafe_allow_html=True)
                    
                    st.markdown(f"**🖼️ Descrição da Cena:** {cap.get('scene_description', '')}")
                    
                    # Prompt de Imagem em Inglês
                    st.markdown("**🎨 Prompt para Gerador de Imagem (Midjourney / DALL-E):**")
                    st.code(cap.get('image_prompt', ''), language="text")
                    
                    st.caption("💡 *Dica:* Para o Midjourney, você pode adicionar parâmetros como `--ar 16:9 --v 6.0` ao final do prompt.")

    # Opção para baixar a história completa
    st.divider()
    texto_completo = f"# {dados.get('title', 'História Infantil')}\n\n"
    texto_completo += f"**Sinopse:** {dados.get('synopsis', '')}\n\n"
    texto_completo += f"**Lição Moral:** {dados.get('moral_lesson', '')}\n\n"
    texto_completo += f"**Guia de Personagem:** {dados.get('character_visual_notes', '')}\n\n"
    texto_completo += "---\n\n"
    for cap in chapters:
        texto_completo += f"## Capítulo {cap.get('chapter_number')}: {cap.get('chapter_title')}\n\n"
        texto_completo += f"{cap.get('story_text')}\n\n"
        texto_completo += f"**Cena:** {cap.get('scene_description')}\n\n"
        texto_completo += f"**Prompt de Imagem (Midjourney / DALL-E):**\n```\n{cap.get('image_prompt')}\n```\n\n---\n\n"

    st.download_button(
        label="📥 Baixar História e Prompts (.txt / .md)",
        data=texto_completo,
        file_name=f"{dados.get('title', 'historia_infantil').lower().replace(' ', '_')}.md",
        mime="text/markdown"
    )
