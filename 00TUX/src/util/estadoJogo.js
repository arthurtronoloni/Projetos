const drawOverlay = (ctx, canvas) => {
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const drawCenteredText = (ctx, canvas, texto, yOffset, tamanho, cor) => {
  ctx.fillStyle = cor;
  ctx.font = `bold ${tamanho}px 'Press Start 2P', monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(texto, canvas.width / 2, canvas.height / 2 + yOffset);
};

export const drawGameOver = (ctx, canvas) => {
  drawOverlay(ctx, canvas);
  drawCenteredText(ctx, canvas, "VOCÊ PERDEU", -40, 72, "#e74c3c");
  drawCenteredText(ctx, canvas, "Aperte R para reiniciar", 40, 24, "#fff");
};

export const drawVitoria = (ctx, canvas, hp, tempoSegundos) => {
  drawOverlay(ctx, canvas);

  let rank = "C";
  if (hp === 5 && tempoSegundos < 240) rank = "S";
  else if (hp >= 3) rank = "A";
  else if (hp >= 1) rank = "B";

  const minutos = Math.floor(tempoSegundos / 60);
  const segundos = tempoSegundos % 60;

  drawCenteredText(ctx, canvas, "VOCÊ O RESGATOU!", -140, 60, "#2ecc71");
  drawCenteredText(ctx, canvas, `RANK: ${rank}`, -50, 72, "#f1c40f");
  drawCenteredText(ctx, canvas, `VIDA RESTANTE: ${hp} / 5`, 30, 24, "#fff");
  drawCenteredText(ctx, canvas, `TEMPO: ${minutos}m ${segundos}s`, 80, 24, "#fff");
  drawCenteredText(ctx, canvas, "Aperte R para jogar novamente", 160, 16, "#aaa");
};
