const canvas = document.getElementById('video-canvas');
const context = canvas.getContext('2d');

// ATENÇÃO: Verifique quantos frames foram gerados na pasta e atualize este número!
const frameCount = 188; 

// Formata o nome para buscar frame-001.webp, frame-002.webp, etc.
const currentFrame = index => (
  `public/frames/frame-${index.toString().padStart(3, '0')}.webp`
);

const images = [];

// Tamanho base original do vídeo (ajuste se for, por exemplo, 4K ou Vertical)
canvas.width = 1920; 
canvas.height = 1080;

// Carrega a primeira imagem imediatamente para não ter tela preta
const firstImage = new Image();
firstImage.src = currentFrame(1);
firstImage.onload = () => {
    context.drawImage(firstImage, 0, 0, canvas.width, canvas.height);
};
images[0] = firstImage;

// Função de Preload progressivo para não travar o carregamento do site
const preloadImages = () => {
    for (let i = 2; i <= frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images[i - 1] = img;
    }
};

// Iniciar o preload dos outros frames logo após o site carregar
window.addEventListener('load', () => {
    setTimeout(preloadImages, 500);
});

// Lógica de renderização conectada ao Scroll
window.addEventListener('scroll', () => {  
    const html = document.documentElement;
    const scrollTop = html.scrollTop;
    const maxScrollTop = html.scrollHeight - window.innerHeight;
    const scrollFraction = scrollTop / maxScrollTop;
    
    // Calcula o índice atual baseado na fração rolada
    const frameIndex = Math.min(
        frameCount - 1,
        Math.ceil(scrollFraction * frameCount)
    );
    
    // Desenha apenas se a imagem já foi baixada
    if (images[frameIndex] && images[frameIndex].complete) {
        requestAnimationFrame(() => {
            context.drawImage(images[frameIndex], 0, 0, canvas.width, canvas.height);
        });
    }
});

// --- SpecularButton (React Bits JS+CSS dynamic reflection handler) ---
function initSpecularButtons() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        if (btn.dataset.specularInitialized) return;
        btn.dataset.specularInitialized = 'true';

        btn.addEventListener('pointermove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            btn.style.setProperty('--x', `${x.toFixed(1)}px`);
            btn.style.setProperty('--y', `${y.toFixed(1)}px`);
            btn.style.setProperty('--specular-opacity', '1');
        });

        btn.addEventListener('pointerleave', () => {
            btn.style.setProperty('--specular-opacity', '0');
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpecularButtons);
} else {
    initSpecularButtons();
}
window.addEventListener('load', initSpecularButtons);
