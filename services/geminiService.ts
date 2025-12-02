

import { GoogleGenAI, Type } from "@google/genai";
import { AQFResult } from '../types';

// FIX: Per @google/genai guidelines, GoogleGenAI should be initialized with process.env.API_KEY directly within the function call, not globally.
export const analyzeBreakdown = async (
  machineName: string,
  description: string,
  context: string
): Promise<AQFResult> => {
  // FIX: API key should be accessed directly from process.env as per guidelines.
  // The check for the key's existence is preserved to support the mock data fallback mechanism.
  if (!process.env.API_KEY) {
    console.warn("API Key not found, returning mock data.");
    // Return mock if no key for demo purposes
    return {
      ishikawa: {
        metodo: "Tensão/alinhamento possivelmente incorretos. Procedimento operacional não exigia medição.",
        material: "Correia sujeita a fadiga (ciclos frequentes). Possível incerteza quanto à especificação aftermarket.",
        maoDeObra: "Ajuste realizado sem ferramental de tensão. Critério não documentado.",
        meioAmbiente: "Sem influência (sem poeira/óleo excessivo).",
        maquina: "Eixo com desgaste prévio. Partidas frequentes gerando picos de tensão."
      },
      whyAnalysis: {
        path1: {
          title: "Ajuste de setup incorreto",
          whys: [
            "Fadiga/ruptura por carregamento localizado",
            "Tensão e/ou alinhamento incorretos após ajuste",
            "Ausência de medição obrigatória e procedimento incompleto",
            "Procedimento operacional incompleto",
            ""
          ],
          rootCause: "Falta de procedimento padronizado com medição obrigatória de tensão (latente de gestão)."
        },
        path2: {
          title: "Partidas/paradas frequentes",
          whys: [
            "Ciclos mecânicos repetidos geraram picos de tensão",
            "Falta de soft-start ou controle de rampa",
            "", "", ""
          ],
          rootCause: "Ausência de sistema de controle de partida suave em ciclos mecânicos excessivos."
        },
        path3: {
          title: "Desgaste no eixo/polia",
          whys: [
            "Concentrou carga",
            "Superfície de contato fora de especificação (desgaste prévio)",
            "Por que não detectado antes?",
            "Critérios/inspeções insuficientes",
            ""
          ],
          rootCause: "Critérios de inspeção inadequados e ausência de monitoramento dimensional."
        }
      },
      conclusion: "Quebra da correia por tensão/alinhamento inadequados após ajuste de setup, agravada por partidas frequentes e histórico de desgaste no eixo. Fator latente determinante: ausência de procedimento padronizado.",
      actionPlan: [
        { what: "Medir/registrar tensão com medidor após intervenções", who: "Técnicos", when: "Imediato", status: "Pendente" },
        { what: "Fornecer medidor de tensão e ferramenta de alinhamento", who: "Gestão", when: "27/12/2025", status: "Pendente" },
        { what: "Implementar soft-start (se aplicável)", who: "Engenharia", when: "30/01/2026", status: "Planejado" },
        { what: "Recuperação de eixos para restaurar dimensões originais", who: "Oficina", when: "27/12/2025", status: "Pendente" }
      ]
    };
  }

  // FIX: Initialize GoogleGenAI inside the function scope with the API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const prompt = `
      Atue como um Engenheiro Sênior de Confiabilidade. Preencha o Formulário de Análise de Quebra e Falha (AQF) para o evento abaixo.
      
      Máquina: ${machineName}
      Problema: ${description}
      Detalhes: ${context}
      
      Gere um objeto JSON estrito com os seguintes campos para preencher o formulário:
      1. ishikawa: Causas potenciais divididas em (metodo, material, maoDeObra, meioAmbiente, maquina).
      2. whyAnalysis: 3 caminhos de análise dos 5 Porquês (path1, path2, path3). Cada path tem um 'title' (causa primária), um array 'whys' (as perguntas/respostas) e uma 'rootCause'.
      3. conclusion: Resumo técnico final.
      4. actionPlan: Array de ações (what, who, when, status).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ishikawa: {
              type: Type.OBJECT,
              properties: {
                metodo: { type: Type.STRING },
                material: { type: Type.STRING },
                maoDeObra: { type: Type.STRING },
                meioAmbiente: { type: Type.STRING },
                maquina: { type: Type.STRING }
              },
              required: ["metodo", "material", "maoDeObra", "meioAmbiente", "maquina"]
            },
            whyAnalysis: {
              type: Type.OBJECT,
              properties: {
                path1: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    whys: { type: Type.ARRAY, items: { type: Type.STRING } },
                    rootCause: { type: Type.STRING }
                  },
                  required: ["title", "whys", "rootCause"]
                },
                path2: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    whys: { type: Type.ARRAY, items: { type: Type.STRING } },
                    rootCause: { type: Type.STRING }
                  },
                  required: ["title", "whys", "rootCause"]
                },
                path3: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    whys: { type: Type.ARRAY, items: { type: Type.STRING } },
                    rootCause: { type: Type.STRING }
                  },
                  required: ["title", "whys", "rootCause"]
                }
              },
              required: ["path1", "path2", "path3"]
            },
            conclusion: { type: Type.STRING },
            actionPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  what: { type: Type.STRING },
                  who: { type: Type.STRING },
                  when: { type: Type.STRING },
                  status: { type: Type.STRING }
                },
                required: ["what", "who", "when", "status"]
              }
            }
          },
          required: ["ishikawa", "whyAnalysis", "conclusion", "actionPlan"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta da IA");
    
    // FIX: Trim the response text before parsing as JSON, as per best practices.
    return JSON.parse(text.trim()) as AQFResult;

  } catch (error) {
    console.error("Falha na Análise AQF:", error);
    // Return a safe fallback (Empty structure)
    return {
      ishikawa: { metodo: "", material: "", maoDeObra: "", meioAmbiente: "", maquina: "" },
      whyAnalysis: {
        path1: { title: "", whys: [], rootCause: "" },
        path2: { title: "", whys: [], rootCause: "" },
        path3: { title: "", whys: [], rootCause: "" }
      },
      conclusion: "Erro ao gerar análise. Tente novamente.",
      actionPlan: []
    };
  }
};