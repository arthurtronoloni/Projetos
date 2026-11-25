import { CAMINHO_BOMBA_IMAGE } from "../util/constantes.js";

class Bomba {
  constructor({ x, y }, yChao) {
    this.position = { x, y };
    this.width = 20;
    this.height = 24;
    this.yChao = yChao;

    this.velocidadeY = 0;
    this.gravidade = 0.5;
    this.noChao = false;

    this.timer = 90;
    this.explodiu = false;
    this.raioExplosao = 120;
    this.tempoExplosao = 20;

    this.image = new Image();
    this.image.src = CAMINHO_BOMBA_IMAGE;
  }

  update() {
    if (!this.noChao) {
      this.velocidadeY += this.gravidade;
      this.position.y += this.velocidadeY;

      if (this.position.y + this.height >= this.yChao) {
        this.position.y = this.yChao - this.height;
        this.noChao = true;
      }
    } else if (!this.explodiu) {
      this.timer--;
      if (this.timer <= 0) {
        this.explodiu = true;
      }
    } else {
      this.tempoExplosao--;
    }
  }

  draw(ctx) {
    if (this.explodiu) {
      ctx.fillStyle = `rgba(231, 76, 60, ${this.tempoExplosao / 20})`;
      ctx.beginPath();
      ctx.arc(this.position.x + (this.width / 2), this.position.y + (this.height / 2), this.raioExplosao, 0, Math.PI * 2);
      ctx.fill();
    } else {
      if (this.image.complete && this.image.naturalWidth > 0) {
        if (this.timer < 30 && Math.floor(this.timer / 5) % 2 === 0) {
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
            ctx.restore();
        } else {
            ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
      } else {
        ctx.fillStyle = this.timer < 30 ? "#e74c3c" : "#333";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
      }
    }
  }
}

export default Bomba;
