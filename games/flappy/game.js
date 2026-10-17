let frames = 0;
let gameScore = 0;
const sprites = {
  background: new Image(),
  groundGrass: new Image(),
  rockGrass: new Image(),
  rockGrassDown: new Image(),
  textGameOver: new Image(),
  textGetReady: new Image(),
};
Object.entries(sprites).forEach(([name, image]) => {
  image.src = `assets/${name}.png`;
});

const canvas = document.querySelector('canvas');
const contexto = canvas.getContext('2d');


// [Plano de Fundo]
const planoDeFundo = {
  x: 0,
  desenha() {
    contexto.drawImage(sprites.background, 0, 0, canvas.width, canvas.height);
  },
};

// [Chao]
function criaChao() {
  const chao = {
    largura: canvas.width,
    altura: 42,
    x: 0,
    y: canvas.height - 42,
    atualiza() {
      chao.x = (chao.x - 2) % chao.largura;
    },
    desenha() {
      contexto.drawImage(sprites.groundGrass, chao.x, chao.y, chao.largura, chao.altura);
      contexto.drawImage(sprites.groundGrass, chao.x + chao.largura, chao.y, chao.largura, chao.altura);
    },
  };
  return chao;
}

function fazColisao(flappyBird, chao) {
  return flappyBird.y < 0 || flappyBird.y + flappyBird.altura >= chao.y;
}

function criaFlappyBird() {
  const flappyBird = {
    largura: 52,
    altura: 43,
    x: 76,
    y: 145,
    pulo: 4.4,
    pula() {
      flappyBird.velocidade = -flappyBird.pulo;
    },
    gravidade: 0.22,
    velocidade: 0,
    atualiza() {
      if(fazColisao(flappyBird, globais.chao)) {
        mudaParaTela(Telas.GAME_OVER);
        return;
      }
  
      flappyBird.velocidade = flappyBird.velocidade + flappyBird.gravidade;
      flappyBird.y = flappyBird.y + flappyBird.velocidade;
    },
    movimentos: [
      -2,
      1,
      4,
    ],
    frameAtual: 0,
    atualizaOFrameAtual() {
      if(frames % 8 === 0) {
        flappyBird.frameAtual = (flappyBird.frameAtual + 1) % flappyBird.movimentos.length;
      }
    },
    desenha() {
      flappyBird.atualizaOFrameAtual();
      const wingOffset = flappyBird.movimentos[flappyBird.frameAtual];
      contexto.save();
      contexto.translate(flappyBird.x + flappyBird.largura / 2, flappyBird.y + flappyBird.altura / 2);
      contexto.rotate(Math.max(-0.35, Math.min(0.6, flappyBird.velocidade * 0.08)));
      contexto.fillStyle = '#f3c84b';
      contexto.strokeStyle = '#704b24';
      contexto.lineWidth = 2;
      contexto.beginPath();
      contexto.ellipse(-2, 1, 21, 16, 0, 0, Math.PI * 2);
      contexto.fill();
      contexto.stroke();
      contexto.fillStyle = '#ffe68b';
      contexto.beginPath();
      contexto.ellipse(-7, 5 + wingOffset, 10, 6, -0.15, 0, Math.PI * 2);
      contexto.fill();
      contexto.fillStyle = '#e98038';
      contexto.beginPath();
      contexto.moveTo(16, -2);
      contexto.lineTo(28, 2);
      contexto.lineTo(16, 6);
      contexto.closePath();
      contexto.fill();
      contexto.fillStyle = '#203229';
      contexto.beginPath();
      contexto.arc(7, -6, 2.5, 0, Math.PI * 2);
      contexto.fill();
      contexto.restore();
    }
  }
  return flappyBird;  
}


/// [mensagemGetReady]
const mensagemGetReady = {
  desenha() {
    contexto.drawImage(sprites.textGetReady, canvas.width / 2 - 120, 38, 240, 44);
    contexto.fillStyle = '#203229';
    contexto.font = 'bold 15px sans-serif';
    contexto.textAlign = 'center';
    contexto.fillText('TAP OR PRESS SPACE TO FLY', canvas.width / 2, 105);
  }
}

// [mensagemGameOver]
const mensagemGameOver = {
  desenha() {
    contexto.drawImage(sprites.textGameOver, canvas.width / 2 - 128, 46, 256, 48);
    contexto.fillStyle = '#203229';
    contexto.font = 'bold 15px sans-serif';
    contexto.textAlign = 'center';
    contexto.fillText('TAP TO PLAY AGAIN', canvas.width / 2, 112);
  }
}

