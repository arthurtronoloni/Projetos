import { CAMINHO_BOSS_IMAGE } from "../util/constantes.js";

class Boss {
  constructor(position) {
    this.position = { ...position };
    this.width = 300;
    this.height = 200;
    this.hp = 40;
    this.hpMax = 40;
    this.vivo = true;
    this.estado = "DESLIGADO";
    this.image = new Image();
    this.image.src = CAMINHO_BOSS_IMAGE;

    this.timer = 0;
    this.velocidade = 6;
    this.velocidadeDash = 18;
    this.targetX = 0;
    this.targetY = 0;
    this.moveTargetX = null;
  }

  update(player, yChao) {
    if (this.estado === "DIALOGO" || this.estado === "DESLIGADO") return;

    if (this.estado === "SUBINDO") {
      this.position.y -= 3;
      if (this.position.y <= 100) {
        this.position.y = 100;
        this.estado = "FLUTUANDO";
        this.timer = 120;
        this.moveTargetX = null;
      }
      return;
    }

    if (this.estado === "MORTO") {
      if (this.position.y < yChao - this.height) {
        this.position.y += 10;
        if (this.position.y > yChao - this.height) {
          this.position.y = yChao - this.height;
        }
      }
      return;
    }

    if (this.estado === "FLUTUANDO") {
      this.timer--;
      this.position.y = 80 + Math.sin(Date.now() / 400) * 30;

      if (this.moveTargetX === null) {
        this.moveTargetX = 100 + Math.random() * (1280 - this.width - 200);
      }
      const dx = this.moveTargetX - this.position.x;
      if (Math.abs(dx) > 5) {
        this.position.x += Math.sign(dx) * 3;
      } else {
        this.moveTargetX = 100 + Math.random() * (1280 - this.width - 200);
      }

      if (this.timer <= 0) {
        this.moveTargetX = null;
        if (Math.random() < 0.5) {
          this.estado = "ATACANDO_CIMA";
          this.targetX = player.position.x + player.width / 2 - this.width / 2;
          this.targetY = yChao - this.height;
        } else {
          this.estado = "ATACANDO_LADO";
          this.targetX = player.position.x - 250;
          this.targetY = yChao - this.height;
        }
      }
    }
    else if (this.estado === "ATACANDO_CIMA") {
      const dx = this.targetX - this.position.x;
      const dy = this.targetY - this.position.y;
      const dist = Math.hypot(dx, dy);

      if (dist > this.velocidade * 2) {
        this.position.x += (dx / dist) * this.velocidade * 2;
        this.position.y += (dy / dist) * this.velocidade * 2;
      } else {
        this.position.x = this.targetX;
        this.position.y = this.targetY;
        this.estado = "NO_CHAO";
        this.timer = 120;
      }
    }
    else if (this.estado === "ATACANDO_LADO") {
      const dx = this.targetX - this.position.x;
      const dy = this.targetY - this.position.y;
      const dist = Math.hypot(dx, dy);

      if (dist > this.velocidade * 2) {
        this.position.x += (dx / dist) * this.velocidade * 2;
        this.position.y += (dy / dist) * this.velocidade * 2;
      } else {
        this.estado = "DASH";
      }
    }
    else if (this.estado === "DASH") {
      this.position.x += this.velocidadeDash;
      if (this.position.x > player.position.x + 400 || this.position.x > 1280) {
        this.estado = "NO_CHAO";
        this.timer = 120;
      }
    }
    else if (this.estado === "NO_CHAO") {
      this.timer--;
      if (this.timer <= 0) {
        this.estado = "FLUTUANDO";
        this.timer = 120;
      }
    }

    if (player.invulneravelTimer <= 0) {
      const colidiu = (
        player.position.x < this.position.x + this.width &&
        player.position.x + player.width > this.position.x &&
        player.position.y < this.position.y + this.height &&
        player.position.y + player.height > this.position.y
      );

      if (colidiu) {
        player.hp -= 1;
        if (player.temBuffInvulnerabilidade) player.invulneravelTimer = 180;
      }
    }
  }

  receberDano(dano) {
    if (this.estado !== "NO_CHAO") return;

    this.hp -= dano;
    if (this.hp <= 0) {
      this.hp = 0;
      this.vivo = false;
      this.estado = "MORTO";
    }
  }

  draw(ctx) {
    if (this.image.complete && this.image.naturalWidth > 0) {
      ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    } else {
      ctx.fillStyle = this.estado === "DESLIGADO" ? "#111" : "#0078D7";
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    if (this.estado !== "DESLIGADO" && this.estado !== "DIALOGO" && this.estado !== "MORTO" && this.estado !== "SUBINDO") {
      const pct = this.hp / this.hpMax;
      ctx.fillStyle = "#000";
      ctx.fillRect(this.position.x, this.position.y - 30, this.width, 20);
      ctx.fillStyle = pct > 0.5 ? "#2ecc71" : pct > 0.25 ? "#f39c12" : "#e74c3c";
      ctx.fillRect(this.position.x, this.position.y - 30, this.width * pct, 20);
      ctx.strokeStyle = "#FFF";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.position.x, this.position.y - 30, this.width, 20);
    }
  }
}

export default Boss;
