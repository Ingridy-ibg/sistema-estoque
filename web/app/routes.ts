import { type RouteConfig, index, route, layout} from "@react-router/dev/routes";

export default [
    route("login", "routes/login.tsx"),
    layout("routes/protected-layout.tsx", [
    index("routes/dashboard.tsx"),
    route("produtos", "routes/produtos/lista.tsx"),
     route("produtos/novo", "routes/produtos/novo.tsx"),
    route("produtos/:id/editar", "routes/produtos/editar.tsx"),
    route("movimentacoes/nova", "routes/movimentacoes/nova.tsx"),
    route("categorias", "routes/categorias/lista.tsx"),
    route("usuarios", "routes/usuarios/lista.tsx"),
    route("movimentacoes", "routes/movimentacoes/historico.tsx"),
    route("produtos/excluidos", "routes/produtos/excluidos.tsx"),
    route("usuarios/excluidos", "routes/usuarios/excluidos.tsx"),   
    route("minha-senha", "routes/minha-senha.tsx"),
    route("usuarios/:id/senha", "routes/usuarios/alterar-senha.tsx"),
    ]),
    

] satisfies RouteConfig;
