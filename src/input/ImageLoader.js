export class ImageLoader {
    constructor() { }
    imageList = {};
    #ImageParseError = class ImageParseError extends Error {
        constructor() {
            super("Cannot Parse Image from beatmap");
            this.name = "ImageParseError";
        }
    };
    async load(zip, chart) {
        let bgpath = chart.events.backgroundPath;
        //if no bg in beatmap.
        if (!Object.keys(zip.files).includes(bgpath)) return;
        //console.log(zip.files)
        let src = null;
        if (bgpath) {
            try {
                let p = bgpath.replace(/\\|\"/g, '').trim();
                let title = chart.metadata.titleUnicode;
                src = URL.createObjectURL(await zip.file(p).async('blob'));
                this.imageList[title + '' + p] = src;
            } catch (error) {
                throw new this.#ImageParseError();
            }
        }
    }
    getImage(chart) {
        let bgpath = chart.data.events.backgroundPath;
        // console.log(bgObj)
        if (bgpath) {
            let title = chart.data.metadata.titleUnicode;
            let p = bgpath.replace(/\\|\"/g, '').trim();
            // console.log(title+''+p,this),
            // console.log(this.imageList[title+''+p])
            return this.imageList[title + '' + p];
        }
        return '';
    }
}
