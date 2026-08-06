import { Link, useLoaderData, useActionData, useNavigation, Form } from "react-router";
import { apiFetch } from "../../lib/api-client";
import type { Route } from "./+types/lista";
import { Paginacao } from "../../components/paginacao";

interface Categoria {
  id: number;
  nome: string;
  descricao: string | null;
  _count: { produtos: number };
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const pagina = new URL(request.url).searchParams.get("pagina") ?? "1";

  const dados = (await apiFetch(`/categorias?pagina=${pagina}`)) as {
    categorias: Categoria[];
    total: number;
    pagina: number;
    totalPaginas: number;
  };

  return dados;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "excluir") {
      await apiFetch(`/categorias/${formData.get("id")}`, { method: "DELETE" });
      return { ok: true };
    }

    await apiFetch("/categorias", {
      method: "POST",
      body: JSON.stringify({
        nome: formData.get("nome"),
        descricao: formData.get("descricao") || undefined,
      }),
    });
    return { ok: true };
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : "Erro na operação" };
  }
}

export default function ListaCategorias() {
  const { categorias, total, pagina, totalPaginas } = useLoaderData<typeof clientLoader>();
  const actionData = useActionData<typeof clientAction>();
  const navigation = useNavigation();
  const enviando = navigation.state === "submitting";

  return (
    <div>
      <div className="cabecalho-pagina">
        <h1>Categorias</h1>
      </div>

      <div className="cartao">
        <Form method="post" className="form-categoria" style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 180px" }}>
            <label htmlFor="nome" style={{ fontSize: 13, color: "var(--text-muted)" }}>Nome</label><br />
            <input
            id="nome"
            name="nome"
            type="text"
            placeholder= "digite aqui"
            required />
          </div>

          <div style={{ flex: "2 1 240px" }}>
            <label htmlFor="descricao" style={{ fontSize: 13, color: "var(--text-muted)" }}>Descrição (opcional)</label><br />
            <input
            id="descricao"
            name="descricao"
            type="text"
            placeholder= "digite aqui" />
          </div>

          <button type="submit" disabled={enviando} className="botao-primario">
            {enviando ? "Salvando..." : "Adicionar"}
          </button>
        </Form>
      </div>

      {actionData?.erro && <p className="erro">{actionData.erro}</p>}

      {total > 0 && (
        <p className="resumo" style={{ marginTop: 20 }}>
          {total} {total === 1 ? "categoria" : "categorias"}
        </p>
      )}

      {categorias.length === 0 ? (
        <p className="vazio">Nenhuma categoria cadastrada ainda.</p>
      ) : (
      <table>
        <colgroup>
          <col style={{ width: "30%" }} />
          <col style={{ width: "44%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "13%" }} />
        </colgroup>

        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th className="numero">Produtos</th>
            <th></th>
          </tr>
        </thead>
        
        <tbody>
          {categorias.map((categoria) => (
            <tr key={categoria.id}>
              <td className="principal"><Link to={`/produtos?categoria_id=${categoria.id}`} className="link-discreto">{categoria.nome}</Link></td>
              <td data-rotulo="Descrição">{categoria.descricao ?? "—"}</td>
              <td className="numero" data-rotulo="Produtos">{categoria._count.produtos}</td>
              <td className="acoes">
                <div>
                <Form method="post"
                   onSubmit={(e) => {
                    if (!confirm(`Excluir a categoria "${categoria.nome}"?`)) {
                    e.preventDefault();
                  }
                }}
                >
                  <input type="hidden" name="intent" value="excluir" />
                  <input type="hidden" name="id" value={categoria.id} />
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
            </tr>
          ))}
        </tbody>
      </table>
      )}

      <Paginacao pagina={pagina} totalPaginas={totalPaginas} total={total} rotulo="categorias" />
    </div>
  );
}