const conexao = require("../conexao");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const senhaSecreta = require("../senhaSecreta");

function validarEmailSenha(email, senha) {
    if (!email) {
      return "O email deve ser informado.";
    }
    if (!senha) {
      return "A senha deve ser informada.";
    }
  }
  
  function validarNomeLoja(nome, nome_loja) {
    if (!nome) {
      return "O nome deve ser informado.";
    }
    if (!nome_loja) {
      return "O nome da loja deve ser informada.";
    }
  }
  
  async function checarEmail(email) {
    try {
      const query = "select * from usuarios where email = $1";
      const qtdUsuario = await conexao.query(query, [email]);
      if (qtdUsuario.rowCount > 0) {
        return "Já existe um usuário cadastrado com o email informado.";
      }
    } catch (error) {
      return ({mensagem: error.message});
    }
  }
  
  const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha, nome_loja } = req.body;
  
    let erro = validarEmailSenha(email, senha);
    if (erro) return res.status(400).json({ mensagem: erro });
    erro = validarNomeLoja(nome, nome_loja);
    if (erro) return res.status(400).json({ mensagem: erro });
    erro = await checarEmail(email);
    if (erro) return res.status(401).json({ mensagem: erro });
  
    try {
      const senhaCriptografada = await bcrypt.hash(senha, 10);
      const query =
        "insert into usuarios (nome, email, senha, nome_loja) values ($1, $2, $3, $4)";
      const { rowCount } = await conexao.query(query, [
        nome,
        email,
        senhaCriptografada,
        nome_loja,
      ]);
  
      if (rowCount === 0) {
        return res
          .status(400)
          .json({ mensagem: "Não foi possivel cadastrar o usuário." });
      }
  
      res.status(204).json();
    } catch (error) {
      return res.status(400).json({ mensagem: error.message });
    }
  };
  
  const loginUsuario = async (req, res) => {
    const { email, senha } = req.body;
  
    let erro = validarEmailSenha(email, senha);
    if (erro) {
      return res.status(400).json({ mensagem: erro });
    }
  
    try {
      const query = "select * from usuarios where email = $1";
      const { rows, rowCount } = await conexao.query(query, [email]);
  
      if (rowCount === 0) {
        return res.status(404).json({ mensagem: "Email e/ou senha incorretos." });
      }
  
      const usuario = rows[0];
  
      const senhaVerificada = await bcrypt.compare(senha, usuario.senha);
      if (!senhaVerificada) {
        return res.status(404).json({ mensagem: "Email e/ou senha incorretos." });
      }
      const token = jwt.sign({ id: usuario.id }, senhaSecreta, { expiresIn: "8h" });
  
      res.status(201).json({ token });
    } catch (error) {
      return res.status(400).json({ mensagem: error.message });
    }
  };
  
  const detalharUsuario = async (req, res) => {
    const { usuario } = req;
  
    try {
      const usuarioDetalhado = await conexao.query(
        "select * from usuarios where id = $1",
        [usuario.id]
      );
      if (usuarioDetalhado.rowCount === 0) {
        return res.status(404).json({ mensagem: "Usuário não encontrado." });
      }
      const { senha, ...usuarioDados } = usuarioDetalhado.rows[0];
  
      res.status(200).json(usuarioDados);
    } catch (error) {
      return res.status(400).json({ mensagem: error.message });
    }
  };
  
  const editarUsuario = async (req, res) => {
    const { usuario } = req;
    const { nome, email, senha, nome_loja } = req.body;
  
    let erro = validarEmailSenha(email, senha);
    if (erro) return res.status(400).json({ mensagem: erro });
    erro = validarNomeLoja(nome, nome_loja);
    if (erro) return res.status(400).json({ mensagem: erro });
    erro = await checarEmail(email);
    if (erro) return res.status(401).json({ mensagem: erro });
  
    try {
      let usuarioEditado = await conexao.query(
        "select * from usuarios where id = $1",
        [usuario.id]
      );
      if (usuarioEditado.rowCount === 0) {
        return res.status(404).json({ mensagem: "Usuário não encontrado" });
      }
  
      const senhaCriptografada = await bcrypt.hash(senha, 10);
      const query =
        "update usuarios set nome = $1, email = $2, senha = $3, nome_loja = $4 where id = $5";
      usuarioEditado = await conexao.query(query, [
        nome,
        email,
        senhaCriptografada,
        nome_loja,
        usuario.id,
      ]);
  
      if (usuarioEditado.rowCount === 0) {
        return res.status(400).json({mensagem: "Não foi possível atualizar o usuário."});
      }
  
      res.status(204).json();
    } catch (error) {
      return res.status(400).json({ mensagem: error.message });
    }
  };
  
  const excluirUsuario = async (req, res) => {
    const { usuario } = req;
  
    try {
      let usuarioDeletado = await conexao.query(
        "select * from usuarios where id = $1",
        [usuario.id]
      );
      if (usuarioDeletado.rowCount === 0) {
        return res.status(404).json({ mensagem: "Usuário não encontrado." });
      }
  
      usuarioDeletado = await conexao.query(
        "delete from usuarios where id = $1",
        [usuario.id]
      );
      if (usuarioDeletado.rowCount === 0) {
        return res.status(400).json({mensagem: "Não foi possível atualizar o usuário."});
      }
  
      res
        .status(200)
        .json({ mensagem: `Usuário ${usuario.nome} deletado com sucesso.` });
    } catch (error) {
      return res.status(400).json({ mensagem: error.message });
    }
  };
  
  module.exports = {
    loginUsuario,
    cadastrarUsuario,
    detalharUsuario,
    editarUsuario,
    excluirUsuario
  };