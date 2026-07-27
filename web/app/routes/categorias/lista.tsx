import { Link, useLoaderData, useActionData, useNavigation, Form } from "react-router";
import { apiFetch } from "../../lib/api-client";
import type { Route } from "./+types/lista";

interface Categoria {
  id: number;
  nome: string;
  descricao: string | null;
  _count: { produtos: number };
}

export async function clientLoader() {
  const categorias: Categoria[] = await apiFetch("/categorias");
  return { categorias };
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
  const { categorias } = useLoaderData<typeof clientLoader>();
  const actionData = useActionData<typeof clientAction>();
  const navigation = useNavigation();
  const enviando = navigation.state === "submitting";

  return (
    <div>
      <Form method="post" style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "flex-end" }}>
        <div>
          <label htmlFor="nome">Nome</label><br />
          <input id="nome" name="nome" type="text" required />
        </div>
        <div>
          <label htmlFor="descricao">Descrição (opcional)</label><br />
          <input id="descricao" name="descricao" type="text" />
        </div>
        <button type="submit" disabled={enviando}>
          {enviando ? "Salvando..." : "Adicionar"}
        </button>
      </Form>

      {actionData?.erro && <p className="erro">{actionData.erro}</p>}

      <table style={{ marginTop: 24 }}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Produtos</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) => (
            <tr key={categoria.id}>
              <td><Link to={`/produtos?categoria_id=${categoria.id}`} >{categoria.nome}</Link></td>
              <td>{categoria.descricao ?? "—"}</td>
              <td>{categoria._count.produtos}</td>
              <td>
                <Form method="post"
                   onSubmit={(e) => {
                    if (!confirm(`Excluir a categoria "${categoria.nome}"?`)) {
                    e.preventDefault();
                  }
                }}
                >
                  <input type="hidden" name="intent" value="excluir" />
                  <input type="hidden" name="id" value={categoria.id} />
                  <button type="submit" style={{background: "var(--danger-solid-bg)", color: "var(--danger-solid-text)"}} disabled={enviando}>excluir</button>
                </Form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}