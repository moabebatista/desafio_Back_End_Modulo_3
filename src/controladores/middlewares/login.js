const jwt = require("jsonwebtoken");
const senhaSecreta = require("../../senhaSecreta");
const conexao = require("../../conexao");

const validandoLogin = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(404).json({ mensagem: "Token não encontrado." });
  }

  try {
    const token = authorization.replace("Bearer", "").trim();
    const { id } = jwt.verify(token, senhaSecreta);

    const query = "select * from usuarios where id = $1";
    const { rows, rowCount } = await conexao.query(query, [id]);

    if (rowCount === 0) {
      return res
        .status(404)
        .json({ mensagem: "O usuário não foi encontrado." });
    }

    const { senha, ...usuario } = rows[0];
    req.usuario = usuario;
    next();
  } catch (error) {
    res.status(401).json({ mensagem: error.message });
  }
};

module.exports = validandoLogin;