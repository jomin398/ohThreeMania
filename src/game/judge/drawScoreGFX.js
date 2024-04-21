export default class DrawScoreGFX {
    constructor(selector, options) {
        this.canvas = document.querySelector(selector);
        this.ctx = this.canvas.getContext("2d");
        this.data = options?.data || [];
        this.colors = options?.colors || ["green", "lightgreen", "yellow", "orange", "red"];
        this.paddingLeft = options?.paddingLeft || 15;
    }

    init(data) {
        const initCanvasHeight = parseInt(this.canvas.clientHeight === 0 ? getComputedStyle(this.canvas.parentElement).height : this.canvas.clientHeight);

        this.canvas.height = initCanvasHeight - 60;
        if (data) this.data = data;
        // 데이터 배열의 원소 값이 0이면 1로 지정
        this.data = this.data.map(value => value === 0 ? 1 : value);
    }

    drawGraph() {
        const graphWidth = this.data.length * 20; // 각 데이터 포인트의 너비
        this.canvas.width = graphWidth > this.canvas.clientWidth ? graphWidth : this.canvas.clientWidth;
        const maxValue = Math.max(...this.data);
        const minValue = Math.min(...this.data);
        const graphHeight = this.canvas.height - 20;
        const pointInterval = (this.canvas.width - this.paddingLeft) / this.data.length;

        for (let i = 0; i < this.data.length; i++) {
            this.drawPoint(i, pointInterval, graphHeight, minValue, maxValue);
        }

        for (let i = 0; i < this.data.length - 1; i++) {
            this.drawLine(i, pointInterval, graphHeight, minValue, maxValue);
        }
    }
    drawPoint(i, pointInterval, graphHeight, minValue, maxValue) {
        const x = i * pointInterval + this.paddingLeft;
        let y;
        if (maxValue === minValue) {
            // maxValue와 minValue가 같은 경우, y 좌표를 그래프 중앙으로 설정
            y = graphHeight / 2 + 10; // 10은 캔버스 상단 여백을 고려한 값
        } else {
            // 일반적인 경우의 y 좌표 계산
            y = ((this.data[i] - minValue) / (maxValue - minValue)) * graphHeight + 10;
        }
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
        this.ctx.fillStyle = this.colors[this.data[i] - 1];
        this.ctx.fill();
    }
    
    drawLine(i, pointInterval, graphHeight, minValue, maxValue) {
        const xStart = i * pointInterval + this.paddingLeft;
        let yStart, yEnd;
        if (maxValue === minValue) {
            // maxValue와 minValue가 같은 경우, 선을 그래프 중앙에 그립니다.
            yStart = yEnd = graphHeight / 2 + 10; // 10은 캔버스 상단 여백을 고려한 값
        } else {
            // 일반적인 경우의 y 좌표 계산
            yStart = ((this.data[i] - minValue) / (maxValue - minValue)) * graphHeight + 10;
            yEnd = ((this.data[i + 1] - minValue) / (maxValue - minValue)) * graphHeight + 10;
        }
        const xEnd = (i + 1) * pointInterval + this.paddingLeft;
    
        const delta = Math.abs((this.data[i + 1] - 1) - (this.data[i] - 1));
        const currentColor = this.colors[Math.max(0, this.data[i] - 1)]; // 인덱스가 음수가 되지 않도록 보정
        const nextColor = this.colors[Math.max(0, this.data[i + 1] - 1)] || this.colors[Math.max(0, this.data[i] - 1)]; // 인덱스가 음수가 되지 않도록 보정
    
        this.ctx.beginPath();
        this.ctx.moveTo(xStart, yStart);
    
        if (delta === 0) {
            this.ctx.strokeStyle = currentColor;
        } else {
            const gradient = this.ctx.createLinearGradient(xStart, yStart, xEnd, yEnd);
            gradient.addColorStop(0, currentColor);
            gradient.addColorStop(1, nextColor);
            this.ctx.strokeStyle = gradient;
        }
    
        this.ctx.lineWidth = 2;
        this.ctx.lineTo(xEnd, yEnd);
        this.ctx.stroke();
    }    
}
