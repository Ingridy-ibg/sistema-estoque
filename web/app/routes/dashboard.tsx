import { Link, useLoaderData } from "react-router";
import { apiFetch } from "../lib/api-client";
import type { Route } from "./+types/dashboard";
import { Paginacao } from "../components/paginacao";

type Pagina<Chave extends string, Item> = {
  [K in Chave]: Item[];
} & {
  total: number;
  pagina: number;
  totalPaginas: number;
};

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
  usuarios: { nome: string };
}

const POR_PAGINA = 5;

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const paginaFalta = new URL(request.url).searchParams.get("pagina_falta") ?? "1";

  const [emFalta, valorTotal, movimentacoes] = await Promise.all([
    apiFetch(`/produtos/em-falta?pagina=${paginaFalta}&por_pagina=${POR_PAGINA}`),
    apiFetch("/produtos/valor-total"),
    apiFetch(`/movimentacoes?limite=${POR_PAGINA}`),
  ]);

  return {
    emFalta: emFalta as Pagina<"produtos", ProdutoEmFalta>,
    valorTotal: valorTotal as { valor_total: string | null },
    // sem paginação aqui: só as últimas movimentações
    ultimasMovimentacoes: (movimentacoes as Pagina<"movimentacoes", Movimentacao>).movimentacoes,
  };
}

export default function Dashboard() {
  const { emFalta, valorTotal, ultimasMovimentacoes } = useLoaderData<typeof clientLoader>();

  return (
    <div>


      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" as const }}>
        <div className="cartao" style={{ flex: 1 }}>
          <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Valor total em estoque:</div>
          <div style={{ fontSize: 28, marginTop: 4 }}>
            R$ {valorTotal.valor_total ?? "0,00"}
          </div>
        </div>

        <div
          className="cartao"
          style={{
            flex: 1,
            background: emFalta.total > 0 ? "var(--danger-bg)" : "var(--positive-card)",
            color: emFalta.total > 0 ? "var(--danger-text)" : "inherit",
          }}
        >
          <div style={{ fontSize: 14, opacity: 0.8 }}>Produtos em falta:</div>
          <div style={{ fontSize: 28, marginTop: 4 }}>{emFalta.total}</div>
        </div>
      </div>

      <div className="cabecalho-secao">
        <h2>Produtos que precisam de reposição</h2>
      </div>
      {emFalta.total === 0 ? (
        <p className="vazio">Nenhum produto abaixo do mínimo.</p>
      ) : (
        <table>
       
          <colgroup>
            <col style={{ width: "40%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "30%" }} />
          </colgroup>

          <thead>
            <tr>
              <th>Produto</th>
              <th className="numero">Atual</th>
              <th className="numero">Mínimo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {emFalta.produtos.map((p) => (
              <tr key={p.id}>
                <td>{p.nome}</td>
                <td className="numero">{p.quantidade_atual}</td>
                <td className="numero">{p.quantidade_minima}</td>
                <td className="acoes">
                  <div>
                    <Link
                      to={`/movimentacoes/nova?produto_id=${p.id}`}
                      className="botao-secundario"
                      style={{
                        color: "var(--accent-bg)",
                        borderColor: "var(--accent-bg)",
                        background: "transparent",
                        fontSize: 13,
                        padding: "6px 12px",
                      }}
                    >
                      registrar entrada
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Paginacao
        pagina={emFalta.pagina}
        totalPaginas={emFalta.totalPaginas}
        total={emFalta.total}
        rotulo="produtos"
        param="pagina_falta"
      />

      <div className="cabecalho-secao">
        <h2>Últimas movimentações</h2>
        <Link to="/movimentacoes" className="link-acao">ver histórico</Link>
      </div>
      {ultimasMovimentacoes.length === 0 ? (
        <p className="vazio">Nenhuma movimentação registrada ainda.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Produto</th>
              <th>Tipo</th>
              <th className="numero">Quantidade</th>
              <th>Usuário</th>
            </tr>
          </thead>
          <tbody>
            {ultimasMovimentacoes.map((m) => (
              <tr key={m.id}>
                <td>{new Date(m.criado_em).toLocaleString("pt-BR")}</td>
                <td>{m.produtos.nome}</td>
                <td>{m.tipo === "entrada" ? "Entrada" : "Saída"}</td>
                <td className="numero">
                  {m.quantidade} <span className="unidade">{m.produtos.unidade_medida}</span>
                </td>
                <td>{m.usuarios.nome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}