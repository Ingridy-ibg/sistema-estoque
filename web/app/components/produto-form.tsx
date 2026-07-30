import { Form, useNavigation, Link } from "react-router";

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
    preco_custo: string;
    preco_venda: string;
  };
  erro?: string;
}

export function ProdutoForm({ categorias, produto, erro }: ProdutoFormProps) {
  const navigation = useNavigation();
  const enviando = navigation.state === "submitting";

  return (
    <Form method="post" style={{ maxWidth: 200, margin: "0 auto" }}>
  
      <div >
        <label htmlFor="nome">Nome:</label><br />
        <input 
        id="nome" 
        name="nome" 
        type="text" 
        defaultValue={produto?.nome} 
         placeholder="digite aqui"
        required />
      </div>

      <div style={{ marginTop: 12 }}>
        <label htmlFor="categoria_id">Categoria:</label><br />
        <select 
        id="categoria_id" 
        name="categoria_id" 
        defaultValue={produto?.categoria_id ?? ""}>
          <option value="">Sem categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <label htmlFor="unidade_medida">Unidade de medida:</label><br />
          <input id="unidade_medida" 
          name="unidade_medida"
          type="text" 
          defaultValue={produto?.unidade_medida} 
          placeholder="saco, kg, unidade..." required />
      </div>

      <div style={{ marginTop: 12 }}>
        <label htmlFor="quantidade_minima">Quantidade mínima:</label><br />
        <input 
          id="quantidade_minima" 
          name="quantidade_minima" 
          type="number" 
          step="1" 
          min="0" 
          placeholder="digite aqui"
          defaultValue={produto?.quantidade_minima} 
          required />
      </div>

      <div style={{ marginTop: 12 }}>
        <label htmlFor="preco_custo">Preço de Custo:</label><br />
        <input 
        id="preco_custo" 
        name="preco_custo" 
        type="number" 
        step="0.01"
        min="0.00" 
        placeholder="digite aqui"
        defaultValue={produto?.preco_custo} 
        required />
      </div>

        <div style={{ marginTop: 12 }}>
        <label htmlFor="preco_venda">Preço de Venda:</label><br />
        <input 
        id="preco_venda" 
        name="preco_venda" 
        type="number" 
        step="0.01"
        min="0.00" 
        placeholder="digite aqui"
        defaultValue={produto?.preco_venda} 
        required />
      </div>

      {erro && <p style={{ color: "red" }}>{erro}</p>}

      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
      <Link
        to="/produtos"
        style={{
          padding: "6px 12px",
          border: "1px solid var(--border)",
          borderRadius: 4,
          textDecoration: "none",
          color: "var(--text)",
        }}
      >Cancelar</Link>
      <button
        type="submit"
        disabled={enviando}
        style={{ background: "var(--accent-bg)", color: "var(--accent-text)" }}
      >
        {enviando ? "Salvando..." : "Salvar"}
      </button>
    </div>
    </Form>
  );
}