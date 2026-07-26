import { Link, useLoaderData, useSubmit, Form } from "react-router";
import { apiFetch } from "../../lib/api-client";
import type { Route } from "./+types/lista";

interface Produto {
  id: number;
  nome: string;
  unidade_medida: string;
  quantidade_atual: string;
  quantidade_minima: string;
  preco_unitario: string;
  categorias: { nome: string } | null;
}

interface Categoria {
  id: number;
  nome: string;
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
        <h1>Produtos</h1>
        <Link to="/produtos/novo">+ Novo produto</Link>
      </div>

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


      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
            <th>Nome</th>
            <th>Categoria</th>
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
                <td>{produto.categorias?.nome ?? "—"}</td>
                <td>{produto.quantidade_atual} {produto.unidade_medida}</td>
                <td>{produto.quantidade_minima}</td>
                <td>R$ {produto.preco_unitario}</td>
                <td><Link to={`/produtos/${produto.id}/editar`}>editar</Link></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {produtos.length === 0 && <p>Nenhum produto nessa categoria.</p>}

    </div>
  );
}