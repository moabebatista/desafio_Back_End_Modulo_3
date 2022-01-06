const conexao = require("../conexao");

function validarDados(nome, quantidade, preco, descricao) {
  if (!nome) {
    return "O nome deve ser informado.";
  }
  if (!quantidade || quantidade < 1) {
    return "A quantidade do produto deve ser no mínimo uma.";
  }
  if (!preco) {
    return "O preço deve ser informado.";
  }
  if (!descricao) {
    return "A descrição deve ser informada.";
  }
}

const listarProdutos = async (req, res) => {
  const { usuario } = req;
  const categoria = req.query.categoria;

  try {
    const { rowCount } = await conexao.query(
      "select * from usuarios where id = $1",
      [usuario.id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }
    if (categoria) {
      if (categoria.toLowerCase() === "null") {
        const produtosFiltrados = await conexao.query(
          "select * from produtos where usuario_id = $1 and categoria is null",
          [usuario.id]
        );
        return res.status(200).json(produtosFiltrados.rows);
      }
      const produtosFiltrados = await conexao.query(
        "select * from produtos where usuario_id = $1 and categoria = $2",
        [usuario.id, categoria]
      );
      return res.status(200).json(produtosFiltrados.rows);
    }

    const produtos = await conexao.query(
      "select * from produtos where usuario_id = $1",
      [usuario.id]
    );

    return res.status(200).json(produtos.rows);
  } catch (error) {
    return res.status(400).json({ mensagem: error.message });
  }
};

const detalharProdutos = async (req, res) => {
  const { id } = req.params;
  const { usuario } = req;

  try {
    const usuarioLogado = await conexao.query(
      "select * from usuarios where id = $1",
      [usuario.id]
    );
    if (usuarioLogado.rowCount === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    const { rows, rowCount } = await conexao.query(
      "select * from produtos where id = $1",
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ mensagem: "Produto não encontrado" });
    }

    if (usuarioLogado.rows[0].id !== rows[0].usuario_id) {
      return res
        .status(403)
        .json({ mensagem: "Produto pertence à outro usuário." });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(400).json({ mensagem: error.message });
  }
};

const cadastrarProdutos = async (req, res) => {
  const { nome, quantidade, preco, descricao } = req.body;
  let { categoria, imagem } = req.body;
  const { usuario } = req;

  const erro = validarDados(nome, quantidade, preco, descricao);
  if (erro) return res.status(400).json({ mensagem: erro });
  if (!categoria) {
    categoria = null;
  }
  if (!imagem) {
    imagem = null;
  }

  try {
    const usuarioLogado = await conexao.query(
      "select * from usuarios where id = $1",
      [usuario.id]
    );
    if (usuarioLogado.rowCount === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    const query =
      "insert into produtos (nome, quantidade, categoria, preco, descricao, imagem, usuario_id) values ($1, $2, $3, $4, $5, $6,$7)";
    const produto = await conexao.query(query, [
      nome,
      quantidade,
      categoria,
      preco,
      descricao,
      imagem,
      usuario.id,
    ]);

    if (produto.rowCount === 0) {
      return res
        .status(400)
        .json({ mensagem: "Não foi possivel cadastrar o produto." });
    }

    res.status(204).json();
  } catch (error) {
    return res.status(400).json({ mensagem: error.message });
  }
};

const editarProdutos = async (req, res) => {
  const { nome, quantidade, preco, descricao } = req.body;
  let { categoria, imagem } = req.body;
  const { id } = req.params;
  const { usuario } = req;

  const erro = validarDados(nome, quantidade, preco, descricao);
  if (erro) return res.status(400).json({ mensagem: erro });
  if (!categoria) {
    categoria = null;
  }
  if (!imagem) {
    imagem = null;
  }

  try {
    const usuarioLogado = await conexao.query(
      "select * from usuarios where id = $1",
      [usuario.id]
    );
    if (usuarioLogado.rowCount === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    const { rowCount, rows } = await conexao.query(
      "select * from produtos where id = $1",
      [id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ mensagem: "Produto não encontrado." });
    }
    if (usuarioLogado.rows[0].id !== rows[0].usuario_id) {
      return res
        .status(403)
        .json({ mensagem: "Produto pertence à outro usuário." });
    }

    const query =
      "update produtos set nome = $1, quantidade = $2, categoria = $3, preco = $4, descricao = $5, imagem = $6 where id = $7";
    const produto = await conexao.query(query, [
      nome,
      quantidade,
      categoria,
      preco,
      descricao,
      imagem,
      id,
    ]);
    if (produto.rowCount === 0) {
      return res
        .status(400)
        .json({ mensagem: "Não foi possivel cadastrar o produto." });
    }

    res.status(204).json();
  } catch (error) {
    return res.status(400).json({ mensagem: error.message });
  }
};

const removerProdutos = async (req, res) => {
  const { id } = req.params;
  const { usuario } = req;

  try {
    const usuarioLogado = await conexao.query(
      "select * from usuarios where id = $1",
      [usuario.id]
    );
    if (usuarioLogado.rowCount === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    let { rows, rowCount } = await conexao.query(
      "select * from produtos where id = $1",
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ mensagem: "Produto não encontrado" });
    }

    if (usuarioLogado.rows[0].id !== rows[0].usuario_id) {
      return res
        .status(403)
        .json({ mensagem: "Produto pertence à outro usuário." });
    }

    rows = await conexao.query("delete from produtos where id = $1", [id]);
    res.status(204).json();
  } catch (error) {
    return res.status(400).json({ mensagem: error.message });
  }
};

const filtrarProdutos = async (req, res) => {
  const { usuario } = req;
  const categoria = req.query.categoria;
  console.log(categoria);
  try {
    const { rowCount } = await conexao.query(
      "select * from usuarios where id = $1",
      [usuario.id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    const { rows } = await conexao.query(
      "select * from produtos where categoria = '$1'",
      [categoria]
    );
    console.log(rows);

    return res.status(200).json(rows);
  } catch (error) {
    return res.status(400).json({ mensagem: error.message });
  }
};

module.exports = {
  listarProdutos,
  detalharProdutos,
  cadastrarProdutos,
  editarProdutos,
  removerProdutos,
  filtrarProdutos
};