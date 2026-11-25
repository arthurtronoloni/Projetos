import { CAMINHO_PEIXE_IMAGE, CAMINHO_PEIXEESPADA_IMAGE } from "../util/constantes.js";

const imagemPeixe = new Image();
imagemPeixe.src = CAMINHO_PEIXE_IMAGE;

const imagemPeixeEspada = new Image();
imagemPeixeEspada.src = CAMINHO_PEIXEESPADA_IMAGE;

class Projeto {
  constructor(position, velocidade, cor = "white", tipo = "normal") {
    this.position = position;
    this.velocidade = velocidade;
    this.cor = cor;
    this.tipo = tipo;

    if (this.cor === "blue") {
      this.width = 40;
      this.height = 40;
    } else {
      this.width = 35;
      this.height = 6;
    }
  }

  draw(ctx) {
    const imgAtual = (this.tipo === "espada") ? imagemPeixeEspada : imagemPeixe;

    if (this.cor === "blue" && imgAtual.complete && imgAtual.naturalWidth > 0) {
      ctx.save();

      if (this.velocidade < 0) {
        ctx.translate(this.position.x + this.width, this.position.y);
        ctx.scale(-1, 1);
        ctx.drawImage(imgAtual, 0, 0, this.width, this.height);
      } else {
        ctx.drawImage(imgAtual, this.position.x, this.position.y, this.width, this.height);
      }

      ctx.restore();
    } else {
      ctx.fillStyle = this.cor;
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

      if (this.cor !== "white" && this.cor !== "blue") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fillRect(this.position.x, this.position.y + 2, this.width, 2);
      }
    }
  }

  update() {
    this.position.x += this.velocidade;
  }
}

export default Projeto;
