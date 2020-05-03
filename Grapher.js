class Grapher {
    /**
     * 
     * @param {HTMLElement} element 
     * @param {Number} width 
     * @param {Number} height 
     * @param {any} curve 
     */
    constructor(element, width, height, curve) {
        self.element = element;
        self.width = width;
        self.height = height;
        self.curve = curve;
        self.ctx = element.getContext("2d");

        element.width = width;
        element.height = height;
    }

    render() {
        self.ctx.clearRect(0, 0, 1000, 1000);
        curve.render(self.ctx);
    }
}