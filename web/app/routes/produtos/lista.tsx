import { Link, useLoaderData, useSubmit, Form } from "react-router";
import { apiFetch } from "../../lib/api-client";
import type { Route } from "./+types/lista";
import { moeda } from "../../lib/formato";

interface Produto {
  id: number;
  nome: string;
  unidade_medida: string;
  quantidade_atual: string;
  quantidade_minima: string;
  preco_custo: string;
  preco_venda: string;
  categorias: { nome: string } | null;
}

interface Categoria {
  id: number;
  nome: string;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();

  try {
    await apiFetch(`/produtos/${formData.get("id")}`, { method: "DELETE" });
    return { ok: true };
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : "Erro ao excluir produto" };
  }
}

export async function clientLoader( { request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const categoriaId = url.searchParams.get("categoria_id") ?? "";

  const [produtos, categorias] = await Promise.all([
    apiFetch(`/produtos${categoriaId ? `?categoria_id=${categoriaId}` : ""}`),
    apiFetch("/categorias"),
  ]);
  return { produtos: produtos as Produto[], categorias: categorias as Categoria[], categoriaId };

} 

export default function ListaProdutos() {
  const { produtos, categorias, categoriaId } = useLoaderData<typeof clientLoader>();
  const submit = useSubmit();

  return (
    <div>
      
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Form method="get" onChange={(e) => submit(e.currentTarget)} style={{ marginTop: 16 }}>
        <label htmlFor="categoria_id">Filtrar por categoria: </label>
        <select id="categoria_id" name="categoria_id" defaultValue={categoriaId}>
          <option value="">Todas</option>
           <option value="sem">Sem categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </Form>
      
        <Link to="/produtos/novo"><button style={{background: "var(--accent-bg)", color: "var(--accent-text)"}}>Novo Produto</button></Link>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>

         <colgroup>
            <col style={{ width: "26%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>

        <thead>
            <th>Nome</th>
            <th>Categoria</th>
            <th className="numero">Estoque</th>
            <th className="numero">Mínimo</th>
            <th className="numero">Custo</th>
            <th className="numero">Venda</th>
            <th></th>
        </thead>

        <tbody>
          {produtos.map((produto) => {
            const emFalta = Number(produto.quantidade_atual) < Number(produto.quantidade_minima);
            return (
              <tr
                key={produto.id}
                className={
                   emFalta ? "em-falta" : undefined
                }
              >
                <td>
                <Link to={`/movimentacoes/nova?produto_id=${produto.id}`}
                className="link-discreto">
                  {produto.nome}</Link></td>
                <td>{produto.categorias?.nome ?? "—"}</td>
                <td className="numero">{produto.quantidade_atual} {produto.unidade_medida}</td>
                <td className="numero">{produto.quantidade_minima}</td>
                <td className="numero">{moeda(produto.preco_custo)}</td>
                <td className="numero">{moeda(produto.preco_venda)}</td>

                <td style={{ paddingLeft: 20 }}>
                <div style={{ display: "flex", gap: 8 }}>

          <td>
          <div style = {{ display: "flex", gap: 4, alignItems: "center" }}>

                  <Link
                    to={`/movimentacoes?produto_id=${produto.id}&periodo=todos`}
                    title="Histórico"
                    aria-label="Histórico"
                    style={{
                      color: "var(--text-muted)",
                      display: "inline-flex",
                      alignItems: "center",
                      padding: 6,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                  </Link>

                <Link
                  to={`/produtos/${produto.id}/editar`}
                  title="Editar"
                  aria-label="Editar"
                  style={{
                    color: "var(--edit-button-bg)",
                    display: "inline-flex",
                    alignItems: "center",
                    padding: 6,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </Link>

                  <Form
                    method="post"
                    onSubmit={(e) => {
                      if (!confirm(`Excluir "${produto.nome}"?`)) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="id" value={produto.id} />

                   <button
                    type="submit"
                    title="Excluir"
                    aria-label="Excluir"
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: 6,
                      color: "var(--danger-solid-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                  </Form>
        </div>
        </td> 
                </div>
              </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {produtos.length === 0 && <p>Nenhum produto nessa categoria.</p>}

    </div>
  );
}