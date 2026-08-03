import { Link, useLoaderData, useSubmit, Form } from "react-router";
import { apiFetch } from "../../lib/api-client";
import type { Route } from "./+types/historico";
import { Paginacao } from "../../components/paginacao";

interface Movimentacao {
  id: number;
  tipo: string;
  quantidade: string;
  motivo: string | null;
  criado_em: string;
  produtos: { nome: string; unidade_medida: string };
  usuarios: { nome: string };
}

interface Produto {
  id: number;
  nome: string;
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const produtoId = url.searchParams.get("produto_id") ?? "";
  const periodo = url.searchParams.get("periodo") ?? "hoje";
  const tipo = url.searchParams.get("tipo") ?? "";
  const params = new URLSearchParams();

  if (produtoId) params.set("produto_id", produtoId);
  if (periodo) params.set("periodo", periodo);
  params.set("pagina", url.searchParams.get("pagina") ?? "1");
  if (tipo) params.set("tipo", tipo);


  const [resposta, produtos] = await Promise.all([
    apiFetch(`/movimentacoes?${params.toString()}`),
    apiFetch("/produtos/selecao"),
  ]);

  const dados = resposta as {
    movimentacoes: Movimentacao[];
    total: number;
    pagina: number;
    totalPaginas: number;
  };

  return {
    movimentacoes: dados.movimentacoes,
    total: dados.total,
    pagina: dados.pagina,
    totalPaginas: dados.totalPaginas,
    produtos: produtos as Produto[],
    produtoId,
    periodo,
    tipo,
  };
}

export default function Historico() {
  const { movimentacoes, total, pagina, totalPaginas, produtos, produtoId, periodo, tipo } =
    useLoaderData<typeof clientLoader>();
  const submit = useSubmit();

  return (
    <div>
      <div className="cabecalho-pagina">
        <h1>Histórico de movimentações</h1>
        <Link to="/movimentacoes/nova" className="botao-primario">
          + Nova movimentação
        </Link>
      </div>

      <div className="barra-filtros">
        <Form method="get" onChange={(e) => submit(e.currentTarget)}>
          <input type="hidden" name="pagina" value="1" />

          <select
            id="produto_id"
            name="produto_id"
            defaultValue={produtoId}
            aria-label="Filtrar por produto"
            style={{ width: "auto" }}
          >
            <option value="">Todos os produtos</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>

          <select name="tipo" defaultValue={tipo} aria-label="Filtrar por tipo" style={{ width: "auto" }}>
            <option value="">Entradas e saídas</option>
            <option value="entrada">Só entradas</option>
            <option value="saida">Só saídas</option>
          </select>

          <select
            id="periodo"
            name="periodo"
            defaultValue={periodo}
            aria-label="Filtrar por período"
            style={{ width: "auto" }}
          >
            <option value="hoje">Hoje</option>
            <option value="semana">Últimos 7 dias</option>
            <option value="mes">Últimos 30 dias</option>
            <option value="todos">Todos</option>
          </select>
        </Form>
      </div>

      {total > 0 && (
        <p className="resumo">
          {total} {total === 1 ? "movimentação" : "movimentações"}
        </p>
      )}

      {movimentacoes.length === 0 ? (
        <p className="vazio">
          Nenhuma movimentação {periodo === "hoje" ? "hoje" : "encontrada com esses filtros"}.
        </p>
      ) : (
        <table>
          <colgroup>
            <col style={{ width: "18%" }} />
            <col style={{ width: "27%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "12%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Data</th>
              <th>Produto</th>
              <th>Tipo</th>
              <th className="numero">Quantidade</th>
              <th>Motivo</th>
              <th>Usuário</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoes.map((m) => (
              <tr key={m.id}>
                <td>{new Date(m.criado_em).toLocaleString("pt-BR")}</td>
                <td>{m.produtos.nome}</td>
                <td style={{ color: m.tipo === "entrada" ? "var(--accent-bg)" : "var(--danger-solid-bg)" }}>
                  {m.tipo === "entrada" ? "Entrada" : "Saída"}
                </td>
                <td className="numero">
                  {m.quantidade} <span className="unidade">{m.produtos.unidade_medida}</span>
                </td>
                <td>{m.motivo ?? "—"}</td>
                <td>{m.usuarios.nome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Paginacao
        pagina={pagina}
        totalPaginas={totalPaginas}
        total={total}
        rotulo="movimentações"
      />
    </div>
  );
}