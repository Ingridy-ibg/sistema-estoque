import { redirect, Form, useActionData, useNavigation } from "react-router";
import { apiFetch } from "../lib/api-client";
import { setToken } from "../lib/session";
import type { Route } from "./+types/login";

export async function clientAction({ request }: Route.ClientActionArgs){
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const senha = formData.get("senha") as string;

    try {
        const data = await apiFetch("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, senha}),
        });
        setToken(data.access_token);
        return redirect("/");

    }catch (erro){
        return {erro: erro instanceof Error ? erro.message : "Erro ao fazer login" };

    }
}

export default function Login(){
    const actionData = useActionData<typeof clientAction>();
    const navigation = useNavigation();
    const enviando = navigation.state === "submitting";

    return (
        <div style = {{ maxWidth: 360, margin: "80px auto", padding: "0 16px" }}>
            <div className="cartao" style={{ padding: 24 }}>
            <h1 style={{ margin: "0 0 20px", fontSize: 20 }}>Estoque</h1>

            <Form method="post" className="formulario">

                <div>
                    <label htmlFor= "email">E-mail</label>
                    <br />
                   <input
                   id= "email"
                   name="email"
                   type="email"
                   placeholder= "digite aqui"
                   required/>
                </div>

                <div>
                    <label htmlFor="senha">Senha</label>
                    <br />
                    <input
                    id= "senha"
                    name="senha"
                    type="password"
                    placeholder= "digite aqui"
                    required/>
                </div>

                {actionData?.erro && (
                    <p className="erro">{actionData.erro}</p>
                )}

                <button
                    type = "submit"
                    disabled={enviando}
                    className="botao-primario"
                    style={{ marginTop: 20, width: "100%", justifyContent: "center" }}
                >
                    {enviando ? "Entrando..." : "Entrar"}
                </button>
            </Form>
            </div>
            </div>
    );
}