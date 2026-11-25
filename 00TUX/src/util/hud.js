const drawCoracao = (ctx, x, y, size, cheio) => {
  ctx.save();
  ctx.translate(x, y);

  ctx.beginPath();
  ctx.moveTo(0, size * 0.3);
  ctx.bezierCurveTo(0, 0, -size * 0.5, 0, -size * 0.5, size * 0.3);
  ctx.bezierCurveTo(-size * 0.5, size * 0.6, 0, size * 0.8, 0, size);
  ctx.bezierCurveTo(0, size * 0.8, size * 0.5, size * 0.6, size * 0.5, size * 0.3);
  ctx.bezierCurveTo(size * 0.5, 0, 0, 0, 0, size * 0.3);
  ctx.closePath();

  ctx.fillStyle = cheio ? "#e74c3c" : "#333";
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
};

export const drawCoracoes = (ctx, hp, hpMax) => {
  const size = 30;
  const gap = 10;
  const startX = 40;
  const startY = 30;

  for (let i = 0; i < hpMax; i++) {
    const x = startX + i * (size + gap);
    drawCoracao(ctx, x, startY, size, i < hp);
  }
};

export const drawHealthBar = (ctx, x, y, width, height, hpAtual, hpMax) => {
  const pct = hpAtual / hpMax;

  ctx.fillStyle = "#000";
  ctx.fillRect(x, y, width, height);

  if (pct > 0.5) ctx.fillStyle = "#2ecc71";
  else if (pct > 0.25) ctx.fillStyle = "#f39c12";
  else ctx.fillStyle = "#e74c3c";

  ctx.fillRect(x, y, width * pct, height);

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
};
