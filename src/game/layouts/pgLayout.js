export default `<div class="container progressWrap d-flex flex-column justify-content-center d-none">
    <div class="header d-flex align-items-center justify-content-center gap-3">
        <h1>Loading Beatmaps...</h1>
        <h3 class="percent main-percent m-0">0%</h3>
    </div>
    <div class="fileTitle text-center"></div>
    <div class="mainProgress progress">
        <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
            <span class="thumbImg" style="--pgn1:0%;"></span>
        </div>
    </div>
    <div class="subProgress progress">
        <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
        <div class="header d-flex align-items-center justify-content-end gap-3 w-100">
            <h3 class="subtitle flex-grow-1 text-end">Loading...</h3>
            <h4 class="percent m-0">0%</h4>
        </div>
    </div>
</div>`;