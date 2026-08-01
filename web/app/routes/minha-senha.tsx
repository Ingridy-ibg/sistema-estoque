import { useActionData, useNavigation, useNavigate, Form } from "react-router";
import { apiFetch } from "../lib/api-client";
import type { Route } from "./+types/minha-senha";

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const senhaNova = formData.get("senha_nova") as string;
  const confirmacao = formData.get("confirmacao") as string;

  if (senhaNova !== confirmacao) {
    return { erro: "A nova senha e a confirmação não coincidem" };
  }

  try {
    await apiFetch("/usuarios/minha-senha", {
      method: "PATCH",
      body: JSON.stringify({
        senha_nova: senhaNova
      }),
    });
    return { ok: true };
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : "Erro ao alterar senha" };
  }
}

export default function MinhaSenha() {
  const actionData = useActionData<typeof clientAction>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const enviando = navigation.state === "submitting";

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <div className="cartao" style={{ padding: 24 }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>Alterar minha senha</h1>

        <Form method="post" key={actionData?.ok ? "limpo" : "form"} style={{ marginTop: 24 }}>

          <div >
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
              onClick={() => navigate("/")}
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