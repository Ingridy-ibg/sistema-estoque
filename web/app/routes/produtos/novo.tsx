import { redirect, useLoaderData, useActionData } from "react-router";
import { apiFetch } from "../../lib/api-client";
import { ProdutoForm } from "../../components/produto-form";
import type { Route } from "./+types/novo";
import { findBotPattern } from "isbot";

export async function clientLoader() {
  const categorias = await apiFetch("/categorias");
  return { categorias };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const categoriaId = formData.get("categoria_id") as string;

  try {
    await apiFetch("/produtos", {
      method: "POST",
      body: JSON.stringify({
        nome: formData.get("nome"),
        categoria_id: categoriaId ? Number(categoriaId) : undefined,
        unidade_medida: formData.get("unidade_medida"),
        quantidade_minima: Number(formData.get("quantidade_minima")),
        preco_custo: Number(formData.get("preco_custo")),
        preco_venda: Number(formData.get("preco_venda")),
      }),
    });

    return redirect("/produtos");
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : "Erro ao criar produto" };
  }
}

export default function NovoProduto() {
  const { categorias } = useLoaderData<typeof clientLoader>();
  const actionData = useActionData<typeof clientAction>();
  return (
    <div>
      <ProdutoForm categorias={categorias} erro={actionData?.erro} />
    </div>
  );
}