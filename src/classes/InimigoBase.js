import Projeto from "./Projeto.js";

class InimigoBase {
  constructor({ position, width = 50, height = 50, hp = 3, caminhoImagem }) {
    this.width = width;
    this.height = height;
    this.position = { ...position };
    this.posicaoInicial = { ...this.position };

    this.hp = hp;
    this.hpMax = hp;
    this.vivo = true;
    this.direcao = 1;

    this.image = this.getImage(caminhoImagem);
  }

  getImage(caminho) {
    const imagem = new Image();
    imagem.src = caminho;
    return imagem;
  }


  update(player, projeteis) {}

  shoot(projeteis, velocidadeProjetil = 7, cor = "red") {
     const xSpawn = this.direcao === 1
       ? this.position.x + this.width - 10
       : this.position.x + 10;

     const p = new Projeto(
       { x: xSpawn, y: this.position.y + 30 },
       velocidadeProjetil * this.direcao,
       cor
     );
     projeteis.push(p);
   }

  draw(ctx) {
    if (!this.image.complete || this.image.naturalWidth === 0) return;

    ctx.save();
    ctx.translate(this.position.x + this.width / 2, this.position.y);
    ctx.scale(-this.direcao, 1);
    ctx.drawImage(this.image, -this.width / 2, 0, this.width, this.height);
    ctx.restore();
  }

  reset() {
    this.hp = this.hpMax;
    this.vivo = true;
    this.direcao = 1;
    this.position.x = this.posicaoInicial.x;
    this.position.y = this.posicaoInicial.y;
  }
}

export default InimigoBase;
