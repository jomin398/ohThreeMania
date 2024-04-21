import { getIsMobile } from '../utils.js';

export function updateLvPreview(optn) {
    const target = $($('.songDiffList .carousel-inner').children()[optn]).find(".selectPreviewWrap .previewLv");
    target.html('');
    const elem = $(this);
    const radioInput = elem.clone();
    const key = radioInput.attr("id");
    if (getIsMobile()) {
        elem.parent().find(`label[for="${key}"]`).attr("style", "border: 2px dashed var(--bs-btn-color);").clone().attr("for", `preview-${optn}`).appendTo(target).removeAttr("style");
        radioInput.attr("id", `preview-${optn}`).appendTo(target);
    } else {


        Array.from(elem.parent().find("label")).forEach(e => { $(e).find(".innerWrap")[0].style.border = "2px solid transparent"; });
        let sel = elem.parent().find(`label[for="${key}"] .innerWrap`)[0];
        if (sel) sel.style.border = "2px dashed var(--bs-btn-color)";
    }
}
