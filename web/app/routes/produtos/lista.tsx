import { Link, useLoaderData, useSubmit, Form } from "react-router";
import { apiFetch } from "../../lib/api-client";
import type { Route } from "./+types/lista";
import { moeda } from "../../lib/formato";
import { Paginacao } from "../../components/paginacao";

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

const botaoIcone = {
  display: "inline-flex",
  alignItems: "center",
  padding: 6,
} as const;

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
  const busca = url.searchParams.get("busca") ?? "";
  const emFalta = url.searchParams.get("em_falta") === "1";
  const pagina = url.searchParams.get("pagina") ?? "1";

  const params = new URLSearchParams();
  if (categoriaId) params.set("categoria_id", categoriaId);
  if (busca) params.set("busca", busca);
  if (emFalta) params.set("em_falta", "1");
  params.set("pagina", pagina);

  const [resposta, categorias] = await Promise.all([
   apiFetch(`/produtos?${params.toString()}`),
   apiFetch("/categorias/selecao"),
  ]);

    const dados = resposta as {
    produtos: Produto[];
    total: number;
    pagina: number;
    totalPaginas: number;
  };


  return {
    produtos: dados.produtos,
    total: dados.total,
    pagina: dados.pagina,
    totalPaginas: dados.totalPaginas,
    categorias: categorias as Categoria[],
    categoriaId,
    busca,
    emFalta,
  };

} 

export default function ListaProdutos() {
  const { produtos, total, pagina, totalPaginas, categorias, categoriaId, busca, emFalta } =
  useLoaderData<typeof clientLoader>();
  const submit = useSubmit();

  // digitar troca a URL a cada tecla: `replace` evita encher o histórico de voltas
  const aoMudarFiltro = (evento: React.FormEvent<HTMLFormElement>) => {
    const digitando = (evento.target as HTMLElement).id === "busca";
    submit(evento.currentTarget, { replace: digitando });
  };

  return (
    <div>
      <div className="cabecalho-pagina">
        <h1>Produtos</h1>
        <Link to="/produtos/novo" className="botao-primario">
          + Novo produto
        </Link>
      </div>

      <div className="barra-filtros">
        <Form method="get" onChange={aoMudarFiltro}>
          <input type="hidden" name="pagina" value="1" />

          <div className="campo-busca">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              id="busca"
              name="busca"
              type="search"
              defaultValue={busca}
              placeholder="Pesquisar produto..."
              aria-label="Pesquisar produto"
            />
          </div>

          <select
            id="categoria_id"
            name="categoria_id"
            defaultValue={categoriaId}
            aria-label="Filtrar por categoria"
          >
            <option value="">Todas as categorias</option>
            <option value="sem">Sem categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>

          <label htmlFor="em_falta" className={emFalta ? "pilula ativa" : "pilula"}>
            <input
              id="em_falta"
              name="em_falta"
              type="checkbox"
              value="1"
              defaultChecked={emFalta}
            />
            Apenas em falta
          </label>
        </Form>

        <Link
          to="/produtos/excluidos"
          title="Ver produtos excluídos"
          className="link-acao"
          style={{ marginLeft: "auto" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Excluídos
        </Link>
      </div>

      {total > 0 && (
        <p className="resumo">
          {total} {total === 1 ? "produto" : "produtos"}
          {busca && ` para "${busca}"`}
          {emFalta && " abaixo do estoque mínimo"}
        </p>
      )}

      {produtos.length === 0 ? (
        <p className="vazio">
          {busca
            ? `Nenhum produto encontrado para "${busca}".`
            : emFalta
              ? "Nenhum produto abaixo do estoque mínimo."
              : "Nenhum produto nessa categoria."}
        </p>
      ) : (
      <table>

         <colgroup>
            <col style={{ width: "26%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "13%" }} />
          </colgroup>

        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th className="numero">Estoque</th>
            <th className="numero">Mínimo</th>
            <th className="numero">Custo</th>
            <th className="numero">Venda</th>
            <th></th>
          </tr>
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
                <td className="principal">
                  <Link
                    to={`/movimentacoes/nova?produto_id=${produto.id}`}
                    className="link-discreto"
                  >
                    {produto.nome}
                  </Link>
                </td>
                <td data-rotulo="Categoria">{produto.categorias?.nome ?? "—"}</td>
                <td className="numero" data-rotulo="Estoque">
                  <span>
                    {produto.quantidade_atual} <span className="unidade">{produto.unidade_medida}</span>
                  </span>
                </td>
                <td className="numero" data-rotulo="Mínimo">{produto.quantidade_minima}</td>
                <td className="numero" data-rotulo="Custo">{moeda(produto.preco_custo)}</td>
                <td className="numero" data-rotulo="Venda">{moeda(produto.preco_venda)}</td>

                <td className="acoes">
                  <div>
                    <Link
                      to={`/movimentacoes?produto_id=${produto.id}&periodo=todos`}
                      title="Histórico"
                      aria-label="Histórico"
                      style={{ ...botaoIcone, color: "var(--text-muted)" }}
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
                      style={{ ...botaoIcone, color: "var(--edit-button-bg)" }}
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
                          ...botaoIcone,
                          color: "var(--danger-solid-bg)",
                          background: "transparent",
                          border: "none",
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
            );
          })}
        </tbody>
      </table>
      )}

      <Paginacao pagina={pagina} totalPaginas={totalPaginas} total={total} rotulo="produtos" />

    </div>
  );
}