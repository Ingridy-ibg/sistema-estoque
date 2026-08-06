import { useEffect, useRef, useState } from "react";
import { Outlet, redirect, NavLink } from "react-router";
import { getToken, clearToken, getPapel } from "../lib/session";

export async function clientLoader() {
    const token = getToken();
    if (!token){
        throw redirect("/login");
    }
    return null;
}

// NavLink aceita função no className: marca o item da rota atual
const classeLink = ({ isActive }: { isActive: boolean }) =>
  isActive ? "link-nav ativo" : "link-nav";

export default function ProtectedLayout (){

  const [menuAberto, setMenuAberto] = useState(false);
  const fecharMenu = () => setMenuAberto(false);

  const botaoMenuRef = useRef<HTMLButtonElement>(null);
  const botaoFecharRef = useRef<HTMLButtonElement>(null);
  const jaAbriu = useRef(false);

  const ehAdmin = getPapel() === "admin";

  // trava a rolagem do fundo enquanto a gaveta está aberta. A regra só vale
  // no mobile (ver CSS), então redimensionar para desktop não deixa a página
  // presa sem rolagem.
  useEffect(() => {
    document.body.classList.toggle("sem-rolagem", menuAberto);
    return () => document.body.classList.remove("sem-rolagem");
  }, [menuAberto]);

  useEffect(() => {
    if (!menuAberto) return;
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") fecharMenu();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [menuAberto]);

  // leva o foco para dentro da gaveta ao abrir e devolve para o hambúrguer ao
  // fechar; `jaAbriu` evita roubar o foco na primeira renderização
  useEffect(() => {
    if (menuAberto) {
      jaAbriu.current = true;
      botaoFecharRef.current?.focus();
    } else if (jaAbriu.current) {
      botaoMenuRef.current?.focus();
    }
  }, [menuAberto]);

    return (
        <div>

        <header className="cabecalho-app">
        <div className="cabecalho-app-topo">
          <span className="marca">Estoque</span>

          {/* só aparece no mobile; no desktop o menu fica sempre visível */}
          <button
            type="button"
            ref={botaoMenuRef}
            className="botao-menu"
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
            aria-controls="menu-lateral"
            onClick={() => setMenuAberto(true)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>

        {/* escurece o conteúdo atrás da gaveta; o Esc e o botão de fechar
            cobrem quem não usa toque */}
        <div
          className={menuAberto ? "overlay-menu visivel" : "overlay-menu"}
          onClick={fecharMenu}
          aria-hidden="true"
        />

        <div id="menu-lateral" className={menuAberto ? "menu aberto" : "menu"}>
            <div className="menu-topo">
              <span className="marca">Menu</span>
              <button
                type="button"
                ref={botaoFecharRef}
                className="botao-fechar-menu"
                aria-label="Fechar menu"
                onClick={fecharMenu}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav className="menu-principal">
              <NavLink to="/" end className={classeLink} onClick={fecharMenu}>Início</NavLink>
              <NavLink to="/categorias" className={classeLink} onClick={fecharMenu}>Categorias</NavLink>
              <NavLink to="/produtos" className={classeLink} onClick={fecharMenu}>Produtos</NavLink>
              <NavLink to="/movimentacoes" end className={classeLink} onClick={fecharMenu}>Histórico</NavLink>
              <NavLink to="/movimentacoes/nova" className={classeLink} onClick={fecharMenu}>Nova movimentação</NavLink>
            </nav>

            <div className="menu-conta">
              {ehAdmin && <NavLink to="/usuarios" className={classeLink} onClick={fecharMenu}>Usuários</NavLink>}

              <NavLink to="/minha-senha" className={classeLink} onClick={fecharMenu}>Minha senha</NavLink>

              <button
                className="botao-sair"
                onClick={() => {
                  clearToken();
                  window.location.href = "/login";
                }}
              >
                Sair
              </button>
            </div>
        </div>

      </header>

            <main className="conteudo">
                <Outlet />
            </main>
        </div>
    );
}
