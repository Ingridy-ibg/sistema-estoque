import { useLoaderData, useSubmit, Form } from "react-router";
import { apiFetch } from "../../lib/api-client";
import type { Route } from "./+types/historico";

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

  const params = new URLSearchParams();
  if (produtoId) params.set("produto_id", produtoId);
  if (periodo) params.set("periodo", periodo);

  const [movimentacoes, produtos] = await Promise.all([
    apiFetch(`/movimentacoes?${params.toString()}`),
    apiFetch("/produtos"),
  ]);

  return {
    movimentacoes: movimentacoes as Movimentacao[],
    produtos: produtos as Produto[],
    produtoId,
    periodo,
  };
}

export default function Historico() {
  const { movimentacoes, produtos, produtoId, periodo } = useLoaderData<typeof clientLoader>();
  const submit = useSubmit();

  return (
    <div>
      <h2>Histórico de movimentações</h2>

      <Form
        method="get"
        onChange={(e) => submit(e.currentTarget)}
        style={{ marginTop: 16, display: "flex", gap: 16, alignItems: "flex-end" }}
      >
        <div>
          <label htmlFor="produto_id">Produto</label><br />
          <select id="produto_id" name="produto_id" defaultValue={produtoId}>
            <option value="">Todos os produtos</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="periodo">Período</label><br />
          <select id="periodo" name="periodo" defaultValue={periodo}>
            <option value="hoje">Hoje</option>
            <option value="semana">Últimos 7 dias</option>
            <option value="mes">Últimos 30 dias</option>
            <option value="todos">Todos</option>
          </select>
        </div>
      </Form>

      {movimentacoes.length === 0 ? (
        <p style={{ color: "var(--text-muted)", marginTop: 24 }}>
          Nenhuma movimentação {periodo === "hoje" ? "hoje" : "encontrada com esses filtros"}.
        </p>
      ) : (
        <table style={{ marginTop: 24 }}>
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
                <td className="numero">{m.quantidade} {m.produtos.unidade_medida}</td>
                <td>{m.motivo ?? "—"}</td>
                <td>{m.usuarios.nome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}