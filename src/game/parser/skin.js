import * as THREE from "three";
export default class SkinParser {
    constructor(basePath) {
        this.#basePath = basePath;
    }
    #basePath = null;
    get basePath() {
        return this.#basePath;
    }
    #headerList = ['General', 'Colours', 'Mania'];
    #parseLine(line) {
        const headerData = (line.match(/\[(\w+)\]/) || [])[1];
        const propertykv = line.match(/(\w+)[ ]*:[ ]*(.+)/) || [];
        return { headerData, propertykv };
    }

    #updateHeader(currHeader, headerData, currObject) {
        if (headerData && this.#headerList.includes(headerData)) {
            currHeader = headerData;
            if (currHeader === 'Mania') {
                if (!this[currHeader]) {
                    this[currHeader] = [];
                }
                currObject = {};
                this[currHeader].push(currObject);
            }
        }
        return { currHeader, currObject };
    }

    #updateProperty(currHeader, currObject, propertykv) {
        let header = currHeader === this.#headerList[2] ? currObject : this[currHeader];
        if (!header) {
            this[currHeader] = {};
            header = this[currHeader];
        }

        if (propertykv.length > 0) {
            header[propertykv[1]] = propertykv[2];
        }
    }

    async fromString() {
        const str = await (await fetch(this.#basePath + "seting.ini")).text();
        const lines = str.split(/\r?\n/g);

        let currHeader = null;
        let currObject = null;
        for (const line of lines) {
            const trimmedLine = line.trim();

            if (trimmedLine.length <= 0 || trimmedLine.startsWith("//") || trimmedLine.startsWith("#")) continue;

            const { headerData, propertykv } = this.#parseLine(trimmedLine);

            const updatedHeader = this.#updateHeader(currHeader, headerData, currObject);
            currHeader = updatedHeader.currHeader;
            currObject = updatedHeader.currObject;

            if (currHeader !== null) {
                this.#updateProperty(currHeader, currObject, propertykv);
            }
        }
    }
    async loadTextures(laneSkinKey) {
        const textureLoader = new THREE.TextureLoader();
        let Setting = this.Mania.find(e => e.Keys == laneSkinKey) ?? this.Mania[0];
        // const NoteImage0 = Setting.NoteImage0;
        // loadList에 파일 경로 대신 객체를 포함하도록 수정
        let loadList = [
            { path: Setting.KeyImage0, prop: 'KeyImage0' },
            { path: Setting.KeyImage0D, prop: 'KeyImage0D' },
            { path: Setting.NoteHoldBody, prop: 'NoteHoldBody' },
            { path: Setting.NoteHoldCap, prop: 'NoteHoldCap' }
        ];
        // 레인별 노트 이미지를 로딩하게 등록, 객체 배열에 속성명도 포함
        for (let i = 0; i < laneSkinKey; i++) {
            const propName = `NoteImage${i}`;
            const laneNoteImage = Setting[propName] || Setting.NoteImage0;
            loadList.push({ path: laneNoteImage, prop: propName });
        }

        const applyTextureSettings = (map) => {
            map.anisotropy = 8;
            map.minFilter = THREE.NearestFilter;
            map.magFilter = THREE.NearestFilter;
            return map;
        }
        return await Promise.all(loadList.map(item => new Promise((resolve) =>
            textureLoader.load(this.#basePath + item.path, texture => {
                const d = {
                    // 파일 경로 대신 속성명을 사용하여 이름 설정
                    name: item.prop,
                    mesh: new THREE.MeshBasicMaterial({
                        map: applyTextureSettings(texture),
                        transparent: true
                    })
                };
                resolve(d);
            })
        )))
    }
}
