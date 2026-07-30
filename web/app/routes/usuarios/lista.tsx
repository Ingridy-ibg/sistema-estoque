import { useLoaderData, useActionData, useNavigation, Form } from "react-router";
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
            <label htmlFor="nome">Nome</label><br />
            <input 
                id="nome" 
                name="nome" 
                type="text" 
                placeholder="nome" 
            required />
            </div>

            <div style={{ marginTop: 12 }}>
            <label htmlFor="email">E-mail</label><br />
            <input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="email@exemplo.com" 
                required />
            </div>

            <div style={{ marginTop: 12 }}>
            <label htmlFor="senha">Senha</label><br />
            <input 
                id="senha" 
                name="senha" 
                type="password" 
                placeholder="mínimo 6 caracteres" 
                minLength={8} 
                required />
            </div>

            {actionData?.erro && <p className="erro">{actionData.erro}</p>}
            
            <button type="submit" disabled={enviando} style={{ marginTop: 16 }}>
            {enviando ? "Criando..." : "Criar usuário"}
            </button>
        </Form>

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
                {u.id === usuarioLogadoId ? (
                <span style={{ color: "var(--text-muted)" }}>você</span>
            ) : (
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
                        style={{ background: "var(--danger-solid-bg)", color: "var(--danger-solid-text)" }}
                    >
                        excluir
                    </button>
                </Form>
            )}
        </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
    }