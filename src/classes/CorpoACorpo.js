import InimigoBase from "./InimigoBase.js";
import { colidiu } from "../util/colisao.js";
import { CAMINHO_CORPOACORPO_IMAGE } from "../util/constantes.js";

class CorpoACorpo extends InimigoBase {
  constructor(position) {
    super({
      position,
      width: 70,
      height: 70,
      hp: 2,
      caminhoImagem: CAMINHO_CORPOACORPO_IMAGE,
    });

    this.baseY = position.y;
    this.velocidadeDash = 5;
    this.cooldownDash = 0;
    this.estado = "ESPERANDO";
  }

  update(player) {
    this.position.y = this.baseY + Math.sin(Date.now() / 200) * 10;

    if (this.cooldownDash > 0) {
      this.cooldownDash--;
      return;
    }

    const distancia = player.position.x - this.position.x;
    this.direcao = distancia > 0 ? 1 : -1;

    this.position.x += this.velocidadeDash * this.direcao;

    if (colidiu(this, player)) {
      if (player.invulneravelTimer <= 0) {
        player.hp -= 1;

        if (player.temBuffInvulnerabilidade) {
          player.invulneravelTimer = 180;
        }
      }

      this.position.x = player.position.x + (this.direcao * (player.width + 20));
      this.cooldownDash = 60;
    }
  }

  reset() {
    super.reset();
    this.cooldownDash = 0;
    this.baseY = this.posicaoInicial.y;
  }
}

export default CorpoACorpo;
