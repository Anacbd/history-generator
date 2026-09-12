import React, { useState } from "react";
import { PYTHON_STREAMLIT_CODE, REQUIREMENTS_TXT_CODE } from "../pythonCodeSnippet";
import { Copy, Check, Download, Terminal, FileCode, Sparkles } from "lucide-react";

export const PythonCodeViewer: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedReqs, setCopiedReqs] = useState(false);
  const [activeTab, setActiveTab] = useState<"app" | "reqs" | "instructions">("app");

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(PYTHON_STREAMLIT_CODE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyReqs = async () => {
    try {
      await navigator.clipboard.writeText(REQUIREMENTS_TXT_CODE);
      setCopiedReqs(true);
      setTimeout(() => setCopiedReqs(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-600" />
            <span>Código Python Pronto para Rodar</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Código Streamlit em Python
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Código limpo, estruturado e amplamente documentado com o SDK oficial do Gemini (<code>google-genai</code>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "app" && (
            <>
              <button
                id="copy-python-code-btn"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? "Copiado para a área de transferência!" : "Copiar app.py"}</span>
              </button>

              <button
                id="download-python-app-btn"
                onClick={() => handleDownloadFile("app.py", PYTHON_STREAMLIT_CODE)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                title="Baixar arquivo app.py"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Baixar app.py</span>
              </button>
            </>
          )}

          {activeTab === "reqs" && (
            <button
              id="copy-requirements-btn"
              onClick={handleCopyReqs}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              {copiedReqs ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedReqs ? "Copiado!" : "Copiar requirements.txt"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex items-center gap-2 mt-6 border-b border-slate-100 pb-3">
        <button
          onClick={() => setActiveTab("app")}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "app"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>app.py (Streamlit)</span>
        </button>

        <button
          onClick={() => setActiveTab("reqs")}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "reqs"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>requirements.txt</span>
        </button>

        <button
          onClick={() => setActiveTab("instructions")}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "instructions"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Como Rodar no seu Computador</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "app" && (
          <div className="relative">
            <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 overflow-x-auto max-h-[600px] border border-slate-800">
              <pre className="text-xs sm:text-sm font-mono text-slate-100 leading-relaxed">
                <code>{PYTHON_STREAMLIT_CODE}</code>
              </pre>
            </div>
          </div>
        )}

        {activeTab === "reqs" && (
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <pre className="text-sm font-mono text-emerald-400">
              <code>{REQUIREMENTS_TXT_CODE}</code>
            </pre>
          </div>
        )}

        {activeTab === "instructions" && (
          <div className="space-y-6 text-slate-700 py-2">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h4 className="font-semibold text-amber-900 flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Passo a Passo Rápido para Rodar no seu PC:
              </h4>
              <p className="text-sm text-amber-800">
                Você só precisa do Python 3.9+ instalado em seu sistema operacional (Windows, macOS ou Linux).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                  1
                </span>
                <h5 className="font-semibold text-slate-800 text-sm mb-1">Instalar dependências</h5>
                <p className="text-xs text-slate-500 mb-3">Abra o terminal no diretório do projeto e digite:</p>
                <code className="block bg-slate-900 text-emerald-400 text-xs p-2.5 rounded-lg font-mono">
                  pip install -r requirements.txt
                </code>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                  2
                </span>
                <h5 className="font-semibold text-slate-800 text-sm mb-1">Configurar a chave Gemini</h5>
                <p className="text-xs text-slate-500 mb-3">Crie um arquivo <code>.env</code> ou digite direto no app:</p>
                <code className="block bg-slate-900 text-emerald-400 text-xs p-2.5 rounded-lg font-mono">
                  GEMINI_API_KEY="sua_chave_aqui"
                </code>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                  3
                </span>
                <h5 className="font-semibold text-slate-800 text-sm mb-1">Iniciar o Streamlit</h5>
                <p className="text-xs text-slate-500 mb-3">Execute o comando para abrir no navegador:</p>
                <code className="block bg-slate-900 text-emerald-400 text-xs p-2.5 rounded-lg font-mono">
                  streamlit run app.py
                </code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
