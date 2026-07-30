import { Link, useLoaderData } from "react-router";
import { apiFetch } from "../lib/api-client";

interface ProdutoEmFalta {
  id: number;
  nome: string;
  quantidade_atual: string;
  quantidade_minima: string;
}

interface Movimentacao {
  id: number;
  tipo: string;
  quantidade: string;
  motivo: string | null;
  criado_em: string;
  produtos: { nome: string; unidade_medida: string };
}

export async function clientLoader() {
  const [emFalta, valorTotal, movimentacoes] = await Promise.all([
    apiFetch("/produtos/em-falta"),
    apiFetch("/produtos/valor-total"),
    apiFetch("/movimentacoes?limite=5"),
  ]);

  return {
    emFalta: emFalta as ProdutoEmFalta[],
    valorTotal: valorTotal as { valor_total: string | null },
    movimentacoes: movimentacoes as Movimentacao[],
  };
}

export default function Dashboard() {
  const { emFalta, valorTotal, movimentacoes } = useLoaderData<typeof clientLoader>();

  const cartao = {
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: 16,
    flex: 1,
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" as const }}>
        <div style={cartao}>
          <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Valor total em estoque:</div>
          <div style={{ fontSize: 28, marginTop: 4 }}>
            R$ {valorTotal.valor_total ?? "0,00"}
          </div>
        </div>

        <div
          style={{
            ...cartao,
            background: emFalta.length > 0 ? "var(--danger-bg)" : "var(--positive-card)",
            color: emFalta.length > 0 ? "var(--danger-text)" : "inherit",
          }}
        >
          <div style={{ fontSize: 14, opacity: 0.8 }}>Produtos em falta:</div>
          <div style={{ fontSize: 28, marginTop: 4 }}>{emFalta.length}</div>
        </div>
      </div>

      <h2 style={{ marginTop: 32 }}>Produtos que precisam de reposição:</h2>
      {emFalta.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>Nenhum produto abaixo do mínimo.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Atual</th>
              <th>Mínimo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {emFalta.map((p) => (
              <tr key={p.id}>
                <td>{p.nome}</td>
                <td>{p.quantidade_atual}</td>
                <td>{p.quantidade_minima}</td>
                <td><Link to={`/movimentacoes/nova?produto_id=${p.id}`}><button>registrar entrada</button></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ marginTop: 32 }}>Últimas movimentações:</h2>
      {movimentacoes.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>Nenhuma movimentação registrada ainda.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Produto</th>
              <th>Tipo</th>
              <th>Quantidade</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoes.map((m) => (
              <tr key={m.id}>
                <td>{new Date(m.criado_em).toLocaleString("pt-BR")}</td>
                <td>{m.produtos.nome}</td>
                <td>{m.tipo === "entrada" ? "Entrada" : "Saída"}</td>
                <td>{m.quantidade} {m.produtos.unidade_medida}</td>
                <td>{m.motivo ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}