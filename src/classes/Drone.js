import InimigoBase from "./InimigoBase.js";
import Bomba from "./Bomba.js";
import { CAMINHO_DRONE_IMAGE} from "../util/constantes.js";

class Drone extends InimigoBase {
  constructor(position) {
    super({
      position,
      width: 70,
      height: 70,
      hp: 9999,
      caminhoImagem: CAMINHO_DRONE_IMAGE,
    });

    this.estado = "ENTRANDO";
    this.velocidade = 3;
  }

  update(player, projeteis, bombas) {
    if (this.estado === "ENTRANDO") {
      this.position.y += 2;
      if (this.position.y >= 100) this.estado = "PERSEGUINDO";

    } else if (this.estado === "PERSEGUINDO") {

      if (this.position.x < player.position.x) {
        this.position.x += this.velocidade;
        this.direcao = 1;
      } else if (this.position.x > player.position.x) {
        this.position.x -= this.velocidade;
        this.direcao = -1;
      }

      if (Math.abs(this.position.x - player.position.x) < 50) {
        bombas.push(new Bomba({ x: this.position.x, y: this.position.y + this.height }, player.chao));
        this.estado = "SAINDO";
      }

    } else if (this.estado === "SAINDO") {
      this.position.y -= 5;
      if (this.position.y < -100) {
        this.vivo = false;
      }
    }
  }
  reset() {
      super.reset();
      this.estado = "ENTRANDO";
    }
  }




export default Drone;
