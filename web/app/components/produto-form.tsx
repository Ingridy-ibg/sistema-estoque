import { Form, useNavigation } from "react-router";

interface Categoria {
  id: number;
  nome: string;
}

interface ProdutoFormProps {
  categorias: Categoria[];
  produto?: {
    nome: string;
    categoria_id: number | null;
    unidade_medida: string;
    quantidade_minima: string;
    preco_unitario: string;
  };
  erro?: string;
}

export function ProdutoForm({ categorias, produto, erro }: ProdutoFormProps) {
  const navigation = useNavigation();
  const enviando = navigation.state === "submitting";

  return (
    <Form method="post">
      <div>
        <label htmlFor="nome">Nome</label><br />
        <input id="nome" name="nome" type="text" defaultValue={produto?.nome} required />
      </div>
      <div style={{ marginTop: 12 }}>
        <label htmlFor="categoria_id">Categoria</label><br />
        <select id="categoria_id" name="categoria_id" defaultValue={produto?.categoria_id ?? ""}>
          <option value="">Sem categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>
      <div style={{ marginTop: 12 }}>
        <label htmlFor="unidade_medida">Unidade de medida</label><br />
        <input id="unidade_medida" name="unidade_medida" type="text" defaultValue={produto?.unidade_medida} placeholder="saco, kg, unidade..." required />
      </div>
      <div style={{ marginTop: 12 }}>
        <label htmlFor="quantidade_minima">Quantidade mínima</label><br />
        <input id="quantidade_minima" name="quantidade_minima" type="number" step="0.01" min="0" defaultValue={produto?.quantidade_minima} required />
      </div>
      <div style={{ marginTop: 12 }}>
        <label htmlFor="preco_unitario">Preço unitário</label><br />
        <input id="preco_unitario" name="preco_unitario" type="number" step="0.01" min="0" defaultValue={produto?.preco_unitario} required />
      </div>
      {erro && <p style={{ color: "red" }}>{erro}</p>}
      <button type="submit" disabled={enviando} style={{ background: "var(--accent-bg)", color: "var(--accent-text)", marginTop: 16 }}>
        {enviando ? "Salvando..." : "Salvar"}
      </button>
    </Form>
  );
}