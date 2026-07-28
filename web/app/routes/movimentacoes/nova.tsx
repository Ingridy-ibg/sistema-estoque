import { redirect, useLoaderData, useActionData, useNavigation, Form } from "react-router";
import { apiFetch } from "../../lib/api-client";
import type { Route } from "./+types/nova";
import { useState } from "react";

interface Produto {
  id: number;
  nome: string;
  unidade_medida: string;
  quantidade_atual: string;
}

export async function clientLoader() {
  const produtos: Produto[] = await apiFetch("/produtos");
  return { produtos };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();

  try {
    await apiFetch("/movimentacoes", {
      method: "POST",
      body: JSON.stringify({
        produto_id: Number(formData.get("produto_id")),
        tipo: formData.get("tipo"),
        quantidade: Number(formData.get("quantidade")),
        motivo: formData.get("motivo") || undefined,
      }),
    });
    return redirect("/produtos");
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : "Erro ao registrar movimentação" };
  }
}

export default function NovaMovimentacao() {
  const { produtos } = useLoaderData<typeof clientLoader>();
  const actionData = useActionData<typeof clientAction>();
  const navigation = useNavigation();
  const enviando = navigation.state === "submitting";
  const [ busca, setBusca ] = useState("");
  const [produtoId, setProdutoId] = useState("");

  const produtosFiltrados = produtos.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()),
);

  return (
    <div>
      <Form method="post" style={{ maxWidth: 200, margin: "0 auto" }}>

        <div>
          <div><label htmlFor="busca">Buscar produto</label><br /> 
          <input
          id= "busca"
          type= "text"
          value= {busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="digite aqui"
          />
          </div>
         
         <input type="hidden" name="produto_id" value={produtoId} />

          <div
            style={{
              marginTop: 8,
              maxHeight: 200,
              overflowY: "auto",
              border: "1px solid var(--border)",
              borderRadius: 4,
            }}>
          
              {produtosFiltrados.map((p) => {
              const selecionado = String(p.id) === produtoId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProdutoId(String(p.id))}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    borderRadius: 0,
                    padding: "8px 10px",
                    background: selecionado ? "var(--accent-bg)" : "transparent",
                    color: selecionado ? "var(--accent-text)" : "var(--text)",
                  }}
                >
                  {p.nome}
                </button>
              );
            })}
            {produtosFiltrados.length === 0 && (
              <p style={{ padding: "8px 10px", color: "var(--text-muted)" }}>
                Nenhum produto encontrado.
              </p>
            )}
          </div>
        </div>

        <div style={{ marginTop: 12}}>
          <label htmlFor="tipo">Tipo</label><br />
          <select id="tipo" name="tipo" required>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          <label htmlFor="quantidade">Quantidade</label><br />
          <input 
          id="quantidade" 
          name="quantidade" 
          type="number" 
          step="0.01" 
          min="0.01" 
          placeholder= "digite aqui"
          required />
        </div>

        <div style={{ marginTop: 12 }}>
          <label htmlFor="motivo">Motivo (opcional)</label><br />
          <input 
          id="motivo" 
          name="motivo" 
          type="text" 
          placeholder= "digite aqui"
          />
        </div>

        {actionData?.erro && <p className="erro">{actionData.erro}</p>}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <button 
        type="submit" 
        disabled={enviando} 
        style={{ background: "var(--accent-bg)", color: "var(--accent-text)", marginTop: 16 }}>
          {enviando ? "Registrando..." : "Registrar"}
        </button>
        </div>
        
      </Form>
    </div>
  );
}