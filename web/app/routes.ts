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
    ]),
    

] satisfies RouteConfig;
