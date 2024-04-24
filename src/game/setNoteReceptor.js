import * as THREE from "three";

export function setNoteReceptor(noteReceptorObj, laneIndex) {
    switch (laneIndex) {
        case 0:
            noteReceptorObj.position.x = -0.12;
            noteReceptorObj.position.y = -0.78;
            noteReceptorObj.rotation.z = THREE.MathUtils.DEG2RAD * 270;
            break;
        case 2:
            noteReceptorObj.position.x = 0;
            noteReceptorObj.position.y = -0.66;
            noteReceptorObj.rotation.z = THREE.MathUtils.DEG2RAD * 180;
            break;
        case 3:
            noteReceptorObj.position.x = 0.12;
            noteReceptorObj.position.y = -0.78;
            noteReceptorObj.rotation.z = THREE.MathUtils.DEG2RAD * 90;
            break;
        default:
        case 1:
            // 아래 방향으로는 추가 회전 필요 없음
            break;
    };
}
