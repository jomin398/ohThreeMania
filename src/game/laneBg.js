import { Lane } from "./lane.js";
import * as THREE from "three";
// 상수 정의
const CANVAS_SIZE = 256;
const PLANE_SIZE = 1;
const DEFAULT_WIDTH = 0.23;
const DEFAULT_HEIGHT = 0.5;
const DEFAULT_DISPLAY_TIME_MS = 150;
const INITIAL_POSITION = {
    x: 0,
    y: -0.9,
    z: -5
};
export default class LaneBgManager {
    /**
     * Lane의 배경을 관리
     * @param {Lane} lane 
     */
    constructor(lane) {
        this.lane = lane;
        this.skin = lane.skin;
        this.pMesh = null;
        this.checkStartTime = 0;
        this.width = DEFAULT_WIDTH;
        this.height = DEFAULT_HEIGHT;
        this.displayTime = DEFAULT_DISPLAY_TIME_MS;
        this.reqRemoveGradient = false;
        this.pos = INITIAL_POSITION;
    }
    /**
     * 초기화 함수
     */
    init() {
        const geometry = this.#createPlaneGeometry();
        const material = this.#createBasicMaterial();
        this.pMesh = this.#createMesh(geometry, material);
        this.lane.laneGroup.add(this.pMesh);
        this.lane.checkAndRemove = null;
        return this;
    }
    /**
     * 평면의 기하학을 생성하는 함수
     * @returns {THREE.PlaneGeometry}
     */
    #createPlaneGeometry() {
        const geometry = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE);
        geometry.translate(0, PLANE_SIZE / 2, 0);
        geometry.scale(this.width, this.height, PLANE_SIZE);
        return geometry;
    }
    /**
     * 기본 재질을 생성하는 함수 
     * @returns {THREE.MeshBasicMaterial}
     */
    #createBasicMaterial() {
        return new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0
        });
    }
    // 메쉬를 생성하고 추가하는 함수
    /**
     * 
     * @param {THREE.BufferGeometry} geometry 
     * @param {THREE.MeshBasicMaterial} material
     * @returns {THREE.Mesh}
     */
    #createMesh(geometry, material) {
        const m = new THREE.Mesh(geometry, material);
        m.position.set(this.pos.x, this.pos.y, this.pos.z);
        m.name = "laneBg";
        return m;
    }
    /**
     * 그라데이션 텍스처를 추가하는 함수
     * @param {string} color1 시작 색상 (hex code)
     * @param {string} color2 종료 색상 (hex code)
     * @param {number} direction 그라데이션 방향
     */
    add(color1, color2, direction = 0) {
        const texture = this.#createTexture(this.#createGradientCanvas(color1, color2, direction));
        this.#applyTexture(this.pMesh, texture);
        return this.pMesh;
    }
    /**
     * 그라데이션 방향에 따라 그라데이션 객체를 생성하는 함수
     * @param {CanvasRenderingContext2D} context 
     * @param {number} direction 
     * @param {string} color1 
     * @param {string} color2 
     * @returns {CanvasGradient}
     */
    #createGradient(context, direction, color1, color2) {
        let grad;
        switch (direction) {
            case 0:
                grad = context.createLinearGradient(0, 0, CANVAS_SIZE, 0);
                break;
            case 1:
                grad = context.createLinearGradient(CANVAS_SIZE, 0, 0, 0);
                break;
            case 2:
                grad = context.createLinearGradient(0, CANVAS_SIZE, 0, 0);
                break;
            case 3:
                grad = context.createLinearGradient(0, 0, 0, CANVAS_SIZE);
                break;
            default:
                throw new Error(`Invalid direction: ${direction}`);
        }
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);
        return grad;
    }
    /**
     * 그라데이션 방향에 따른 택스쳐가 그려진 캔버스를 생성하는 함수
     * @param {string} color1 
     * @param {string} color2
     * @param {number} direction 
     * @returns {HTMLCanvasElement}
     */
    #createGradientCanvas(color1, color2, direction) {
        const canvas = document.createElement('canvas');
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;
        const context = canvas.getContext('2d');
        const grad = this.#createGradient(context, direction, color1, color2);
        context.fillStyle = grad;
        context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        return canvas;
    }
    /**
     * 주어진 켐버스를 텍스처로 변환하는 함수
     * @param {HTMLCanvasElement} canvas 
     * @returns {THREE.Texture}
     */
    #createTexture(canvas) {
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }
    /**
     * 텍스처를 메쉬에 적용하는 함수
     * @param {THREE.Mesh} mesh 
     * @param {THREE.Texture} texture
     * @returns {THREE.Mesh}
     */
    #applyTexture(mesh, texture) {
        mesh.material.map = texture;
        mesh.material.transparent = false;
        mesh.material.opacity = 1;
        mesh.material.needsUpdate = true;
        return mesh;
    }
    /**
     * 그라데이션을 제거하는 함수
     * @param {THREE.Mesh} mesh 
     */
    #resetGradient(mesh) {
        mesh.material.map = null;
        mesh.material.transparent = true;
        mesh.material.opacity = 0;
        mesh.material.needsUpdate = true;
    }
    // 현재 시간을 반환하는 게터
    get clockTime() {
        return this.lane.agent?.engine?.clock.getElapsedTime() ?? 0;
    }
    /** 그라데이션을 업데이트하는 함수 */
    update() {
        if (!this.lane.agent || !this.lane.agent.engine || !this.reqRemoveGradient) return;
        const currentTime = this.clockTime;
        if (currentTime - this.checkStartTime >= this.displayTime / 1000) {
            this.#resetGradient(this.pMesh);
            this.checkStartTime = 0;
            this.reqRemoveGradient = false;
        }
    }
    /** 그라데이션 제거를 요청하는 함수 */
    requestRemoval() {
        if (!this.lane.agent || !this.lane.agent.engine || this.reqRemoveGradient) return;
        this.reqRemoveGradient = true;
        this.checkStartTime = this.clockTime;
    }
}