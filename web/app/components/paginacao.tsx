import { Link, useSearchParams } from "react-router";

interface PaginacaoProps {
  pagina: number;
  totalPaginas: number;
  total: number;
  /** Plural usado no resumo, ex.: "produtos", "usuários". */
  rotulo: string;
  /** Nome do parâmetro na URL — telas com duas listas usam nomes diferentes. */
  param?: string;
}

// o padding existe para dar área de toque no mobile — as setas sozinhas
// ficam bem abaixo do alvo confortável
const estiloBase = {
  fontSize: 16,
  textDecoration: "none",
  padding: "8px 16px",
};

export function Paginacao({ pagina, totalPaginas, total, rotulo, param = "pagina" }: PaginacaoProps) {
  const [searchParams] = useSearchParams();

  if (totalPaginas <= 1) return null;

  const linkPara = (destino: number) => {
    const params = new URLSearchParams(searchParams);
    params.set(param, String(destino));
    return { search: `?${params.toString()}` };
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 20 }}>
      {pagina <= 1 ? (
        <span style={{ ...estiloBase, color: "var(--text-muted)" }}>←</span>
      ) : (
        <Link to={linkPara(pagina - 1)} style={{ ...estiloBase, color: "var(--link)" }}>
          ←
        </Link>
      )}

      <span style={{ fontSize: 14, color: "var(--text-muted)" }}>
         {pagina} / {totalPaginas}
      </span>

      {pagina >= totalPaginas ? (
        <span style={{ ...estiloBase, color: "var(--text-muted)" }}>→</span>
      ) : (
        <Link to={linkPara(pagina + 1)} style={{ ...estiloBase, color: "var(--link)" }}>
          →
        </Link>
      )}
    </div>
  );
}
