export const convertedWarn = icoName => `<div class="beatmapConvertedWarn d-flex align-items-center">
    <span class="beatmap-icon beatmap-icon--beatmapset">
        <i class="fa-extra-mode-${icoName ?? "standard"}"></i>
    </span>
    <span id="icon_TransFrom">⇆</span>
    <span class="beatmap-icon beatmap-icon--beatmapset">
        <i class="fa-extra-mode-mania"></i>
    </span>
</div>`;