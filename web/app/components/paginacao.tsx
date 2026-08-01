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

const estiloBase = {
  fontSize: 14,
  textDecoration: "none",
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
        <span style={{ ...estiloBase, color: "var(--text-muted)" }}>← anterior</span>
      ) : (
        <Link to={linkPara(pagina - 1)} style={{ ...estiloBase, color: "var(--link)" }}>
          ← anterior
        </Link>
      )}

      <span style={{ fontSize: 14, color: "var(--text-muted)" }}>
        página {pagina} de {totalPaginas} ({total} {rotulo})
      </span>

      {pagina >= totalPaginas ? (
        <span style={{ ...estiloBase, color: "var(--text-muted)" }}>próxima →</span>
      ) : (
        <Link to={linkPara(pagina + 1)} style={{ ...estiloBase, color: "var(--link)" }}>
          próxima →
        </Link>
      )}
    </div>
  );
}
