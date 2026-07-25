import { Link, useLoaderData } from "react-router";
import { apiFetch } from "../../lib/api-client";

interface Produto {
  id: number;
  nome: string;
  unidade_medida: string;
  quantidade_atual: string;
  quantidade_minima: string;
  preco_unitario: string;
}

export async function clientLoader() {
  const produtos: Produto[] = await apiFetch("/produtos");
  return { produtos };
}

export default function ListaProdutos() {
  const { produtos } = useLoaderData<typeof clientLoader>();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Produtos</h1>
        <Link to="/produtos/novo">+ Novo produto</Link>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
            <th>Nome</th>
            <th>Qtd. atual</th>
            <th>Qtd. mínima</th>
            <th>Preço unitário</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => {
            const emFalta = Number(produto.quantidade_atual) <= Number(produto.quantidade_minima);
            return (
              <tr
                key={produto.id}
                style={{
                  background: emFalta ? "#fdecea" : "transparent",
                  borderBottom: "1px solid #eee",
                }}
              >
                <td>{produto.nome}</td>
                <td>{produto.quantidade_atual} {produto.unidade_medida}</td>
                <td>{produto.quantidade_minima}</td>
                <td>R$ {produto.preco_unitario}</td>
                <td><Link to={`/produtos/${produto.id}/editar`}>editar</Link></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}