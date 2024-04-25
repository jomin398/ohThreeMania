import { padNumber } from "../utils.js";


export default class SearchEngine {
    constructor() {
        this.selectDefaultSong = null;
        this.searchBox = null;
    }
    #tab = null;
    #originSongContent = null;
    #songItems = null;
    #placeHolderStr = null;
    #filterItems() {
        this.restore();
        // 사용자 입력을 기반으로 필터링합니다.
        const input = this.searchBox.val().toLowerCase();
        if (input == "") return;
        console.log("clicked", input);
        // 모든 carousel-item 요소를 숨깁니다.
        this.#songItems.each((_, item) => $(item).removeClass("active"));
        const matchedSongItemIDs = [];
        $('.songDiffList .carousel-item').find(".song-src").each((_, item) => {
            const arr = Array.from($(item).closest('.carousel-item').find(".song-src"))
                .map(e => $(e).text().toLowerCase());
            const containsInput = arr.some(element => element.includes(input.toLowerCase()));

            if (containsInput) {
                matchedSongItemIDs.push(item.id);
            } else {
                $(item).closest('.carousel-item').remove();
            }
        });
        this.#initCountHeader();
        $($('.songDiffList .carousel-item').get(0)).addClass("active");
        this.#resetInput("검색결과를 리셋하려면 초기화를 클릭 -- >>");
        this.selectDefaultSong();

    }
    #initCountHeader() {
        $("#totalSongNumber").text(padNumber($('.songDiffList .carousel-item').length, 3));
        $("#currentSongNumber").text(padNumber(1, 3));
    }
    #resetInput(msg) {
        this.searchBox.val('');
        this.searchBox.attr('placeholder', msg ?? this.#placeHolderStr);
    }
    restore() {
        $('.songDiffList .carousel-inner').html(this.#originSongContent);
        this.#initCountHeader();
        $($('.songDiffList .carousel-item').get(0)).addClass("active");
        this.selectDefaultSong();
    }
    onSongSelect() {
        $('.songDiffList .carousel-inner').html(this.#originSongContent);
        this.#initCountHeader();
        $($('.songDiffList .carousel-item').get(0)).addClass("active");
    }
    init() {
        this.#tab = $(".songSelectWrap .searchTab");
        this.searchBox = this.#tab.find("input");
        this.#songItems = $('.songDiffList .carousel-item');
        this.#originSongContent = $('.songDiffList .carousel-inner').html();
        this.#placeHolderStr = this.searchBox.attr('placeholder');
        this.#tab.on('click', '#searchBtn', ev => this.#filterItems.call(this, ev));
        this.#tab.on('click', '#searchResetBtn', () => {
            this.restore.call(this);
            this.#resetInput();
        });

    }
}
