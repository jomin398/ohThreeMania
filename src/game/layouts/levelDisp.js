export const body = `<section class="container-fluid d-flex flex-column songSelectWrap">
  <header class="row container-title justify-content-center">
      <div class="row">
          <div class="row row align-items-center">
              <h1 class="w-auto text-info">Select Music</h1>
              <p class="w-auto m-0 text-info">Select the Song you want to play</p>
          </div>
          <div class="searchTab input-group gap-1">
              <!-- 아티스트 또는 소스(앨범명)을 입력해주세요 -->
              <input class="form-control" type="search" id="searchInput" placeholder="아티스트 또는 소스(앨범명)을 입력! (회색 태그 버튼 참고)" aria-label="Search">
              <button class="btn btn-outline-success my-2 my-sm-0" title="검색" id="searchBtn">
                <i class="bi bi-search"></i>
              </button>
              <button class="btn btn-outline-danger my-2 my-sm-0" title="검색초기화" id="searchResetBtn">
                <i class="bi bi-trash3"></i>
              </button>
          </div>
          <div class="songCountWrap">
              <h1 id="currentSongNumber">001</h1>
              <h1>/</h1>
              <h3 id="totalSongNumber">001</h3>
          </div>
      </div>
  </header>
  <div class="songDiffListWrap d-flex flex-column flex-grow-1 justify-content-between gap-3">
    <div id="songDiffList" class="carousel slide songDiffList flex-grow-1">
        <div class="carousel-inner d-flex w-100 h-100">
        </div>
        <button class="carousel-control-prev justify-content-start align-items-start" type="button">
            <span class="carousel-control-prev-icon bg-black" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next justify-content-end align-items-start" type="button">
            <span class="carousel-control-next-icon bg-black" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
        </button>
    </div>
    <footer class="d-flex flex-column align-items-center gap-3">
      <div class="d-flex align-items-center gap-4">
        <input type="checkbox" class="btn-check" value="" id="autoPlay">
        <label class="btn btn-neon" for="autoPlay">
          AutoPlay
        </label>
        <br>
        <input type="checkbox" class="btn-check" value="" id="view3d">
        <label class="btn btn-neon" for="view3d">
          3D View
        </label>
      </div>
      <button type="button" class="btn btn-secondary" id="lastScore" disabled>이전 스코어 보기</button>
      <button type="button" class="btn btn-primary w-25" id="startBtn">시작</button>
    </footer>
  </div>
  <div class="chrImage">
      <div class="faceWrap" style="--anitime:1s;">
        <div class="face">
            <div class="mouthWrap">
                <div class="mouth" id="m2"></div>
            </div>
        </div>
      </div>
  </div>
  <i class="settingBtn bi bi-gear d-none"></i>
</section>`;