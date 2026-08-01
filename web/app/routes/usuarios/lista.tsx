import { useLoaderData, useActionData, useNavigation, Form, Link } from "react-router";
import { apiFetch } from "../../lib/api-client";
import type { Route } from "./+types/lista";
import { getUsuarioId } from "../../lib/session";

interface Usuario {
    id: number;
    nome: string;
    email: string;
}

export async function clientLoader(){
    const usuarios: Usuario[] = await apiFetch("/usuarios");
    return { usuarios };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
    const formData = await request.formData();

    try {

         if (formData.get("intent") === "excluir") {
            await apiFetch(`/usuarios/${formData.get("id")}`, { method: "DELETE" });
            return { ok: true };
        } 

        await apiFetch("/usuarios", {
            method: "POST",
            body: JSON.stringify({
                nome: formData.get("nome"),
                email: formData.get("email"),
                senha: formData.get("senha"),
            }),
        });

        if (formData.get("intent") === "redefinir_senha") {
            await apiFetch(`/usuarios/${formData.get("id")}/senha`, {
                method: "PATCH",
                body: JSON.stringify({ senha_nova: formData.get("senha_nova") }),
            });
            return { ok: true, mensagem: "Senha redefinida" };
            }

        return { ok: true};

    }catch (erro){
        return { erro: erro instanceof Error ? erro.message : "Erro"};
    }
}

    export default function ListaUsuarios() {
    const { usuarios } = useLoaderData<typeof clientLoader>();
    const actionData = useActionData<typeof clientAction>();
    const navigation = useNavigation();
    const enviando = navigation.state === "submitting";
    const usuarioLogadoId = getUsuarioId();

    return (
        <div>

        <Form method="post" key={usuarios.length} style={{ marginTop: 16 }}>
            <div>
            <label htmlFor="nome">Nome:</label><br />
            <input 
                id="nome" 
                name="nome" 
                type="text" 
                placeholder="nome" 
            required />
            </div>
        
            <div style={{ marginTop: 12 }}>
            <label htmlFor="email">E-mail:</label><br />
            <input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="email@exemplo.com" 
                required />
            </div>

            <div style={{ marginTop: 12 }}>
            <label htmlFor="senha">Senha:</label><br />
            <input 
                id="senha" 
                name="senha" 
                type="password" 
                placeholder="mínimo 6 caracteres" 
                minLength={6} 
                required />
            </div>

            {actionData?.erro && <p className="erro">{actionData.erro}</p>}
            
            <button type="submit" disabled={enviando} style={{ marginTop: 16 }}>
            {enviando ? "Criando..." : "Criar usuário"}
            </button>
        </Form>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
                <h2 style={{ margin: 0, fontSize: 16 }}>Usuários ativos</h2>
                <Link to="/usuarios/excluidos" className="link-acao">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                    <path d="M3 3v5h5" />
                    </svg>
                </Link>
                </div>


        <table style={{ marginTop: 24 }}>
            <thead>
            <tr>
                <th>Nome</th>
                <th>E-mail</th>
            </tr>

            </thead>
            <tbody>
            {usuarios.map((u) => (
                <tr key={u.id}>
                <td>{u.nome}</td>
                <td>{u.email}</td>
               <td>
                 <div style={{ display: "flex", gap: 4, alignItems: "center", justifyContent: "flex-end" }}>
    {u.id === usuarioLogadoId ? (
      <Link
        to="/minha-senha"
        title="Alterar minha senha"
        aria-label="Alterar minha senha"
        style={{ color: "var(--text-muted)", display: "inline-flex", alignItems: "center", padding: 6 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      </Link>
    ) : (
      <>
        <Link
          to={`/usuarios/${u.id}/senha`}
          title="Redefinir senha"
          aria-label="Redefinir senha"
          style={{ color: "var(--text-muted)", display: "inline-flex", alignItems: "center", padding: 6 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        </Link>

        <Form
          method="post"
          onSubmit={(e) => {
            if (!confirm(`Remover o acesso de "${u.nome}"?`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="intent" value="excluir" />
          <input type="hidden" name="id" value={u.id} />
          <button
            type="submit"
            title="Excluir"
            aria-label="Excluir"
            style={{
              background: "transparent",
              border: "none",
              padding: 6,
              color: "var(--danger-solid-bg)",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        </Form>
      </>
    )}
  </div>
        </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
    }