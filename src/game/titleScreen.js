
export function titleScreen(skin) {
    console.log(skin);
    console.warn("TITLESCREEN Entered.");
    return new Promise(async r => {
        // const basePath = skin.basePath;
        // console.warn('booting.');
        // $(".container").toggleClass("d-none");
        // document.body.insertAdjacentHTML('beforeend', logoLayout);
        // await showLogos("./data/skin/", VoiceList.boot.concat(VoiceList.logo));
        // $(".container").toggleClass("d-none");
        r(1);
    })
};
