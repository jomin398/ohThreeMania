export default function setRangeTooltip() {
    const range = $(this);
    const rangeV = range.prev('.range-value'); // 현재 range input 바로 앞의 range-value를 선택

    const setValue = () => {
        const newValue = Number((range.val() - range.attr('min')) * 100 / (range.attr('max') - range.attr('min')));
        const newPosition = 10 - (newValue * 0.2);
        rangeV.html(`<span>${range.val()}</span>`);
        rangeV.css('left', `calc(${newValue}% + (${newPosition}px))`);
    };

    // DOM이 로드될 때와 range input 값이 변경될 때 setValue 함수 실행
    setValue();
    range.on('input', setValue);
};
