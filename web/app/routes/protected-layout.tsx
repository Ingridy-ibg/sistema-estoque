import { Outlet, redirect, Link } from "react-router";
import { getToken, clearToken } from "../lib/session";

export async function clientToken() {
    const token = getToken();
    if (!token){
        throw redirect("/login");
    }
    return null;
}

export default function ProtectedLayout (){
    return (
        <div>
            < nav
            style={{
                display: "flex",
                gap: 16,
                padding: "12px 24px",
                borderBottom: "1px solid #ddd",
                alignItems: "center",
            }}
            >
                <Link to="/">Painel</Link>
                <Link to="/categorias">Categorias</Link>
                <Link to="/produtos">Produtos</Link>
                <Link to="/movimentacoes/nova">Nova Movimentação</Link>
                <button 
                onClick={() => {
                    clearToken();
                    window.location.href = "/login";
                }}
                style={{ marginLeft: "auto"}}
                >
                    Sair
                </button>
            </nav>
            <main style={{ padding:24, fontFamily: "sans-serif"}}>
                <Outlet />
            </main>
        </div>
    );
}