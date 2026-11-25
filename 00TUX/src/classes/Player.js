import { IMAGENS_TUX_PARADO, IMAGENS_TUX_ANDANDO } from "../util/constantes.js";
import Projeto from "./Projeto.js";

class Player {
  constructor(canvasWidth, canvasHeight, yChao) {
    this.width = 100;
    this.height = 100;

    this.chao = yChao;
    this.position = {
      x: canvasWidth * 0.3,
      y: this.chao - this.height,
    };
    this.posicaoInicial = { ...this.position };

    this.offsetY = 15;

    this.velocidadeX = 5;
    this.velocidadeY = 0;
    this.gravidade = 0.6;
    this.forcaPulo = 14;
    this.noChao = true;

    this.direcao = 1;
    this.hp = 5;
    this.hpMax = 5;

    this.invulneravelTimer = 0;
    this.temBuffInvulnerabilidade = false;
    this.danoProjetil = 1;
    this.temBuffDash = false;
    this.dashTimer = 0;

    this.framesParado = IMAGENS_TUX_PARADO.map(caminho => this.getImage(caminho));
    this.framesAndando = IMAGENS_TUX_ANDANDO.map(caminho => this.getImage(caminho));

    this.animacaoAtual = this.framesParado;
    this.frameAtual = 0;
    this.tempoAnimacao = 0;
    this.estaAndando = false;

    this.velocidadeAnimacaoAndando = 5;
    this.velocidadeAnimacaoParado = 15;
  }

  getImage(caminho) {
    const imagem = new Image();
    imagem.src = caminho;
    return imagem;
  }

  moveLeft() {
    if (this.dashTimer > 0) return;
    this.position.x -= this.velocidadeX;
    this.direcao = -1;
    this.estaAndando = true;
  }

  moveRight() {
    if (this.dashTimer > 0) return;
    this.position.x += this.velocidadeX;
    this.direcao = 1;
    this.estaAndando = true;
  }

  pular() {
    if (this.noChao) {
      this.velocidadeY = -this.forcaPulo;
      this.noChao = false;
    } else if (this.temBuffDash && this.dashTimer === 0) {
      this.dashTimer = 12;
      this.velocidadeY = 0;
    }
  }

  shoot(playerprojeteis) {
    const xDirecao = this.direcao === 1
      ? this.position.x + this.width - 30
      : this.position.x + 10;

    const tipoPeixe = (this.danoProjetil === 2) ? "espada" : "normal";

    const p = new Projeto(
      { x: xDirecao, y: this.position.y + 45 },
      10 * this.direcao,
      "blue",
      tipoPeixe
    );
    playerprojeteis.push(p);
  }

  update() {
    if (this.invulneravelTimer > 0) this.invulneravelTimer--;


    if (this.dashTimer > 0) {
      this.dashTimer--;
      this.position.x += 18 * this.direcao;
      this.velocidadeY = 0;
      this.estaAndando = true;

      if (this.dashTimer === 0) {
        this.velocidadeY = 1;
      }
    } else {
      this.velocidadeY += this.gravidade;
      this.position.y += this.velocidadeY;
    }

    if (this.position.y + this.height >= this.chao) {
      this.position.y = this.chao - this.height;
      this.velocidadeY = 0;
      this.noChao = true;
    }

    if (this.estaAndando && this.noChao) {
      if (this.animacaoAtual !== this.framesAndando) {
        this.frameAtual = 0; this.tempoAnimacao = 0;
      }
      this.animacaoAtual = this.framesAndando;
      this.tempoAnimacao++;
      if (this.tempoAnimacao >= this.velocidadeAnimacaoAndando) {
        this.tempoAnimacao = 0;
        this.frameAtual = (this.frameAtual + 1) % this.framesAndando.length;
      }
    } else if (!this.noChao && this.dashTimer > 0) {
    } else {
      if (this.animacaoAtual !== this.framesParado) {
        this.frameAtual = 0; this.tempoAnimacao = 0;
      }
      this.animacaoAtual = this.framesParado;
      this.tempoAnimacao++;
      if (this.tempoAnimacao >= this.velocidadeAnimacaoParado) {
        this.tempoAnimacao = 0;
        this.frameAtual = (this.frameAtual + 1) % this.framesParado.length;
      }
    }

    this.estaAndando = false;
  }

  draw(ctx) {
    const frameSeguro = this.frameAtual % this.animacaoAtual.length;
    const imagemAtual = this.animacaoAtual[frameSeguro];

    if (!imagemAtual || !imagemAtual.complete || imagemAtual.naturalWidth === 0) return;

    ctx.save();
    if (this.invulneravelTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.3;
    }
    ctx.translate(this.position.x + this.width / 2, this.position.y + this.offsetY);
    ctx.scale(this.direcao, 1);
    ctx.drawImage(imagemAtual, -this.width / 2, 0, this.width, this.height);
    ctx.restore();
  }

  reset() {
    this.hp = this.hpMax;
    this.direcao = 1;
    this.velocidadeY = 0;
    this.noChao = true;
    this.position.x = this.posicaoInicial.x;
    this.position.y = this.posicaoInicial.y;

    this.animacaoAtual = this.framesParado;
    this.frameAtual = 0;
    this.tempoAnimacao = 0;
    this.estaAndando = false;

    this.invulneravelTimer = 0;
    this.temBuffInvulnerabilidade = false;
    this.danoProjetil = 1;
    this.temBuffDash = false;
    this.dashTimer = 0;
  }
}

export default Player;
