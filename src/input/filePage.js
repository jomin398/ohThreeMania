import {
    fileInputlayout
} from "../game/layouts/main.js";
export const filePage = (() => {
    const uploaded = new Promise(r => {
        $('body').on("dragenter", ".container", highlight);
        $('body').on("dragover", ".container", highlight);
        $('body').on("dragleave", ".container", unhighlight);
        $('body').on("drop", ".container", handleDrop);
        function highlight(e) {
            e.stopPropagation();
            e.preventDefault();
            $("#drop-area").addClass("highlight");
        }

        function unhighlight(e) {
            e.stopPropagation();
            e.preventDefault();
            $("#drop-area").removeClass("highlight");
        }

        function handleDrop(e) {
            e.stopPropagation();
            e.preventDefault();
            if (e.originalEvent.dataTransfer) {
                r(e.originalEvent.dataTransfer.files)
            } else {
                r(e.target.files)
            };
            $('body').off("dragenter", ".container");
            $('body').off("dragover", ".container");
            $('body').off("dragleave", ".container");
            $('body').off("drop", ".container");
        }
        $('body').on("change", "#fileElem", handleDrop);
    })
    return {
        uploaded
    };
})();
export const fileInputInit = new Promise(r => {
    document.body.insertAdjacentHTML('beforeend', fileInputlayout);
    const isMobile = navigator.userAgentData.mobile;
    if (isMobile) {
        $("#drop-area").toggleClass("d-none");
        $("input[type=file]").toggleClass("d-none");
    } else {
        $(".container input.onlyMobile").toggleClass("d-none");
    }
    console.log("awaiting upload")
    r(1);
})