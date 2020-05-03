const CSIRD = {
    mouseX: 0,
    mouseY: 0,
    offX: 0,
    dragging: false,
    horizontalScale: 0,
    CSIRD_Curve: {
        S_curve: [],
        I_curve: [],
        R_curve: [],
        D_curve: [],
    },
    map(val) {
        return 300 - 300 * val;
    },
    mapTime(t) {
        return t * 800 / CSIRD.horizontalScale + CSIRD.offX;
    },
    demapTime(t) {
        return (t - CSIRD.offX) / 800 * CSIRD.horizontalScale / dt;
    },

    main: null,
    overlay: null,
    grid: null,
    labels: null,
    output: null,

    infectivity: 0,
    recovery: 0,
    start: 0,
    death: 0,
    max: 0,

    infectivity_input: null,
    recovery_input: null,
    start_input: null,
    scale_input: null,
    death_input: null,
    max_input: null,

    infectivity_display: null,
    recovery_display: null,
    start_display: null,
    scale_display: null,
    death_display: null,
    max_display: null,

    initialize() {
        CSIRD.main = document.getElementById("CSIRD-configurable");
        CSIRD.overlay = document.getElementById("CSIRD-configurable-overlay");
        CSIRD.grid = document.getElementById("CSIRD-configurable-grid");
        CSIRD.labels = document.getElementById("CSIRD-configurable-labels");
        CSIRD.output = document.getElementById("CSIRD-output");

        CSIRD.main.width = CSIRD.overlay.width = CSIRD.grid.width = CSIRD.labels.width = 800;
        CSIRD.main.height = CSIRD.overlay.height = CSIRD.grid.height = CSIRD.labels.height = 320;

        CSIRD.output.width = 800;
        CSIRD.output.height = 60;

        CSIRD.infectivity_input = document.getElementById("CSIRD-configurable-infectivity");
        CSIRD.recovery_input = document.getElementById("CSIRD-configurable-recovery");
        CSIRD.start_input = document.getElementById("CSIRD-configurable-start");
        CSIRD.scale_input = document.getElementById("CSIRD-configurable-time");
        CSIRD.death_input = document.getElementById("CSIRD-configurable-death");
        CSIRD.max_input = document.getElementById("CSIRD-configurable-max");

        CSIRD.infectivity_display = document.getElementById("CSIRD-configurable-infectivity-value-display");
        CSIRD.recovery_display = document.getElementById("CSIRD-configurable-recovery-value-display");
        CSIRD.start_display = document.getElementById("CSIRD-configurable-start-value-display");
        CSIRD.scale_display = document.getElementById("CSIRD-configurable-time-value-display");
        CSIRD.death_display = document.getElementById("CSIRD-configurable-death-value-display");
        CSIRD.max_display = document.getElementById("CSIRD-configurable-max-value-display");

        CSIRD.infectivity_input.oninput = () => {
            CSIRD.recalculateCSIRD();
            CSIRD.renderMain();
            CSIRD.infectivity_display.innerHTML = CSIRD.infectivity_input.value;
            CSIRD.renderOverlay();
        };

        CSIRD.recovery_input.oninput = () => {
            CSIRD.recalculateCSIRD();
            CSIRD.renderMain();
            CSIRD.recovery_display.innerHTML = CSIRD.recovery_input.value;
            CSIRD.renderOverlay();
        };

        CSIRD.start_input.oninput = () => {
            CSIRD.recalculateCSIRD();
            CSIRD.renderMain();
            CSIRD.start_display.innerHTML = CSIRD.start_input.value;
            CSIRD.renderOverlay();
        };

        CSIRD.scale_input.oninput = () => {
            CSIRD.renderMain();
            CSIRD.scale_display.innerHTML = CSIRD.scale_input.value;
            CSIRD.renderOverlay();
        };

        CSIRD.death_input.oninput = () => {
            CSIRD.recalculateCSIRD();
            CSIRD.renderMain();
            CSIRD.death_display.innerHTML = CSIRD.death_input.value;
            CSIRD.renderOverlay();
        };

        CSIRD.max_input.oninput = () => {
            CSIRD.recalculateCSIRD();
            CSIRD.renderMain();
            CSIRD.max_display.innerHTML = CSIRD.max_input.value;
            CSIRD.renderOverlay();
        };

        CSIRD.overlay.onwheel = (event) => {
            event.preventDefault();
            CSIRD.scale_input.value = Math.min(100, Math.max(.1, parseFloat(CSIRD.scale_input.value) + event.deltaY * 0.01));
            CSIRD.scale_display.innerHTML = CSIRD.scale_input.value;
            CSIRD.renderMain();
            CSIRD.renderGrid();
            CSIRD.renderOverlay();
        };

        CSIRD.overlay.onmousemove = CSIRD.mouseMoved;
        CSIRD.overlay.onmousedown = (event) => {
            CSIRD.dragging = true;
        };
        CSIRD.overlay.onmouseup = (event) => {
            CSIRD.dragging = false;
        };


        CSIRD.recalculateCSIRD();
        CSIRD.renderGrid();
        CSIRD.renderMain();
        CSIRD.renderOverlay();

        CSIRD.infectivity_display.innerHTML = CSIRD.infectivity_input.value;
        CSIRD.recovery_display.innerHTML = CSIRD.recovery_input.value;
        CSIRD.start_display.innerHTML = CSIRD.start_input.value;
        CSIRD.scale_display.innerHTML = CSIRD.scale_input.value;
        CSIRD.death_display.innerHTML = CSIRD.death_input.value;
        CSIRD.max_display.innerHTML = CSIRD.max_input.value;
    },

    mouseMoved(event) {
        if (CSIRD.dragging) {
            CSIRD.offX += event.offsetX - CSIRD.mouseX;
            CSIRD.offX = Math.min(0, Math.max(CSIRD.offX, -200));
            CSIRD.renderMain();
            CSIRD.renderGrid();
        }
        CSIRD.mouseX = event.offsetX;
        CSIRD.mouseY = event.offsetY;
        CSIRD.renderOverlay();
    },
    getVariables() {
        CSIRD.infectivity = parseFloat(CSIRD.infectivity_input.value);
        CSIRD.recovery = parseFloat(CSIRD.recovery_input.value);
        CSIRD.start = parseFloat(CSIRD.start_input.value);
        CSIRD.horizontalScale = parseFloat(CSIRD.scale_input.value);
        CSIRD.death = parseFloat(CSIRD.death_input.value);
        CSIRD.max = parseFloat(CSIRD.max_input.value);
    },

    recalculateCSIRD() {
        CSIRD.getVariables();

        var S_value = 1 - CSIRD.start;
        var I_value = CSIRD.start;
        var R_value = 0;
        var D_value = 0;


        CSIRD.CSIRD_Curve.S_curve = [];
        CSIRD.CSIRD_Curve.I_curve = [];
        CSIRD.CSIRD_Curve.R_curve = [];
        CSIRD.CSIRD_Curve.D_curve = [];

        var t = 0;
        while (t < 200) {
            S_value -= CSIRD.infectivity * I_value * S_value * dt;
            var a = 0;
            if (I_value < CSIRD.max) {
                a = I_value * CSIRD.recovery;
            } else {
                a = (CSIRD.max + (I_value - CSIRD.max) * 0.9) * CSIRD.recovery
            }
            const b = I_value * CSIRD.death;
            I_value += (CSIRD.infectivity * I_value * S_value - a - b) * dt;
            R_value += a * dt;
            D_value += b * dt;

            CSIRD.CSIRD_Curve.S_curve.push(S_value);
            CSIRD.CSIRD_Curve.I_curve.push(I_value);
            CSIRD.CSIRD_Curve.R_curve.push(R_value);
            CSIRD.CSIRD_Curve.D_curve.push(D_value);

            t += dt;
        }
    },
    renderMain() {
        const CSIRD_Context = CSIRD.main.getContext("2d");

        CSIRD_Context.clearRect(0, 0, 1000, 1000);
        CSIRD_Context.lineWidth = 2;

        CSIRD_Context.beginPath();
        CSIRD_Context.moveTo(0, CSIRD.map(CSIRD.CSIRD_Curve.S_curve[0]));
        CSIRD.CSIRD_Curve.S_curve.forEach((val, i) => {
            CSIRD_Context.lineTo(CSIRD.mapTime(i * dt), CSIRD.map(val));
        });
        CSIRD_Context.strokeStyle = "#5bff5e";
        CSIRD_Context.stroke();

        CSIRD_Context.beginPath();
        CSIRD_Context.moveTo(0, CSIRD.map(CSIRD.CSIRD_Curve.I_curve[0]));
        CSIRD.CSIRD_Curve.I_curve.forEach((val, i) => {
            CSIRD_Context.lineTo(CSIRD.mapTime(i * dt), CSIRD.map(val));
        });
        CSIRD_Context.strokeStyle = "#ff5b5b";
        CSIRD_Context.stroke();

        CSIRD_Context.beginPath();
        CSIRD_Context.moveTo(0, CSIRD.map(CSIRD.CSIRD_Curve.R_curve[0]));
        CSIRD.CSIRD_Curve.R_curve.forEach((val, i) => {
            CSIRD_Context.lineTo(CSIRD.mapTime(i * dt), CSIRD.map(val));
        });
        CSIRD_Context.strokeStyle = "#5b5bff";
        CSIRD_Context.stroke();

        CSIRD_Context.beginPath();
        CSIRD_Context.moveTo(0, CSIRD.map(CSIRD.CSIRD_Curve.D_curve[0]));
        CSIRD.CSIRD_Curve.D_curve.forEach((val, i) => {
            CSIRD_Context.lineTo(CSIRD.mapTime(i * dt), CSIRD.map(val));
        });
        CSIRD_Context.strokeStyle = "#b603fc";
        CSIRD_Context.stroke();
    },

    renderGrid() {
        var CSIRD_Grid_context = CSIRD.grid.getContext("2d");
        var CSIRD_Grid_label = CSIRD.labels.getContext("2d");


        CSIRD_Grid_context.clearRect(0, 0, 1000, 1000);
        CSIRD_Grid_label.clearRect(0, 0, 1000, 1000);
        CSIRD_Grid_context.lineWidth = 2;
        CSIRD_Grid_context.strokeStyle = "#AAAAAA";

        var offset = 1;
        if (CSIRD.horizontalScale > 10) {
            offset = 10;
        } else if (CSIRD.horizontalScale > 1) {
            offset = 1;
        } else if (CSIRD.horizontalScale > 0.1) {
            offset = 0.1;
        }

        for (var day = 0; day < CSIRD.horizontalScale; day += offset) {
            CSIRD_Grid_context.beginPath();
            CSIRD_Grid_context.moveTo(CSIRD.mapTime(day), 0);
            CSIRD_Grid_context.lineTo(CSIRD.mapTime(day), CSIRD.grid.height);
            CSIRD_Grid_context.stroke();

            CSIRD_Grid_label.fillText(day + " Day(s)", CSIRD.mapTime(day) + 4, 315);
        }
    },

    renderOverlay() {
        const CSIRD_Context = CSIRD.overlay.getContext("2d");



        const a = Math.min(CSIRD.CSIRD_Curve.I_curve.length, Math.max(0, Math.round(CSIRD.demapTime(CSIRD.mouseX))));

        CSIRD_Context.clearRect(0, 0, 1000, 1000);
        CSIRD_Context.beginPath();
        CSIRD_Context.moveTo(CSIRD.mouseX, CSIRD.overlay.height);
        CSIRD_Context.lineTo(CSIRD.mouseX, 0);
        CSIRD_Context.strokeStyle = "#666666";
        CSIRD_Context.stroke();

        CSIRD_Context.beginPath();
        CSIRD_Context.ellipse(CSIRD.mouseX, CSIRD.map(CSIRD.CSIRD_Curve.S_curve[a]), 5, 5, 0, 0, Math.PI * 2);
        CSIRD_Context.strokeStyle = "#42bd44";
        CSIRD_Context.stroke();

        CSIRD_Context.beginPath();
        CSIRD_Context.ellipse(CSIRD.mouseX, CSIRD.map(CSIRD.CSIRD_Curve.I_curve[a]), 5, 5, 0, 0, Math.PI * 2);
        CSIRD_Context.strokeStyle = "#d14b4b";
        CSIRD_Context.stroke();

        CSIRD_Context.beginPath();
        CSIRD_Context.ellipse(CSIRD.mouseX, CSIRD.map(CSIRD.CSIRD_Curve.R_curve[a]), 5, 5, 0, 0, Math.PI * 2);
        CSIRD_Context.strokeStyle = "#4d4ddb";
        CSIRD_Context.stroke();

        CSIRD_Context.beginPath();
        CSIRD_Context.ellipse(CSIRD.mouseX, CSIRD.map(CSIRD.CSIRD_Curve.D_curve[a]), 5, 5, 0, 0, Math.PI * 2);
        CSIRD_Context.strokeStyle = "#8800bd";
        CSIRD_Context.stroke();

        CSIRD.renderOutputDisplay(a);
    },

    renderOutputDisplay(a) {
        var CSIRD_Context = CSIRD.output.getContext("2d");
        CSIRD_Context.clearRect(0, 0, 1000, 1000);
        CSIRD_Context.font = '25px sans-serif';
        var height = CSIRD_Context.measureText("A").actualBoundingBoxAscent;
        CSIRD_Context.fillStyle = "#5bff5e";
        drawTextSquare(CSIRD_Context, " - " + (Math.round(CSIRD.CSIRD_Curve.S_curve[a] * 100)) + "%", 0, 30, height);
        CSIRD_Context.fillStyle = "#ff5b5b";
        drawTextSquare(CSIRD_Context, " - " + (Math.round(CSIRD.CSIRD_Curve.I_curve[a] * 100)) + "%", 180, 30, height);
        CSIRD_Context.fillStyle = "#5b5bff";
        drawTextSquare(CSIRD_Context, " - " + (Math.round(CSIRD.CSIRD_Curve.R_curve[a] * 100)) + "%", 360, 30, height);
        CSIRD_Context.fillStyle = "#b603fc";
        drawTextSquare(CSIRD_Context, " - " + (Math.round(CSIRD.CSIRD_Curve.D_curve[a] * 100)) + "%", 540, 30, height);
        CSIRD_Context.font = '18px sans-serif';
        height = CSIRD_Context.measureText("A").actualBoundingBoxAscent;
        CSIRD_Context.fillStyle = "#5bff5e";
        drawTextSquare(CSIRD_Context, " - Susceptable", 0, 0, height);
        CSIRD_Context.fillStyle = "#ff5b5b";
        drawTextSquare(CSIRD_Context, " - Infected", 180, 0, height);
        CSIRD_Context.fillStyle = "#5b5bff";
        drawTextSquare(CSIRD_Context, " - Recovered", 360, 0, height);
        CSIRD_Context.fillStyle = "#b603fc";
        drawTextSquare(CSIRD_Context, " - Dead", 540, 0, height);
    }

};