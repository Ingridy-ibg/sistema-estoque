export const PADRAO_POR_PAGINA = 20;

/**
 * Normaliza a página pedida contra o total real de registros e devolve
 * os valores prontos para o `skip`/`take` do Prisma.
 *
 * Página inválida (0, negativa, fracionada ou maior que o total) cai na
 * página válida mais próxima, para não gerar `skip` negativo nem lista vazia.
 */
export function calcularPaginacao(total: number, pagina = 1, porPagina = PADRAO_POR_PAGINA) {
  const itensPorPagina = Math.max(1, Math.trunc(porPagina));
  const totalPaginas = Math.max(1, Math.ceil(total / itensPorPagina));
  const paginaAtual = Math.min(Math.max(1, Math.trunc(pagina)), totalPaginas);

  return {
    total,
    pagina: paginaAtual,
    porPagina: itensPorPagina,
    totalPaginas,
    skip: (paginaAtual - 1) * itensPorPagina,
    take: itensPorPagina,
  };
}
