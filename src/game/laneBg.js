import { Lane } from "./lane.js";
import * as THREE from "three";

export default class LaneBgManager {
    /**
     * @param {Lane} lane 
     */
    constructor(lane) {
        this.lane = lane;
        this.skin = lane.skin;
        this.pMesh = null;
        this.checkStartTime = 0;
        this.width = 0.23;
        this.height = 0.5;
        this.pos = {
            x: 0, y: -9, z: -5
        }
    }
    init() {
        const g = new THREE.PlaneGeometry(1, 1);
        g.translate(0, 1 / 2, 0);
        g.scale(this.width, this.height, 1);
        //const material = new THREE.MeshBasicMaterial();
        const m = new THREE.MeshBasicMaterial({
            color: 0xffffff, // 기본 색상을 지정할 수 있습니다. 투명도를 변경하더라도 이 색은 유지됩니다.
            transparent: true, // 투명도 조정을 가능하게 합니다.
            opacity: 0 // 완전히 투명하게 설정합니다.
        });
        this.pMesh = new THREE.Mesh(g, m);
        this.pMesh.position.y = this.pos.y;
        this.pMesh.position.z = this.pos.z;
        this.pMesh.name = "laneBg";
        this.lane.laneGroup.add(this.pMesh);
        this.lane.checkAndRemove = null; // 초기에는 체크 함수가 없음을 나타냄
        return this;
    }
    /**
    * colorA 에서 colorB 로 변화하는 그라데이션을 적용하는 함수
    * @param {string} colorA hex color code. 
    * @param {string} colorB hex color code.
    * @param {number} direction 그라데이션의 방향
    */
    add(color1, color2, direction = 0) {
        // 캔버스를 생성하여 그라데이션을 그립니다.
        var canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        var context = canvas.getContext('2d');

        // direction 값에 따라 그라데이션 방향을 결정합니다.
        let grad;
        switch (direction) {
            case 0: // 왼쪽에서 오른쪽
                grad = context.createLinearGradient(0, 0, 256, 0);
                break;
            case 1: // 오른쪽에서 왼쪽
                grad = context.createLinearGradient(256, 0, 0, 0);
                break;
            case 2: // 아래에서 위
                grad = context.createLinearGradient(0, 256, 0, 0);
                break;
            case 3: // 위에서 아래
                grad = context.createLinearGradient(0, 0, 0, 256);
                break;
        }

        // 그라데이션에 색상을 추가합니다.
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);

        // 그라데이션을 캔버스에 적용합니다.
        context.fillStyle = grad;
        context.fillRect(0, 0, 256, 256);

        // 텍스처를 생성하고, 이를 평면 오브젝트의 재질에 적용합니다.
        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        this.pMesh.material.map = texture;
        this.pMesh.material.transparent = false;
        this.pMesh.material.opacity = 1;
        this.pMesh.material.needsUpdate = true;
        return this.pMesh;
    }
    /**
     * 그라데이션 제거
     */
    resetTexture() {
        // 텍스쳐 맵을 null로 설정하여 제거
        this.pMesh.material.map = null;
        // 투명하게 설정
        this.pMesh.material.transparent = true;
        this.pMesh.material.opacity = 0;
        // 필요한 경우 재질 업데이트
        this.pMesh.material.needsUpdate = true;
    }
    remove() {
        //agent 가 비어있거나 엔진이 준비되지 않으면 바로 중단
        if (!this.lane.agent || !this.lane.agent.engine || !this.lane.reqRemoveGradient) return;
        this.checkStartTime = this.lane.agent.engine.clock.getElapsedTime(); // 시작 시간 기록
        this.lane.checkAndRemove = () => { // 조건 체크 및 그라데이션 제거 로직
            if (!this.lane.agent || !this.lane.agent.engine) return;
            const currentTime = this.lane.agent.engine.clock.getElapsedTime(); // 현재 시간 업데이트
            if (currentTime - this.checkStartTime >= 0.3) { // 0.3초가 지났는지 확인
                this.resetTexture(); // 조건 충족 시, 그라데이션 제거 실행
                this.checkStartTime = 0; // 시작 시간 초기화
                this.lane.checkAndRemove = null; // 체크 함수 초기화
                this.lane.reqRemoveGradient = false;
            }
        };
    }
}