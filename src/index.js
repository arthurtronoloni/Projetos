import Player from "./classes/Player.js";
import Atirador from "./classes/Atirador.js";
import CorpoACorpo from "./classes/CorpoACorpo.js";
import Drone from "./classes/Drone.js";
import Boss from "./classes/Boss.js";
import { checarColisoes } from "./util/colisao.js";
import { drawCoracoes, drawHealthBar } from "./util/hud.js";
import { drawVitoria, drawGameOver } from "./util/estadoJogo.js";
import {
  CAMINHO_FUNDO_IMAGE,
  CAMINHO_SETA_IMAGE,
  CAMINHO_QUIZ_UI,
  CAMINHO_MEGAN_IMAGE,
  CAMINHO_TUX_QUIZ,
  CAMINHO_BOSS_FUNDO_IMAGE,
  CAMINHO_PRINCESA_IMAGE
} from "./util/constantes.js";
import { PERGUNTAS } from "./util/quizData.js";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1280;
canvas.height = 720;
ctx.imageSmoothingEnabled = false;

let mapaWidth = 6280;
let cameraX = 0;

const bossDoorX = 5600;
const bossSalaX = 5000;

const yChao = canvas.height - 60;

const fundoImage = new Image(); fundoImage.src = CAMINHO_FUNDO_IMAGE;
const setaImage = new Image(); setaImage.src = CAMINHO_SETA_IMAGE;
const quizUiImage = new Image(); quizUiImage.src = CAMINHO_QUIZ_UI;
const meganImage = new Image(); meganImage.src = CAMINHO_MEGAN_IMAGE;
const tuxQuizImage = new Image(); tuxQuizImage.src = CAMINHO_TUX_QUIZ;
const bossRoomImage = new Image(); bossRoomImage.src = CAMINHO_BOSS_FUNDO_IMAGE;
const princesaImage = new Image(); princesaImage.src = CAMINHO_PRINCESA_IMAGE;

const player = new Player(canvas.width, canvas.height, yChao + 10);

let boss = null;
let dialogoBossAtivo = false;
let dialogoMorteAtivo = false;
let cutsceneFinalAtiva = false;
let quizConcluido = false;


let princesaX = bossSalaX + 1300;
let tempoInicio = Date.now();
let tempoTotal = 0;

const FASES = [
  { gateX: 1500, inimigos: [{ tipo: "Atirador", x: 900 }, { tipo: "CorpoACorpo", x: 1200 }] },
  { gateX: 3000, inimigos: [{ tipo: "Atirador", x: 1800 }, { tipo: "Drone", x: 2200 }, { tipo: "CorpoACorpo", x: 2600 }] },
  { gateX: 4400, inimigos: [{ tipo: "Atirador", x: 3200 }, { tipo: "CorpoACorpo", x: 3600 }, { tipo: "Drone", x: 4000 }, { tipo: "Atirador", x: 4200 }] }
];

let faseAtual = 0;
let gateX = FASES[0].gateX;
const inimigos = [];
const playerprojeteis = [];
const enemyprojeteis = [];
const bombas = [];

const estado = {
  rodando: true,
  vitoria: false,
  chegouNoBoss: false,
  quizAtivo: false
};

let quizPerguntaAtual = 0;
let quizFaseDialogo = 0;
let quizAcertou = false;
let tempoTecla = 0;

const teclas = {
  left: false, right: false, pular: false,
  atirar: { pressionado: false, solto: true },
};

const carregarFase = (index, manterPlayer = false) => {
  faseAtual = index;
  inimigos.length = 0;
  playerprojeteis.length = 0;
  enemyprojeteis.length = 0;
  bombas.length = 0;
  player.invulneravelTimer = 0;
  quizConcluido = false;

  if (!manterPlayer) {
    player.reset();
    player.position.x = 200;
    player.position.y = player.chao - player.height;
    cameraX = 0;
    estado.vitoria = false;
    estado.chegouNoBoss = false;
    estado.rodando = true;
    estado.quizAtivo = false;
    boss = null;
    dialogoMorteAtivo = false;
    cutsceneFinalAtiva = false;
    tempoInicio = Date.now();
    princesaX = bossSalaX + 1300;
  }

  gateX = FASES[index].gateX;

  FASES[index].inimigos.forEach(dados => {
    let y = yChao - 120;
    if (dados.tipo === "Atirador") y = yChao - 100;
    if (dados.tipo === "Drone") y = -50;

    if (dados.tipo === "Atirador") inimigos.push(new Atirador({ x: dados.x, y: y }));
    if (dados.tipo === "CorpoACorpo") inimigos.push(new CorpoACorpo({ x: dados.x, y: y }));
    if (dados.tipo === "Drone") inimigos.push(new Drone({ x: dados.x, y: y }));
  });
};

