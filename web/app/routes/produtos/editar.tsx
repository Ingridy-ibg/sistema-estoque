import { redirect, useLoaderData, useActionData} from "react-router";
import { apiFetch } from "../../lib/api-client";
import { ProdutoForm } from "../../components/produto-form";
import type { Route } from "./+types/editar";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const [produto, categorias] = await Promise.all([
    apiFetch(`/produtos/${params.id}`),
    apiFetch("/categorias"),
  ]);
  return { produto, categorias };
}

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  const formData = await request.formData();
  
  if (formData.get("intent") === "excluir"){
    try{ 
      await apiFetch(`/produtos/${params.id}`, { method: "DELETE"});
      return redirect("/produtos");
    }catch(erro){
      return { erro: erro instanceof Error ? erro.message : "Erro ao excluir produto"};
    }
  }
  
  const categoriaId = formData.get("categoria_id") as string;

  try {
    await apiFetch(`/produtos/${params.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        nome: formData.get("nome"),
        categoria_id: categoriaId ? Number(categoriaId) : null,
        unidade_medida: formData.get("unidade_medida"),
        quantidade_minima: Number(formData.get("quantidade_minima")),
        preco_custo: Number(formData.get("preco_custo")),
        preco_venda: Number(formData.get("preco_venda")),
      }),
    });
    return redirect("/produtos");
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : "Erro ao editar produto" };
  }
}

export default function EditarProduto() {
  const { produto, categorias } = useLoaderData<typeof clientLoader>();
  const actionData = useActionData<typeof clientAction>();

  return (
    <div>
      <ProdutoForm categorias={categorias} produto={produto} erro={actionData?.erro} />
    </div>
  );
}