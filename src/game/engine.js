import * as THREE from "three";
import Stats from "../statsjs.js";
import PauseMenu from "./layouts/pauseMenu.js";
import selfCrash from "./selfCrash.js";
import { findDifficultyCol } from "../calculate/findDifficultyCol.js";
import EtternaJudgement from "./judge/etterna.js";
import { msToTime } from "../utils.js";
import { laneJudgeUpdate } from "./scBoard.js";
import gameAgent from "./agent.js";
window.THREE = THREE;

export class GameEngineError extends Error {
	/**
	 * @param {Error} original 
	 */
	constructor(original) {
		super(original.message);
		this.name = "GameEngineError";
	};
}

export class GameEngine {
	updateTime = -1;
	time = 0;
	/**
	 * @type {Number} audio offset
	 */
	audioLeadIn = 0;
	isRenderRunning = false;
	stats = null;
	animationFrameId = null; // requestAnimationFrame의 식별자를 저장할 속성 추가
	/**
	 * 
	 * @param {gameAgent} agent 
	 */
	constructor(agent) {
		//canvas, musicPlayer, render, keyInputMgr
		this.onSongTimeUpt = null;
		this.agent = agent;
		this.client = agent.client;
		this.render = agent.render.bind(agent);
		this.musicPlayer = agent.previewMusic;
		this.keyInputMgr = agent.keyInputMgr;
		this.musicPlayer.elm.one("ended", this.songFinished.bind(this));
		this.renderer = new THREE.WebGLRenderer({
			canvas: agent.canvas,
			alpha: true
		});
		this.bpm = 120;
		this.firstBeatTIme = 0;
		this.countdownSpeed = 0;
		this.countdownOffset = 0;
		this.pauseMenu = new PauseMenu(this);
		this.selfCrash = new selfCrash();
		this.selfCrash.enabled = !agent.userConfigs.autoPlay && agent.userConfigs.giveUP && agent.userConfigs.selfCrash;
		this.selfCrash.keyboardMgr = this.keyInputMgr;
		this.selfCrash.showMenu = () => this.pauseMenu.popup();
		this.keyInputMgr.addKeyListener("pauseMenu", (e) => {
			if (e.key != "Escape") return;
			if (e.key == "Escape" && e.type === "keydown") {
				console.log(this);
				this.pauseMenu.popup();
			}
		});
		this.renderer.setClearColor(0x000000, 0);
		this.clock = new THREE.Clock();
		this.scene = new THREE.Scene();
		//const aspectRatio = window.innerWidth / window.innerHeight;
		this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
		// this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
		// GameAgent.engine.camera.position.y=-1;
		// GameAgent.engine.camera.position.z=1;
		// GameAgent.engine.camera.rotation.x = THREE.MathUtils.DEG2RAD *30
		// const camHelper = new THREE.CameraHelper(this.camera);
		// this.scene.add(camHelper);
		// audio.on("play", () => requestAnimationFrame(this.#update.bind(this)));
	}
	songFinished() {
		this.quit();
		this.result();
	}
	init() {
		this.#startEngine();
	}
	resume(sec) {
		for (let index = 0; index < this.agent.field.lanes.length; index++)laneJudgeUpdate(null, index, null);
		this.selfCrash.hide();
		console.log("resume", new Date(), sec);
		if (sec) this.musicPlayer.seek(sec * 1000);
		this.isRenderRunning = true;
		this.clock.start();
		this.animationFrameId = requestAnimationFrame(this.#update.bind(this));
		this.musicPlayer.play();
	}
	quit() {
		this.#renderStop();
		this.musicPlayer.pause();
		$(".songDiffListWrap footer button#lastScore").prop('disabled', false);
	}
	#renderStop() {
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId); // 애니메이션 중단
			this.animationFrameId = null; // 식별자 초기화
		}
		this.isRenderRunning = false;
	}
	#handleResize(renderer, camera) {
		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		if (canvas.width !== width || canvas.height !== height) {
			renderer.setSize(width, height, false);
			const aspect = width / height;
			camera.left = -aspect;
			camera.right = aspect;
			camera.updateProjectionMatrix();
		}
	}
	#startCountdown(opt) {
		let { bpm, firstBeatTime, countdownSpeed, countdownOffset = 0, onCountDown, onFinish } = opt;
		return new Promise(resolve => {
			if (countdownSpeed === 0) {
				console.log("No countdown, start immediately.");
				resolve(); // 즉시 resolve
				return;
			}
			let absBpmMs = 60000 / bpm;
			let msPerBeat = absBpmMs; // BPM을 기반으로 박자당 시간 계산

			switch (countdownSpeed) {
				case 1: // 일반 속도: 변화 없음
					break;
				case 2: // 반 속도: 박자당 시간 두 배로
					msPerBeat *= 2;
					break;
				case 3: // 더블 속도: 박자당 시간 반으로
					msPerBeat /= 2;
					break;
				default:
					console.warn("Invalid countdown speed");
					resolve(); // 유효하지 않은 countdownSpeed에 대해 reject
					return;
			}

			// 카운트다운 시작 시간 조정
			const countdownStartDelay = firstBeatTime - ((5 * msPerBeat) + (msPerBeat * countdownOffset));
			if (countdownStartDelay < 0) {
				console.warn("Not enough time for countdown.");
				resolve(); // 충분한 시간이 없을 때 reject
				return;
			}
			setTimeout(() => {
				let countdownNumber = 3; // 카운트다운 숫자 시작값

				const countdownInterval = setInterval(() => {
					if (countdownNumber > 0 && onCountDown) onCountDown(countdownNumber);
					//console.log(countdownNumber); // 현재 카운트다운 숫자 출력
					countdownNumber--;

					if (countdownNumber < 0) {
						clearInterval(countdownInterval);
						if (onFinish) onFinish();
						//console.log("Start!"); // 게임 시작
						resolve(); // 카운트다운 완료 시 resolve
					}
				}, msPerBeat);
			}, countdownStartDelay);
		});
	}

	async #startEngine() {
		const isMobile = navigator.userAgentData.mobile;
		if (isMobile) this.client.fScreenMgr.set().catch(() => { this.client.toastMgr.showToast("전체화면 요청을 실패하였습니다.", -1) });
		if ($(".renderCont .skip.d-none").length != 1)
			$(".renderCont .skip").addClass('d-none');

		const stats = new Stats(isMobile ? null : {
			canvas: {
				cssText: 'width:160px;height:96px;font-size:14px;cursor:move;',
			}
		});
		stats.showPanel(0);
		stats.dom.classList.add("statJS");
		document.querySelector(".statJS").replaceWith(stats.dom);
		if (this.agent.userConfigs.fps) $(".statJS").addClass("active");

		this.stats = stats;

		this.resume();
		// this.isRenderRunning = true;
		// this.musicPlayer.play();
		// requestAnimationFrame(this.#update.bind(this));

		const { bpm, firstBeatTime, countdownSpeed, countdownOffset } = this;

		//카운트 다운 UI, 보이스 재생추가

		this.#startCountdown({
			bpm,
			firstBeatTime,
			countdownSpeed,
			countdownOffset,
			//카운팅 콜백 (카운트 다운 UI update)
			onCountDown: v => console.log('countDown', v),
			//카운트 끝 콜백. (UI 숨기기)
			onFinish: () => {
				console.log('start');
			}
		});
		$(".pauseModal .btn#retry").removeAttr("disabled");
		$(".pauseModal .btn#continue").removeAttr("disabled");
	}
	get chartDur() {
		let dur = -1;
		let { startTime, endTime } = this.agent.chart.hitObjects.slice(-1)[0];
		dur = (new EtternaJudgement().missTiming + (startTime ?? endTime));
		return dur;
	}
	get audioDur() {
		return this.musicPlayer.audioElm.duration;
	}
	result() {
		console.warn('popupResult');
		this.musicPlayer.pause();
		this.agent.result.update(this);
		this.keyInputMgr.removeKeyListener("gotoSetting");
		this.keyInputMgr.removeKeyListener("pauseMenu");
		this.agent.result.show();
	}
	goToResult() {
		this.#renderStop();
		if ($(".renderCont .skip.d-none").length != 1)
			$(".renderCont .skip").addClass('d-none');
		//console.warn('pressed Skip');
		this.musicPlayer.audioElm.currentTime = this.audioDur;
	}
	showSkip() {
		$(".renderCont .skip").removeClass('d-none').one('click', () => this.goToResult());
	}
	#update() {
		if (!this.isRenderRunning) return;
		this.stats?.begin();
		this.#handleResize(this.renderer, this.camera);
		const nowTime = this.clock.getElapsedTime() * 1000; // getElapsedTime()는 초 단위로 반환하므로 밀리초로 변환
		if (!this.musicPlayer.audioElm.paused) {
			if (this.updateTime > 0) this.time += nowTime - this.updateTime;
			const nowPlayTime = this.musicPlayer.audioElm.currentTime;
			const nowPlayTimeMs = nowPlayTime * 1000;
			const playbackTimeWithOffset = nowPlayTimeMs + this.audioLeadIn;
			const error = this.time - playbackTimeWithOffset;
			if (Math.abs(error) > 10) {
				this.time = playbackTimeWithOffset;
			}
			this.onSongTimeUpt((nowPlayTime / this.audioDur) * 100);

			// 현재 오디오 재생 시간이 audioLeadIn 오프셋을 고려하여 대기 중인지 확인
			if (nowPlayTimeMs < Math.abs(this.audioLeadIn)) {
				// audioLeadIn이 음수이면 오디오 시작 전 대기, 양수이면 시작 후 대기
				if (this.audioLeadIn < 0) {
					console.log("오디오 시작 전 대기 중...");
				} else {
					console.log("오디오 시작 후 대기 중...");
				}
			}
		}
		this.updateTime = nowTime;
		this.render.call(this, this.time);
		this.renderer.renderLists.dispose();
		this.renderer.render(this.scene, this.camera);
		this.stats?.end();
		this.animationFrameId = requestAnimationFrame(this.#update.bind(this));
	}
}