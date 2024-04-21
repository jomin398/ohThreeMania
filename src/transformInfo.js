export const transFormData = {
    s: {
        "プロジェクトセカイ": "プロセカ",
        "Hololive": "Hololive",
        "ホロライブ": "Hololive",
        "WACCA": "WACCA",
        "SOUND VOLTEX": "SOUND VOLTEX",
        "maimai": "maimai",
        "ノラと皇女と野良猫ハート": "ノラハート",
        "ウマ娘": "ウマ娘",
        "アイドルマスター": "アイマス",
        "ブルーアーカイブ": "ブルアカ"
    },
    t: {
        "初音ミク": "初音ミク",
        "Hatsune Miku": "初音ミク"
    }
}

export function transformSourceName(source) {
    // 's' 객체의 키를 순회하며 source 문자열에 포함되어 있는지 확인
    for (const key in transFormData.s) {
        if (source.includes(key)) {
            // 포함되어 있다면 해당 키에 매핑된 값을 반환
            return transFormData.s[key];
        }
    }
    // 어떤 키에도 해당하지 않는 경우 원본 source 반환
    return source;
}


export function transformTag(tag) {
    for (const key in transFormData.t) {
        if (tag.includes(key)) {
            // 포함되어 있다면 해당 키에 매핑된 값을 반환
            return transFormData.t[key];
        }
    }
    // 어떤 키에도 해당하지 않는 경우 원본 source 반환
    return tag;
}