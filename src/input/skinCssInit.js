export async function skinCssInit(skin) {
    const d = skin.parser;
    const skinStyleCssStr = await (await fetch(skin.basePath + "./style.css")).text();
    //d.Colours.MenuGlow;
    let actCol = d.Colours.MenuGlow.split(',');
    document.head.insertAdjacentHTML('beforeend', `<style>
    ${skinStyleCssStr}
    #difficultySel .carousel-item.active{
            animation: borderFade 1.5s infinite alternate;
    }
    @keyframes borderFade {
        0% {
        border-color: rgba(${actCol[0]},${actCol[1]},${actCol[2]}, 1);
        }
        100% {
        border-color: rgba(${actCol[0]},${actCol[1]},${actCol[2]}, 0.3);
        }
    }
    </style>`);
}
