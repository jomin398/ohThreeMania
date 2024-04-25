import * as THREE from "three";
import SkinParser from "./parser/skin.js";
import skincss from "../input/skincss.min.js";
export default class Skin {
    noteScale = 0.23;
    noteHeight = 2;
    receptorOffset = 0.1; // vertical offset of hit receptors from edge of screen
    constructor() {
        this.noteGeometry = this.#createGeometry();
        this.holdBodyGeometry = this.#createGeometry(true);
        this.noteMaterials = null;
        this.holdBodyMaterial = null;
        this.holdCapMaterial = null;
        this.noteReceptorMaterial = null;
        this.noteReceptorActiveMaterial = null;
        this.laneSkinKey = 4;
        this.playSfx = false;
        this.isDebugMode = false;
    }
    #createGeometry(isHoldBody) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        geometry.translate(0, 1 / 2, 0);
        geometry.scale(this.noteScale, isHoldBody ? 1 : this.noteScale, 1)
        return geometry;
    }
    sfxs = {
        'normal': null,
        'whistle': null,
        'finish': null,
        'clap': null,
        'break': null,
    };
    playSound(note) {
        if (!this.playSfx) return;
        const sfxsToPlay = this.#getSfxs(note);
        sfxsToPlay.forEach(sfx => this.sfxs[sfx]?.play());
    }

    #getSfxs(note) {
        switch (note) {
            case -1:
                return ['break'];
            case 0:
                return ['normal'];
            case 1:
                return ['whistle'];
            case 2:
                return ['normal', 'whistle'];
            case 3:
                return ['finish'];
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            default:
                return [];
        }
    }
    basePath = "./data/skin/";
    #parser = null;
    get parser() {
        return this.#parser;
    }
    async init() {
        this.#parser = new SkinParser(this.basePath);
        await this.#parser.fromString();
        console.log(this.#parser)
        this.isDebugMode = Boolean(parseInt(this.#parser.General.DebugMode));
        //for coloring or voice.
        await skincss(this);
        return this.#parser;
    }
    async applyNoteSkin() {
        const Textures = await this.#parser.loadTextures(this.laneSkinKey);
        // this.noteMaterials = Textures.find(e => e.name === "NoteImage0").mesh;
        this.noteMaterials = [];
        const defaultNoteTexture = Textures.find(e => e.name === `NoteImage0`).mesh;
        for (let i = 0; i < this.laneSkinKey; i++) {
            const noteTexture = Textures.find(e => e.name === `NoteImage${i}`).mesh;
            if (noteTexture) {
                this.noteMaterials.push(noteTexture);
            } else {
                // 해당 index에 대한 Texture가 없을 경우 기본값 혹은 대체재를 push
                this.noteMaterials.push(defaultNoteTexture);
            }
        }
        this.holdBodyMaterial = Textures.find(e => e.name === "NoteHoldBody").mesh;
        this.holdCapMaterial = Textures.find(e => e.name === "NoteHoldCap").mesh;
        this.noteReceptorMaterial = Textures.find(e => e.name === "KeyImage0").mesh;
        this.noteReceptorActiveMaterial = Textures.find(e => e.name === "KeyImage0D").mesh;
        return this;
    }

    meshFrom(geometry, material, z = -1) {
        const mesh = new THREE.Mesh(geometry, material.clone());
        mesh.position.z = z;
        return mesh;
    }
    NoteZposEnum = {
        NOTE: -2,
        LONGCAP: -2,
        LONGMESH: -3,
        NOTERECEPTOR: -4
        // LONGMESH: -2,
        // NOTERECEPTOR: -2
    };
    getNoteMesh(idx) {
        return this.meshFrom(this.noteGeometry, this.noteMaterials[idx], this.NoteZposEnum.NOTE);
    }
    //get noteMesh() { return this.meshFrom(this.noteGeometry, this.noteMaterials, this.NoteZposEnum.NOTE); };
    get lnCapMesh() { return this.meshFrom(this.noteGeometry, this.holdCapMaterial, this.NoteZposEnum.LONGCAP); };
    get lnMesh() { return this.meshFrom(this.holdBodyGeometry, this.holdBodyMaterial, this.NoteZposEnum.LONGMESH); };
    get noteReceptorMesh() { return this.meshFrom(this.noteGeometry, this.noteReceptorMaterial, this.NoteZposEnum.NOTERECEPTOR); };
}