const iniciarBoss = () => {
  estado.chegouNoBoss = true;
  estado.rodando = true;

  boss = new Boss({ x: bossSalaX + 500, y: yChao - 240 });

  player.position.x = bossSalaX + 100;
  player.position.y = yChao - player.height;
  cameraX = bossSalaX;
};

const drawProjeteis = (projeteis) => projeteis.forEach((p) => p.draw(ctx));
const updateProjeteis = (projeteis) => projeteis.forEach((p) => p.update());
const clearProjeteis = (projeteis) => {
  for (let i = projeteis.length - 1; i >= 0; i--) {
    const p = projeteis[i];
    if (p.position.x < cameraX - 200 || p.position.x > cameraX + canvas.width + 200) projeteis.splice(i, 1);
  }
};
const wrapText = (text, x, y, maxWidth, lineHeight) => {
  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
};
const drawQuiz = () => {
  if (quizUiImage.complete && quizUiImage.naturalWidth > 0) {
    ctx.drawImage(quizUiImage, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#222"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  const p = PERGUNTAS[quizPerguntaAtual];
  let textoParaMostrar = "";
  const tamanho = 260; const tuxX = 510; const tuxY = 180; const meganX = 930; const meganY = 180;

  if (tuxQuizImage.complete) ctx.drawImage(tuxQuizImage, tuxX, tuxY, tamanho, tamanho);
  if (meganImage.complete) ctx.drawImage(meganImage, meganX, meganY, tamanho, tamanho);

  ctx.fillStyle = "#FFF"; ctx.font = "16px 'Press Start 2P', monospace"; ctx.textAlign = "center";
  ctx.fillText(`QUIZ ${quizPerguntaAtual + 1}/3`, canvas.width / 2, 120);

  if (quizFaseDialogo === 0) textoParaMostrar = "[MEGAN FOX]\n" + p.pergunta;
  else if (quizFaseDialogo === 1) { textoParaMostrar = "[O QUE O TUX RESPONDE?]\n\n"; p.opcoes.forEach(op => { textoParaMostrar += op + "\n"; }); }
  else if (quizFaseDialogo === 2) { textoParaMostrar = "[MEGAN FOX]\n" + (quizAcertou ? p.reacaoAcerto : p.reacaoErro) + "\n\n" + (quizAcertou ? p.buffAcerto : p.buffErro); }
  else if (quizFaseDialogo === 3) textoParaMostrar = "[TUX]\n" + (quizAcertou ? p.falaTuxAcerto : p.falaTuxErro);

  ctx.fillStyle = "#E0E0E0"; ctx.font = "20px 'Press Start 2P', monospace"; ctx.textAlign = "left";
  wrapText(textoParaMostrar, 100, 580, 1080, 35);

  if (quizFaseDialogo !== 1) {
    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillStyle = "#FFF"; ctx.font = "16px 'Press Start 2P', monospace"; ctx.textAlign = "right";
      ctx.fillText("> PRESS ENTER", canvas.width - 120, 680);
    }
  } else {
    ctx.fillStyle = "#FFD700"; ctx.font = "16px 'Press Start 2P', monospace"; ctx.textAlign = "right";
    ctx.fillText("> SELECT 1, 2 OR 3", canvas.width - 120, 680);
  }
};

const gameLoop = () => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (estado.quizAtivo) {
    drawQuiz();
    if (tempoTecla > 0) tempoTecla--;
    window.requestAnimationFrame(gameLoop);
    return;
  }

  if (cutsceneFinalAtiva) {
    ctx.save();
    ctx.translate(-cameraX, 0);

    if (bossRoomImage.complete) ctx.drawImage(bossRoomImage, bossSalaX, 0, canvas.width, canvas.height);
    boss.draw(ctx);

    if (princesaX > bossSalaX + 900) {
      princesaX -= 3;
    }

    if (princesaImage.complete) {
      ctx.drawImage(princesaImage, princesaX, yChao - 100, 80, 100);
    } else {
      ctx.fillStyle = "#FF69B4";
      ctx.fillRect(princesaX, yChao - 100, 80, 100);
    }

    if (player.position.x < princesaX - 120) {
      player.moveRight();
    }
    player.update();
    player.draw(ctx);

    ctx.restore();

    if (player.position.x >= princesaX - 120) {
      cutsceneFinalAtiva = false;
      estado.vitoria = true;
      tempoTotal = Math.floor((Date.now() - tempoInicio) / 1000);
    }

    window.requestAnimationFrame(gameLoop);
    return;
  }

  if (dialogoBossAtivo) {
    ctx.save();
    ctx.translate(-cameraX, 0);

    if (bossRoomImage.complete) ctx.drawImage(bossRoomImage, bossSalaX, 0, canvas.width, canvas.height);
    boss.estado = "DIALOGO";
    boss.draw(ctx);
    player.draw(ctx);
    ctx.restore();

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FFF";
    ctx.font = "24px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText("WINDOWS: Parece que você veio para o resgate, no fim você caiu na armadilha!", canvas.width / 2, 200);
    ctx.fillText("O resgate era apenas uma forma de fazer você vir, o objetivo final é a sua morte.", canvas.width / 2, 260);

    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillStyle = "#FFD700";
      ctx.font = "16px 'Press Start 2P', monospace";
      ctx.fillText("> PRESIONE ENTER PARA COMBATER", canvas.width / 2, 600);
    }

    window.requestAnimationFrame(gameLoop);
    return;
  }

  if (dialogoMorteAtivo) {
    ctx.save();
    ctx.translate(-cameraX, 0);

    if (bossRoomImage.complete) ctx.drawImage(bossRoomImage, bossSalaX, 0, canvas.width, canvas.height);
    boss.draw(ctx);
    player.draw(ctx);
    ctx.restore();

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FFF";
    ctx.font = "24px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText("WINDOWS: Mas isso é impossivel!", canvas.width / 2, 200);
    ctx.fillText("Como ISSO conseguiu me derrotar...", canvas.width / 2, 260);
    ctx.fillText("Acho que preciso diminuir as medidas abusivas no meu sistema...", canvas.width / 2, 320);
     ctx.fillText("Só assim posso te derrotar...", canvas.width / 2, 380);

    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillStyle = "#FFD700";
      ctx.font = "16px 'Press Start 2P', monospace";
      ctx.fillText("> PRESIONE ENTER PARA PROSEGUIR", canvas.width / 2, 600);
    }

    window.requestAnimationFrame(gameLoop);
    return;
  }

  const todosMortos = inimigos.every((i) => !i.vivo);

  if (estado.rodando) {
    if (teclas.left && player.position.x >= 0) player.moveLeft();
    if (teclas.right) {
      if (!todosMortos && player.position.x + player.width >= gateX && !estado.chegouNoBoss) {
        player.position.x = gateX - player.width;
      } else if (player.position.x <= mapaWidth - player.width - 50) {
        player.moveRight();
      }
    }

    if (teclas.atirar.pressionado && teclas.atirar.solto) {
      player.shoot(playerprojeteis);
      teclas.atirar.solto = false;
    }

    player.update();

    if (boss && boss.estado !== "DESLIGADO") {
      boss.update(player, yChao);

      playerprojeteis.forEach((proj, index) => {
        if (proj.position.x < boss.position.x + boss.width &&
            proj.position.x + proj.width > boss.position.x &&
            proj.position.y < boss.position.y + boss.height &&
            proj.position.y + proj.height > boss.position.y) {

          boss.receberDano(player.danoProjetil);
          playerprojeteis.splice(index, 1);
        }
      });

      if (boss.estado === "MORTO" && !dialogoMorteAtivo && !estado.vitoria) {
        if (boss.position.y >= yChao - boss.height) {
          dialogoMorteAtivo = true;
          estado.rodando = false;
        }
      }
    }

    inimigos.forEach((inimigo) => {
      const margem = 200;
      if (inimigo.vivo && inimigo.position.x > cameraX - margem && inimigo.position.x < cameraX + canvas.width + margem) {
        inimigo.update(player, enemyprojeteis, bombas);
      }
    });

    for (let i = bombas.length - 1; i >= 0; i--) {
      const bomba = bombas[i];
      bomba.update();
      if (bomba.explodiu && bomba.tempoExplosao === 19) {
        const distPlayer = Math.hypot((bomba.position.x - player.position.x), (bomba.position.y - player.position.y));
        if (distPlayer < bomba.raioExplosao) {
          if (player.invulneravelTimer <= 0) {
            player.hp -= 1;
            if (player.temBuffInvulnerabilidade) player.invulneravelTimer = 180;
          }
        }
      }
      if (bomba.explodiu && bomba.tempoExplosao <= 0) bombas.splice(i, 1);
    }

    updateProjeteis(playerprojeteis);
    updateProjeteis(enemyprojeteis);

    if (checarColisoes(enemyprojeteis, player)) {
      if (player.invulneravelTimer <= 0) {
        player.hp -= 1;
        if (player.temBuffInvulnerabilidade) player.invulneravelTimer = 180;
      }
    }

    inimigos.forEach((inimigo) => {
      if (!inimigo.vivo) return;
      if (inimigo.position.x > cameraX - 100 && inimigo.position.x < cameraX + canvas.width + 100) {
        if (checarColisoes(playerprojeteis, inimigo)) {
          inimigo.hp -= player.danoProjetil;
          if (inimigo.hp <= 0) inimigo.vivo = false;
        }
      }
    });

    if (player.hp <= 0) {
      player.hp = 0;
      estado.rodando = false;
      estado.vitoria = false;
    }

    if (todosMortos && !estado.chegouNoBoss && !estado.quizAtivo && estado.rodando && !quizConcluido) {
      if (player.position.x > gateX && player.position.x < bossDoorX && faseAtual < FASES.length) {
        estado.quizAtivo = true;
        estado.rodando = false;
        quizPerguntaAtual = faseAtual;
        quizFaseDialogo = 0;
        tempoTecla = 30;
      }
    }

    if (player.position.x >= bossDoorX && faseAtual === FASES.length - 1 && !estado.chegouNoBoss) {
      iniciarBoss();
    }

    if (estado.chegouNoBoss && !dialogoBossAtivo && boss && boss.estado === "DESLIGADO") {
       if (player.position.x > boss.position.x - 300) {
         dialogoBossAtivo = true;
         estado.rodando = false;
       }
    }

    clearProjeteis(playerprojeteis);
    clearProjeteis(enemyprojeteis);

    if (estado.chegouNoBoss) {
      cameraX = bossSalaX;
      if (player.position.x < bossSalaX) player.position.x = bossSalaX;
      if (player.position.x + player.width > bossSalaX + canvas.width) player.position.x = bossSalaX + canvas.width - player.width;
    } else {
      cameraX = player.position.x - canvas.width / 2;
      if (cameraX < 0) cameraX = 0;
      if (cameraX > mapaWidth - canvas.width) cameraX = mapaWidth - canvas.width;
    }
  }

  ctx.save();
  ctx.translate(-cameraX, 0);

  if (estado.chegouNoBoss) {
    if (bossRoomImage.complete && bossRoomImage.naturalWidth > 0) {
      ctx.drawImage(bossRoomImage, bossSalaX, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#DDD"; ctx.fillRect(bossSalaX, 0, canvas.width, canvas.height);
    }
  } else {
    if (fundoImage.complete && fundoImage.naturalWidth > 0) {
      ctx.drawImage(fundoImage, 0, 0, mapaWidth, canvas.height);
    } else {
      ctx.fillStyle = "#87CEEB"; ctx.fillRect(0, 0, mapaWidth, canvas.height);
    }
    ctx.fillStyle = "#2c3e50"; ctx.fillRect(0, yChao, mapaWidth, canvas.height - yChao);
  }

  if (!todosMortos && faseAtual < FASES.length && !estado.chegouNoBoss) {
    ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
    ctx.fillRect(gateX - 5, 0, 10, canvas.height);
  }
  // Mantém a princesa visível na tela de vitória
  if (estado.vitoria && princesaImage.complete && princesaImage.naturalWidth > 0) {
      ctx.drawImage(princesaImage, princesaX, yChao - 100, 80, 100);
  }
  if (boss) boss.draw(ctx);

  inimigos.forEach((inimigo) => {
    if (!inimigo.vivo) return;
    inimigo.draw(ctx);
    if (inimigo.constructor.name !== "Drone") {
      drawHealthBar(ctx, inimigo.position.x, inimigo.position.y - 15, inimigo.width, 8, inimigo.hp, inimigo.hpMax);
    }
  });

  bombas.forEach((bomba) => bomba.draw(ctx));
  player.draw(ctx);
  drawProjeteis(playerprojeteis);
  drawProjeteis(enemyprojeteis);
  ctx.restore();

  drawCoracoes(ctx, player.hp, player.hpMax);

  if (todosMortos && player.position.x < gateX && faseAtual < FASES.length && estado.rodando) {
    if (setaImage.complete && setaImage.naturalWidth > 0) {
      ctx.drawImage(setaImage, canvas.width - 280, 20, 240, 120);
    }
  }

  if (!estado.rodando && !estado.quizAtivo && !dialogoBossAtivo && !dialogoMorteAtivo && !cutsceneFinalAtiva) {
    if (estado.vitoria) drawVitoria(ctx, canvas, player.hp, tempoTotal);
    else if (!estado.vitoria) drawGameOver(ctx, canvas);
  }

  window.requestAnimationFrame(gameLoop);
};

