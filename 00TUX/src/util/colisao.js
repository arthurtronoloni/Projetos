export const colidiu = (a, b) => {
  return (
    a.position.x < b.position.x + b.width &&
    a.position.x + a.width > b.position.x &&
    a.position.y < b.position.y + b.height &&
    a.position.y + a.height > b.position.y
  );
};

export const checarColisoes = (projeteis, alvo) => {

  if (alvo.vivo === false) return false;

  for (let i = projeteis.length - 1; i >= 0; i--) {
    const p = projeteis[i];
    if (colidiu(p, alvo)) {
      projeteis.splice(i, 1);
      return true;
    }
  }
  return false;
};
