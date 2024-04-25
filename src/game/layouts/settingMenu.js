export default `<section class="settingMenu modal fade" id="settingMenu" data-bs-backdrop="static" tabindex="-1"
aria-labelledby="settingMenuLabel" aria-hidden="true">
<div class="modal-dialog">
    <div class="modal-content">
        <div class="modal-header">
            <h1 class="modal-title fs-5" id="settingMenuLabel">설정</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body gap-2">
            <div class="tab-content d-flex flex-grow-1" id="nav-tabContent">
                <div class="tab-pane fade flex-grow-1 show active" id="nav-home" role="tabpanel"
                    aria-labelledby="nav-home-tab">
                    <div class="col card gameplay">
                        <h5 class="card-header">게임플레이 설정</h5>
                        <div class="card-body">
                            <div class="form-check">
                                <div class="mb-3 form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="countdownCheck" checked>
                                    <label class="form-check-label" for="countdownCheck">곡이 시작될 때 카운트 다운</label>
                                </div>
                            </div>
                            <div class="form-check">
                                <h6>일정한 진행도가 되면 스킬발동</h6>
                                <div class="mb-3 form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="skilVoiceMute" checked>
                                    <label class="form-check-label" for="skilVoiceMute">보이스 활성화</label>
                                </div>
                            </div>
                            <div class="form-check">
                                <h6>
                                    기브업(Give UP) / 트랙 중도 포기
                                </h6>
                                <div class="mb-3 form-switch">
                                    <input class="form-check-input" type="checkbox" id="giveUP"
                                        onchange="$('.giveUP').toggleClass('d-none')" checked>
                                    <label class="form-check-label" for="giveUP"></label>
                                </div>
                            </div>
                            <div class="form-check">
                                <h6>FPS 표시</h6>
                                <div class="mb-3 form-switch">
                                    <input class="form-check-input" type="checkbox" id="fps">
                                    <label class="form-check-label" for="fps"></label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col card giveUP">
                        <h5 class="card-header" id="giveUPTitle" translate="no">기브업(Give UP)</h5>
                        <div class="card-body">
                            <div class="mb-3 form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="selfCrash" checked>
                                <label class="form-check-label" for="selfCrash">입력이 없으면 포기</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tab-pane fade flex-grow-1" id="nav-audio" role="tabpanel"
                    aria-labelledby="nav-audio-tab">
                    <div class="col card">
                        <h5 class="card-header">음량 설정</h5>
                        <div class="card-body">
                            <label for="musicVolume" class="form-label">노래 음량</label>
                            <div class="range-wrap">
                                <div class="range-value"></div>
                                <input class="form-range" type="range" min="0" max="1" step="0.01" value="1"
                                    id="musicVolume">
                            </div>
                            <label for="voiceVolume" class="form-label">캐릭터 보이스 음량</label>
                            <div class="range-wrap">
                                <div class="range-value"></div>
                                <input class="form-range" type="range" min="0" max="1" step="0.01" value="1"
                                    id="voiceVolume">
                            </div>
                            <label for="sfxVolume" class="form-label">효과음 음량</label>
                            <div class="range-wrap">
                                <div class="range-value"></div>
                                <input class="form-range" type="range" min="0" max="1" step="0.01" value="0.3"
                                    id="sfxVolume">
                            </div>
                            <div class="form-check p-0">
                                <div class="mb-3 form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="playSfx" checked>
                                    <label class="form-check-label" for="playSfx">효과음 재생</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tab-pane fade flex-grow-1" id="nav-input" role="tabpanel"
                    aria-labelledby="nav-input-tab">
                    <div class="col card keyBindSetting">
                        <h5 class="card-header">키보드 설정</h5>
                        <div class="card-body">
                            <div id="keyButtons" class="btn-group" role="group">
                                <button id="key1" class="btn btn-primary">1번 키</button>
                                <button id="key2" class="btn btn-primary">2번 키</button>
                                <button id="key3" class="btn btn-primary">3번 키</button>
                                <button id="key4" class="btn btn-primary">4번 키</button>
                            </div>
                            <button id="saveButton" class="btn btn-success">
                                <i class="bi bi-floppy"></i>
                                <span>저장</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="tab-pane fade flex-grow-1" id="nav-noteLane" role="tabpanel"
                    aria-labelledby="nav-noteLane-tab">
                    <div class="col card">
                        <h5 class="card-header">판정</h5>
                        <div class="card-body">
                            <div class="mb-3 form-check form-switch">
                                <input type="checkbox" class="form-check-input" id="noteJudgmentCheck"
                                    checked>
                                <label class="form-check-label" for="noteJudgmentCheck">판정 표시</label>
                            </div>
                            <div class="mb-3 form-check form-switch">
                                <input type="checkbox" class="form-check-input" id="fastLate" checked>
                                <label class="form-check-label d-flex gap-2" for="fastLate">
                                    <span class="judgeFast">Fast</span>
                                    <span class="judgeLate">Late</span>
                                    <span>표시</span>
                                </label>
                            </div>
                            <div class="mb-3 form-check form-switch">
                                <input type="checkbox" class="form-check-input" id="fastLateMS" checked>
                                <label class="form-check-label d-flex gap-2" for="fastLateMS">
                                    <span class="judgeFast">+ 123ms</span>
                                    <span class="judgeLate">- 123ms</span>
                                    <span>밀리초 표시</span>
                                </label>
                            </div>
                            <div class="mb-3 form-check form-switch">
                                <input type="checkbox" class="form-check-input" id="enforceJudge">
                                <label class="form-check-label d-flex gap-2" for="enforceJudge">
                                    <span>판정 강화</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="col card">
                        <h5 class="card-header">레인</h5>
                        <div class="card-body">
                            <div class="form-check">
                                <div class="mb-3 form-check form-switch">
                                    <input type="checkbox" class="form-check-input" id="notehaptic"
                                        checked>
                                    <label class="form-check-label" for="notehaptic">노트를 누르면 </label>
                                </div>
                                <div class="input-group mb-3">
                                    <span class="input-group-text">반응 지속시간 (밀리 초)</span>
                                    <input type="number" class="form-control" id="notehapticLifeTime" value="100">
                                </div>
                            </div>
                            <div class="form-check">
                                <h6>위치 설정</h6>
                                <div class="mb-3 form-switch">
                                    <input class="form-check-input" type="checkbox" id="lanePosAuto"
                                        onchange="$('.laneSetup').toggleClass('d-none')" checked>
                                    <label class="form-check-label" for="lanePosAuto"></label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col card laneSetup d-none">
                        <h5 class="card-header">레인 위치 설정</h5>
                        <div class="card-body">
                            <h6>위치 조절 (0.1 ~ 1 사이 범위값)</h6>
                            <div class="mb-3 manual">
                                <label for="lanePosL1" class="form-label">1번레인</label>
                                <div class="range-wrap">
                                    <div class="range-value"></div>
                                    <input class="form-range" type="range" min="0.1" max="1" step="0.05"
                                        id="lanePosL1" value="0.35">
                                </div>
                                <label for="lanePosL2" class="form-label">2번레인</label>
                                <div class="range-wrap">
                                    <div class="range-value"></div>
                                    <input class="form-range" type="range" min="0.1" max="1" step="0.05"
                                        id="lanePosL2" value="0.1">
                                </div>
                                <label for="lanePosR1" class="form-label">3번레인</label>
                                <div class="range-wrap">
                                    <div class="range-value"></div>
                                    <input class="form-range" type="range" min="0.1" max="1" step="0.05"
                                        id="lanePosR1" value="0.1">
                                </div>
                                <label for="lanePosR2" class="form-label">4번레인</label>
                                <div class="range-wrap">
                                    <div class="range-value"></div>
                                    <input class="form-range" type="range" min="0.1" max="1" step="0.05"
                                        id="lanePosR2" value="0.35">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col card noteSetup">
                        <h5 class="card-header">노트</h5>
                        <div class="card-body">
                            <div class="mb-3">
                                <label for="noteBaseSpeed" class="form-label">노트 속도 배율</label>
                                <div class="range-wrap">
                                    <div class="range-value"></div>
                                    <input class="form-range" type="range" id="noteBaseSpeed" min="10" max="50" value="35">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        <div class="modal-footer d-flex flex-column">
            <div class="flex-grow-1">
                <nav>
                    <div class="nav nav-tabs justify-content-center" id="nav-tab" role="tablist">
                        <button class="nav-link active" id="nav-home-tab" data-bs-toggle="tab"
                            data-bs-target="#nav-home" type="button" role="tab" aria-controls="nav-home"
                            aria-selected="true">메인</button>
                        <button class="nav-link" id="nav-audio-tab" data-bs-toggle="tab"
                            data-bs-target="#nav-audio" type="button" role="tab" aria-controls="nav-audio"
                            aria-selected="true">오디오</button>
                        <button class="nav-link" id="nav-input-tab" data-bs-toggle="tab"
                            data-bs-target="#nav-input" type="button" role="tab" aria-controls="nav-input"
                            aria-selected="false">입력</button>
                        <button class="nav-link" id="nav-noteLane-tab" data-bs-toggle="tab"
                            data-bs-target="#nav-noteLane" type="button" role="tab" aria-controls="nav-noteLane"
                            aria-selected="false">노트 & 레인</button>

                    </div>
                </nav>
            </div>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
        </div>
    </div>
</div>
</section>`;