// 
// [Canos]
// 

function criaCanos() {
  const canos = {
    largura: 76,
    altura: 250,
    espaco: 124,
    desenha() {
      canos.pares.forEach(function(par) {
        contexto.drawImage(sprites.rockGrassDown, par.x, par.y - canos.altura, canos.largura, canos.altura);
        contexto.drawImage(sprites.rockGrass, par.x, par.y + canos.espaco, canos.largura, canos.altura);
        par.gapTop = par.y;
        par.gapBottom = par.y + canos.espaco;
      })
    },
    temColisaoComOFlappyBird(par) {
      const bird = globais.flappyBird;
      const overlapsX = bird.x + bird.largura > par.x && bird.x < par.x + canos.largura;
      return overlapsX && (bird.y < par.gapTop || bird.y + bird.altura > par.gapBottom);
    },
    pares: [],
    atualiza() {
      if(frames % 105 === 0) {
        canos.pares.push({
          x: canvas.width,
          y: 68 + Math.random() * 112,
          scored: false,
        });
      }



      canos.pares.forEach(function(par) {
        par.x -= 2.4;

        if(canos.temColisaoComOFlappyBird(par)) {
          mudaParaTela(Telas.GAME_OVER);
        }

        if(!par.scored && par.x + canos.largura < globais.flappyBird.x) {
          par.scored = true;
          gameScore += 1;
        }
      });
      canos.pares = canos.pares.filter((par) => par.x + canos.largura > 0);
    }
  }

  return canos;
}

function criaPlacar() {
  const placar = {
    desenha() {
      contexto.font = 'bold 30px sans-serif';
      contexto.textAlign = 'center';
      contexto.lineWidth = 4;
      contexto.strokeStyle = 'rgba(32, 50, 41, .55)';
      contexto.fillStyle = '#fff';
      contexto.strokeText(`${gameScore}`, canvas.width / 2, 38);
      contexto.fillText(`${gameScore}`, canvas.width / 2, 38);
    }
  }
  return placar;
}


// 
// [Telas]
// 
const globais = {};
let telaAtiva = {};
function mudaParaTela(novaTela) {
  telaAtiva = novaTela;

  if(telaAtiva.inicializa) {
    telaAtiva.inicializa();
  }
}

const Telas = {
  INICIO: {
    inicializa() {
      frames = 0;
      gameScore = 0;
      globais.flappyBird = criaFlappyBird();
      globais.chao = criaChao();
      globais.canos = criaCanos();
    },
    desenha() {
      planoDeFundo.desenha();
      globais.flappyBird.desenha();
      
      globais.chao.desenha();
      mensagemGetReady.desenha();
    },
    click() {
      mudaParaTela(Telas.JOGO);
      globais.flappyBird.pula();
    },
    atualiza() {
      globais.chao.atualiza();
    }
  }
};

Telas.JOGO = {
  inicializa() {
    globais.placar = criaPlacar();
  },
  desenha() {
    planoDeFundo.desenha();
    globais.canos.desenha();
    globais.chao.desenha();
    globais.flappyBird.desenha();
    globais.placar.desenha();
  },
  click() {
    globais.flappyBird.pula();
  },
  atualiza() {
    globais.canos.atualiza();
    globais.chao.atualiza();
    globais.flappyBird.atualiza();
  }
};

Telas.GAME_OVER = {
  desenha() {
    planoDeFundo.desenha();
    globais.chao.desenha();
    mensagemGameOver.desenha();
    globais.placar.desenha();
  },
  atualiza() {},
  click() {
    mudaParaTela(Telas.INICIO);
  }
};

function loop() {

  telaAtiva.desenha();
  telaAtiva.atualiza();

  frames = frames + 1;
  requestAnimationFrame(loop);
}


canvas.addEventListener('click', function() {
  canvas.focus({ preventScroll: true });
  if(telaAtiva.click) {
    telaAtiva.click();
  }
});

window.addEventListener('keydown', function(event) {
  if((event.code === 'Space' || event.code === 'ArrowUp') && !event.repeat) {
    event.preventDefault();
    if(telaAtiva.click) {
      telaAtiva.click();
    }
  }
});

mudaParaTela(Telas.INICIO);
loop();