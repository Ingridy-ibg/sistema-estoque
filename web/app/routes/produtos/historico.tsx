import { Link, useLoaderData } from "react-router";
import { apiFetch } from "../../lib/api-client";
import type { Route } from "./+types/historico";

interface Movimentacao {
  id: number;
  tipo: string;
  quantidade: string;
  motivo: string | null;
  criado_em: string;
  usuarios: { nome: string };
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const dados = await apiFetch(`/produtos/${params.id}/historico`);
  return dados as { produto: string; movimentacoes: Movimentacao[] };
}

export default function HistoricoProduto() {
  const { produto, movimentacoes } = useLoaderData<typeof clientLoader>();

  return (
    <div>
      <Link to="/produtos">← voltar para produtos</Link>
      <h1 style={{ marginTop: 8 }}>Histórico: {produto}</h1>

      {movimentacoes.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>Nenhuma movimentação para este produto.</p>
      ) : (
        <table style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th className="numero">Quantidade</th>
              <th>Motivo</th>
              <th>Registrado por</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoes.map((m) => (
              <tr key={m.id}>
                <td>{new Date(m.criado_em).toLocaleString("pt-BR")}</td>
                <td style={{ color: m.tipo === "entrada" ? "var(--accent-bg)" : "var(--danger-solid-bg)" }}>
                  {m.tipo === "entrada" ? "Entrada" : "Saída"}
                </td>
                <td className="numero">{m.quantidade}</td>
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