import { calcularPaginacao, PADRAO_POR_PAGINA } from './paginacao';

describe('calcularPaginacao', () => {
  describe('cálculo normal', () => {
    it('devolve a primeira página sem pular registros', () => {
      const resultado = calcularPaginacao(50, 1, 20);

      expect(resultado).toEqual({
        total: 50,
        pagina: 1,
        porPagina: 20,
        totalPaginas: 3,
        skip: 0,
        take: 20,
      });
    });

    it('pula os registros das páginas anteriores', () => {
      expect(calcularPaginacao(50, 2, 20).skip).toBe(20);
      expect(calcularPaginacao(50, 3, 20).skip).toBe(40);
    });

    it('mantém o take igual ao porPagina na última página, mesmo incompleta', () => {
      // 50 registros em páginas de 20: a página 3 tem só 10 itens,
      // mas o take continua 20 — quem limita é o banco.
      expect(calcularPaginacao(50, 3, 20).take).toBe(20);
    });

    it('não cria página sobrando quando o total é múltiplo exato', () => {
      expect(calcularPaginacao(40, 1, 20).totalPaginas).toBe(2);
    });

    it('usa o padrão de itens por página quando não informado', () => {
      const resultado = calcularPaginacao(50);

      expect(resultado.porPagina).toBe(PADRAO_POR_PAGINA);
      expect(resultado.pagina).toBe(1);
    });
  });

  describe('página fora de faixa', () => {
    // Era isso que gerava skip negativo e derrubava a query no Prisma.
    it('trata página 0 como a primeira', () => {
      const resultado = calcularPaginacao(50, 0, 20);

      expect(resultado.pagina).toBe(1);
      expect(resultado.skip).toBe(0);
    });

    it('trata página negativa como a primeira', () => {
      const resultado = calcularPaginacao(50, -5, 20);

      expect(resultado.pagina).toBe(1);
      expect(resultado.skip).toBe(0);
    });

    it('nunca devolve skip negativo', () => {
      for (const pagina of [0, -1, -10, -999]) {
        expect(calcularPaginacao(50, pagina, 20).skip).toBeGreaterThanOrEqual(0);
      }
    });

    it('limita página acima do total à última página válida', () => {
      const resultado = calcularPaginacao(50, 999, 20);

      expect(resultado.pagina).toBe(3);
      expect(resultado.totalPaginas).toBe(3);
      expect(resultado.skip).toBe(40);
    });

    it('descarta a parte fracionada da página', () => {
      expect(calcularPaginacao(50, 2.7, 20).pagina).toBe(2);
    });
  });

  describe('lista vazia', () => {
    it('devolve uma página, não zero', () => {
      // Zero páginas faria a tela exibir "página 1 de 0".
      const resultado = calcularPaginacao(0, 1, 20);

      expect(resultado.totalPaginas).toBe(1);
      expect(resultado.pagina).toBe(1);
      expect(resultado.skip).toBe(0);
    });

    it('ignora a página pedida quando não há registros', () => {
      expect(calcularPaginacao(0, 5, 20).pagina).toBe(1);
    });
  });

  describe('porPagina inválido', () => {
    it('trata zero como um item por página', () => {
      // Sem isso, a divisão por zero levaria totalPaginas a Infinity.
      const resultado = calcularPaginacao(50, 1, 0);

      expect(resultado.porPagina).toBe(1);
      expect(resultado.take).toBe(1);
      expect(resultado.totalPaginas).toBe(50);
    });

    it('trata valor negativo como um item por página', () => {
      expect(calcularPaginacao(50, 1, -10).porPagina).toBe(1);
    });

    it('descarta a parte fracionada do porPagina', () => {
      const resultado = calcularPaginacao(50, 1, 10.9);

      expect(resultado.porPagina).toBe(10);
      expect(resultado.totalPaginas).toBe(5);
    });
  });

  it('mantém skip coerente com a página devolvida', () => {
    // Invariante que o serviço assume ao montar a query.
    for (const pagina of [-3, 0, 1, 2, 5, 500]) {
      const resultado = calcularPaginacao(97, pagina, 15);

      expect(resultado.skip).toBe((resultado.pagina - 1) * resultado.porPagina);
    }
  });
});
