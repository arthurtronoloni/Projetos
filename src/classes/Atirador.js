import InimigoBase from "./InimigoBase.js";
import { CAMINHO_IAS_IMAGE } from "../util/constantes.js";

class Atirador extends InimigoBase {
  constructor(position) {
    super({
      position,
      width: 70,
      height: 70,
      hp: 4,
      caminhoImagem: CAMINHO_IAS_IMAGE,
    });

    this.velocidade = 2;
    this.estado = "PATRULHA";
    this.rangeDeteccao = 800;
    this.rangeAtaque = 500;
    this.rangePatrulha = 200;
    this.cooldownTiro = 0;
    this.cooldownMax = 60;
  }

  update(player, projeteis) {
    const distancia = Math.abs(player.position.x - this.position.x);

    if (distancia <= this.rangeAtaque) {
      this.estado = "ATAQUE";
    } else if (distancia <= this.rangeDeteccao) {
      this.estado = "PERSEGUIR";
    } else {
      this.estado = "PATRULHA";
    }

    if (this.estado === "PATRULHA") this.patrulhar();
    if (this.estado === "PERSEGUIR") this.perseguir(player);
    if (this.estado === "ATAQUE") this.atacar(player, projeteis);

    if (this.cooldownTiro > 0) this.cooldownTiro--;
  }

  patrulhar() {
    if (this.position.x <= this.posicaoInicial.x - this.rangePatrulha) {
      this.direcao = 1;
    }
    if (this.position.x >= this.posicaoInicial.x + this.rangePatrulha) {
      this.direcao = -1;
    }
    this.position.x += this.velocidade * this.direcao;
  }

  perseguir(player) {
    if (player.position.x > this.position.x) {
      this.direcao = 1;
      this.position.x += this.velocidade;
    } else {
      this.direcao = -1;
      this.position.x -= this.velocidade;
    }
  }

  atacar(player, projeteis) {
    this.direcao = player.position.x > this.position.x ? 1 : -1;

    if (this.cooldownTiro <= 0) {
      this.shoot(projeteis);
      this.cooldownTiro = this.cooldownMax;
    }
  }

  reset() {
    super.reset();
    this.estado = "PATRULHA";
    this.cooldownTiro = 0;
  }
}

export default Atirador;
