export default class BSToastManager {
    constructor(selector = ".dynamicToastWrap") {
        this.dynamicToastWrap = $(selector); // 토스트 메시지를 담을 요소
        if (this.dynamicToastWrap.length == 0) {
            $(document.body).append(`<div class="dynamicToastWrap toast-container position-fixed bottom-0 end-0 p-3"></div>`);
            this.dynamicToastWrap = $(selector);
        }
        /** @type {String} Toast 상단에 표시하는 제목 */
        this.headerTitle = "알림";
        /** @type {Number} 최대 Toast 가 보이는 개수 */
        this.maxToastCount = 5;
        /** @type {Number} Toast 가 보이는 시간 */
        this.showTimeDur = 5000;
    }

    #getToastTemp(msg, headerAfterClass) {
        // 토스트 메시지의 ID는 더 이상 필요하지 않으므로 제거
        return `<div class="dynamicToast toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header ${headerAfterClass}">
                <strong class="me-auto">${this.headerTitle}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="닫기"></button>
            </div>
            <div class="toast-body">
                ${msg}
            </div>
        </div>`;
    }
    removeAll() {
        this.dynamicToastWrap.find(".dynamicToast").empty();
    }
    showToast(message, status = 1) {
        const statusClasses = {
            '-1': "bg-danger",
            '0': "bg-info",
            '1': "bg-success"
        };
        let toastHeaderClass = statusClasses[status] || console.error('알 수 없는 상태:', status);

        // 토스트 메시지 개수가 최대를 초과하면 가장 오래된 메시지를 제거
        if (this.dynamicToastWrap.find(".dynamicToast").length >= this.maxToastCount) {
            this.dynamicToastWrap.find(".dynamicToast:first").remove();
        }

        // Bootstrap toast 인스턴스 생성 및 표시
        this.dynamicToastWrap.append(this.#getToastTemp(message, toastHeaderClass));
        const toast = new bootstrap.Toast(this.dynamicToastWrap.find(".dynamicToast:last").get(0), {
            delay: this.showTimeDur // 토스트가 보이는 시간을 5초로 설정
        })
        toast.show();
    }
}
