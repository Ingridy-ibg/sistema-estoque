import { redirect, useLoaderData, useActionData, useNavigation, Form } from "react-router";
import { apiFetch } from "../../lib/api-client";
import type { Route } from "./+types/nova";

interface Produto {
  id: number;
  nome: string;
  unidade_medida: string;
  quantidade_atual: string;
}

export async function clientLoader() {
  const produtos: Produto[] = await apiFetch("/produtos");
  return { produtos };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();

  try {
    await apiFetch("/movimentacoes", {
      method: "POST",
      body: JSON.stringify({
        produto_id: Number(formData.get("produto_id")),
        tipo: formData.get("tipo"),
        quantidade: Number(formData.get("quantidade")),
        motivo: formData.get("motivo") || undefined,
      }),
    });
    return redirect("/produtos");
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : "Erro ao registrar movimentação" };
  }
}

export default function NovaMovimentacao() {
  const { produtos } = useLoaderData<typeof clientLoader>();
  const actionData = useActionData<typeof clientAction>();
  const navigation = useNavigation();
  const enviando = navigation.state === "submitting";

  return (
    <div>
      <h1>Nova movimentação</h1>
      <Form method="post">
        <div>
          <label htmlFor="produto_id">Produto</label><br />
          <select id="produto_id" name="produto_id" required>
            <option value="">Selecione um produto</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} (atual: {p.quantidade_atual} {p.unidade_medida})
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginTop: 12 }}>
          <label htmlFor="tipo">Tipo</label><br />
          <select id="tipo" name="tipo" required>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
        </div>
        <div style={{ marginTop: 12 }}>
          <label htmlFor="quantidade">Quantidade</label><br />
          <input id="quantidade" name="quantidade" type="number" step="0.01" min="0.01" required />
        </div>
        <div style={{ marginTop: 12 }}>
          <label htmlFor="motivo">Motivo (opcional)</label><br />
          <input id="motivo" name="motivo" type="text" />
        </div>
        {actionData?.erro && <p style={{ color: "red" }}>{actionData.erro}</p>}
        <button type="submit" disabled={enviando} style={{ marginTop: 16 }}>
          {enviando ? "Registrando..." : "Registrar"}
        </button>
      </Form>
    </div>
  );
}