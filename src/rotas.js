const express = require("express");
const usuarios = require("./controladores/usuarios");
const produtos = require("./controladores/produtos");
const validandoLogin = require("./controladores/middlewares/login");

const rotas = express();


rotas.post("/usuario", usuarios.cadastrarUsuario);

rotas.post("/login", usuarios.loginUsuario);

rotas.use(validandoLogin);

rotas.get("/usuario", usuarios.detalharUsuario);
rotas.put("/usuario", usuarios.editarUsuario);
rotas.delete("/usuario", usuarios.excluirUsuario);

rotas.get("/produtos", produtos.listarProdutos);
rotas.get("/produtos/:id", produtos.detalharProdutos);
rotas.post("/produtos", produtos.cadastrarProdutos);
rotas.put("/produtos/:id", produtos.editarProdutos);
rotas.delete("/produtos/:id", produtos.removerProdutos);

module.exports = rotas;