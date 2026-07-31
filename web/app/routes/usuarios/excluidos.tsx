import { Link, useLoaderData, useActionData, Form } from "react-router";
import { apiFetch } from "../../lib/api-client";
import type { Route } from "./+types/excluidos";

interface Usuario {
    id: number;
    nome: string;
    email: string;
}

export async function clientLoader() {
  const usuarios: Usuario[] = await apiFetch("/usuarios/inativos");
  return { usuarios };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();

  try {
    await apiFetch(`/usuarios/${formData.get("id")}/reativar`, { method: "PATCH" });
    return { ok: true };
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : "Erro ao reativar" };
  }
}

export default function UsuariosExcluidos() {
  const { usuarios } = useLoaderData<typeof clientLoader>();
  const actionData = useActionData<typeof clientAction>();

  return (
    
    <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Usuários excluídos</h1>

        <Link
            to="/usuarios"
            style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--text-muted)",
            textDecoration: "none",
            }}
        >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            voltar
        </Link>
        </div>

      {actionData?.erro && <p className="erro">{actionData.erro}</p>}

      {usuarios.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>Nenhum usuário excluído.</p>
      ) : (
        <table style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
            <tr key={u.id}>
                <td>{u.nome}</td>
                <td>{u.email}</td>
                <td>
                <Form method="post">
                    <input type="hidden" name="id" value={u.id} />
                    <button type="submit">reativar</button>
                </Form>
                </td>
            </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}