window.addEventListener("keydown", (event) => {
  const tecla = event.key.toLowerCase();

  if (dialogoMorteAtivo) {
    if (tecla === "enter" || tecla === "e") {
      dialogoMorteAtivo = false;
      cutsceneFinalAtiva = true;
    }
    return;
  }

  if (dialogoBossAtivo) {
    if (tecla === "enter" || tecla === "e") {
      dialogoBossAtivo = false;
      boss.estado = "SUBINDO";
      estado.rodando = true;
    }
    return;
  }

  if (estado.quizAtivo) {
    if (quizFaseDialogo === 0 || quizFaseDialogo === 2 || quizFaseDialogo === 3) {
      if ((tecla === "enter" || tecla === "e") && tempoTecla === 0) {
        if (quizFaseDialogo === 0) quizFaseDialogo = 1;
        else if (quizFaseDialogo === 2) quizFaseDialogo = 3;
        else if (quizFaseDialogo === 3) {
          estado.quizAtivo = false;
          estado.rodando = true;
          quizConcluido = true;

          if (faseAtual < FASES.length - 1) {
            carregarFase(faseAtual + 1, true);
          }
        }
      }
    }
    else if (quizFaseDialogo === 1) {
      const numTecla = parseInt(tecla);
      if (numTecla >= 1 && numTecla <= 3 && tempoTecla === 0) {
        const resposta = numTecla - 1;
        const p = PERGUNTAS[quizPerguntaAtual];
        quizAcertou = (resposta === p.correta);
        if (quizAcertou) {
          if (faseAtual === 0) player.temBuffInvulnerabilidade = true;
          else if (faseAtual === 1) player.danoProjetil = 2;
          else if (faseAtual === 2) { player.temBuffDash = true; player.hp = 5; }
        }
        quizFaseDialogo = 2;
        tempoTecla = 15;
      }
    }
    return;
  }

  if (tecla === "d") teclas.right = true;
  if (tecla === "a") teclas.left = true;
  if (tecla === "enter") teclas.atirar.pressionado = true;
  if (tecla === "w" || tecla === " ") {
    if (!teclas.pular && estado.rodando) player.pular();
    teclas.pular = true;
  }

  if (tecla === "r" && !estado.rodando && !estado.quizAtivo && !cutsceneFinalAtiva) {
    carregarFase(0, false);
  }
});

window.addEventListener("keyup", (event) => {
  const tecla = event.key.toLowerCase();
  if (tecla === "d") teclas.right = false;
  if (tecla === "a") teclas.left = false;
  if (tecla === "enter") {
    teclas.atirar.pressionado = false;
    teclas.atirar.solto = true;
  }
  if (tecla === "w" || tecla === " ") teclas.pular = false;
});

carregarFase(0, false);
gameLoop();
