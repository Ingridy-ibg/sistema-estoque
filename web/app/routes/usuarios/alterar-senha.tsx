import { useActionData, useLoaderData, useNavigation, Form, Link } from "react-router";
import { apiFetch } from "../../lib/api-client";
import { useNavigate } from "react-router";
import type { Route } from "./+types/alterar-senha";

interface Usuario {
  id: number;
  nome: string;
  email: string;
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    const usuarios: Usuario[] = await apiFetch("/usuarios/selecao");
    const usuario = usuarios.find((u) => String(u.id) === params.id);
    
    if(!usuario){
        throw new Error("Usuário não encontrado");
    }

    return { usuario };
}

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const senhaNova = formData.get("senha_nova") as string;
  const confirmacao = formData.get("confirmacao") as string;

  if (senhaNova !== confirmacao) {
    return { erro: "Senha e confirmacao de senha devem ser iguais" };
  }

  try {
    await apiFetch(`/usuarios/${params.id}/senha`, {
      method: "PATCH",
      body: JSON.stringify({
        senha_nova: senhaNova,
      }),
    });
    return { ok: true };
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : "Erro ao alterar senha" };
  }
}

export default function SenhaUsuarios() {
  const { usuario } = useLoaderData<typeof clientLoader>();
  const actionData = useActionData<typeof clientAction>();
  const navigation = useNavigation();
  const enviando = navigation.state === "submitting";
  const navigate = useNavigate();

  return (
       <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <div className="cartao" style={{ padding: 24 }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>Redefinir senha</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6, marginBottom: 0 }}>
          {usuario.nome} — {usuario.email}
        </p>

        <Form method="post" key={actionData?.ok ? "limpo" : "form"} style={{ marginTop: 24 }}>
          <div>
            <label htmlFor="senha_nova" style={{ fontSize: 14 }}>Nova senha</label><br />
            <input id="senha_nova" name="senha_nova" type="password" minLength={6} placeholder="mínimo 6 caracteres" required style={{ marginTop: 4 }} />
          </div>

          <div style={{ marginTop: 16 }}>
            <label htmlFor="confirmacao" style={{ fontSize: 14 }}>Confirmar nova senha</label><br />
            <input id="confirmacao" name="confirmacao" type="password" minLength={6} placeholder="repita a senha" required style={{ marginTop: 4 }} />
          </div>

          {actionData?.erro && <p className="erro" style={{ fontSize: 14 }}>{actionData.erro}</p>}
          {actionData?.ok && (
            <p style={{ color: "var(--accent-bg)", fontSize: 14 }}>Senha alterada com sucesso.</p>
          )}

          <div className="acoes-formulario">
            <button
              type="button"
              onClick={() => navigate("/usuarios")}
              className="botao-secundario"
            >
              Cancelar
            </button>

            <button type="submit" disabled={enviando} className="botao-primario">
              {enviando ? "Alterando..." : "Alterar senha"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}