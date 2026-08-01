import { useLoaderData, useActionData, useNavigation, Form, Link } from "react-router";
import { apiFetch } from "../../lib/api-client";
import type { Route } from "./+types/lista";
import { getUsuarioId } from "../../lib/session";
import { Paginacao } from "../../components/paginacao";

interface Usuario {
    id: number;
    nome: string;
    email: string;
}

export async function clientLoader({ request }: Route.ClientLoaderArgs){
    const pagina = new URL(request.url).searchParams.get("pagina") ?? "1";

    const dados = (await apiFetch(`/usuarios?pagina=${pagina}`)) as {
        usuarios: Usuario[];
        total: number;
        pagina: number;
        totalPaginas: number;
    };

    return dados;
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
    const { usuarios, total, pagina, totalPaginas } = useLoaderData<typeof clientLoader>();
    const actionData = useActionData<typeof clientAction>();
    const navigation = useNavigation();
    const enviando = navigation.state === "submitting";
    const usuarioLogadoId = getUsuarioId();

    return (
        <div>

        <div className="cabecalho-pagina">
            <h1>Usuários</h1>
        </div>

        <div className="cartao">
        <Form method="post" key={total} className="formulario">
            <div>
            <label htmlFor="nome">Nome:</label><br />
            <input
                id="nome"
                name="nome"
                type="text"
                placeholder="nome"
            required />
            </div>

            <div>
            <label htmlFor="email">E-mail:</label><br />
            <input
                id="email"
                name="email"
                type="email"
                placeholder="email@exemplo.com"
                required />
            </div>

            <div>
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

            <div className="acoes-formulario">
            <button type="submit" disabled={enviando} className="botao-primario">
            {enviando ? "Criando..." : "Criar usuário"}
            </button>
            </div>
        </Form>
        </div>

            <div className="cabecalho-secao">
                <h2>Usuários ativos</h2>
                <Link to="/usuarios/excluidos" className="link-acao" title="Ver usuários excluídos">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                    <path d="M3 3v5h5" />
                    </svg>
                    Excluídos
                </Link>
                </div>

        {usuarios.length === 0 ? (
        <p className="vazio">Nenhum usuário ativo.</p>
        ) : (
        <table>
            <colgroup>
                <col style={{ width: "40%" }} />
                <col style={{ width: "45%" }} />
                <col style={{ width: "15%" }} />
            </colgroup>

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
               <td className="acoes">
                 <div>
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
        )}

        <Paginacao pagina={pagina} totalPaginas={totalPaginas} total={total} rotulo="usuários" />
        </div>
    );
    }