import { Outlet, redirect, NavLink } from "react-router";
import { getToken, clearToken } from "../lib/session";

export async function clientLoader() {
    const token = getToken();
    if (!token){
        throw redirect("/login");
    }
    return null;
}

export default function ProtectedLayout (){

    const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    padding: "8px 14px",
    borderRadius: 6,
    textDecoration: "none",
    background: isActive ? "var(--layout-button-bg)" : "transparent",
    color: "var(--text)",
    fontWeight: isActive ? 550 : 400,
  });
  
    return (
        <div>

            <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "14px 24px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 18 }}>Estoque</span>


            < nav
            style={{
                display: "flex",
                gap: 4,
            }}
            >
          <NavLink to="/" end style={linkStyle}>Início</NavLink>
           <NavLink to="/categorias" style={linkStyle}>Categorias</NavLink>
          <NavLink to="/produtos" style={linkStyle}>Produtos</NavLink>
          <NavLink to="/movimentacoes/nova" style={linkStyle}>Nova movimentação</NavLink>
        </nav>

        <button
          onClick={() => {
            clearToken();
            window.location.href = "/login";
          }}
          style={{ marginLeft: "auto" }}
        >
          Sair
        </button>

      </header>
      
            <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
                <Outlet />
            </main>
        </div>
    );
}