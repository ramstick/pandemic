const SIRD = {
    mouseX: 0,
    mouseY: 0,
    offX: 0,
    dragging: false,
    horizontalScale: 0,
    SIRD_Curve: {
        S_curve: [],
        I_curve: [],
        R_curve: [],
        D_curve: [],
    },
    map(val) {
        return 300 - 300 * val;
    },
    mapTime(t) {
        return t * 800 / SIRD.horizontalScale + SIRD.offX;
    },
    demapTime(t) {
        return (t - SIRD.offX) / 800 * SIRD.horizontalScale / dt;
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

    infectivity_input: null,
    recovery_input: null,
    start_input: null,
    scale_input: null,
    death_input: null,

    infectivity_display: null,
    recovery_display: null,
    start_display: null,
    scale_display: null,
    death_display: null,

    initialize() {
        SIRD.main = document.getElementById("SIRD-configurable");
        SIRD.overlay = document.getElementById("SIRD-configurable-overlay");
        SIRD.grid = document.getElementById("SIRD-configurable-grid");
        SIRD.labels = document.getElementById("SIRD-configurable-labels");
        SIRD.output = document.getElementById("SIRD-output");

        SIRD.main.width = SIRD.overlay.width = SIRD.grid.width = SIRD.labels.width = 800;
        SIRD.main.height = SIRD.overlay.height = SIRD.grid.height = SIRD.labels.height = 320;

        SIRD.output.width = 800;
        SIRD.output.height = 60;

        SIRD.infectivity_input = document.getElementById("SIRD-configurable-infectivity");
        SIRD.recovery_input = document.getElementById("SIRD-configurable-recovery");
        SIRD.start_input = document.getElementById("SIRD-configurable-start");
        SIRD.scale_input = document.getElementById("SIRD-configurable-time");
        SIRD.death_input = document.getElementById("SIRD-configurable-death");

        SIRD.infectivity_display = document.getElementById("SIRD-configurable-infectivity-value-display");
        SIRD.recovery_display = document.getElementById("SIRD-configurable-recovery-value-display");
        SIRD.start_display = document.getElementById("SIRD-configurable-start-value-display");
        SIRD.scale_display = document.getElementById("SIRD-configurable-time-value-display");
        SIRD.death_display = document.getElementById("SIRD-configurable-death-value-display");

        SIRD.infectivity_input.oninput = () => {
            SIRD.recalculateSIRD();
            SIRD.renderMain();
            SIRD.infectivity_display.innerHTML = SIRD.infectivity_input.value;
            SIRD.renderOverlay();
        };

        SIRD.recovery_input.oninput = () => {
            SIRD.recalculateSIRD();
            SIRD.renderMain();
            SIRD.recovery_display.innerHTML = SIRD.recovery_input.value;
            SIRD.renderOverlay();
        };

        SIRD.start_input.oninput = () => {
            SIRD.recalculateSIRD();
            SIRD.renderMain();
            SIRD.start_display.innerHTML = SIRD.start_input.value;
            SIRD.renderOverlay();
        };

        SIRD.scale_input.oninput = () => {
            SIRD.renderMain();
            SIRD.scale_display.innerHTML = SIRD.scale_input.value;
            SIRD.renderOverlay();
        };

        SIRD.death_input.oninput = () => {
            SIRD.recalculateSIRD();
            SIRD.renderMain();
            SIRD.death_display.innerHTML = SIRD.death_input.value;
            SIRD.renderOverlay();
        };

        SIRD.overlay.onwheel = (event) => {
            event.preventDefault();
            SIRD.scale_input.value = Math.min(100, Math.max(.1, parseFloat(SIRD.scale_input.value) + event.deltaY * 0.01));
            SIRD.scale_display.innerHTML = SIRD.scale_input.value;
            SIRD.renderMain();
            SIRD.renderGrid();
            SIRD.renderOverlay();
        };

        SIRD.overlay.onmousemove = SIRD.mouseMoved;
        SIRD.overlay.onmousedown = (event) => {
            SIRD.dragging = true;
        };
        SIRD.overlay.onmouseup = (event) => {
            SIRD.dragging = false;
        };


        SIRD.recalculateSIRD();
        SIRD.renderGrid();
        SIRD.renderMain();
        SIRD.renderOverlay();

        SIRD.infectivity_display.innerHTML = SIRD.infectivity_input.value;
        SIRD.recovery_display.innerHTML = SIRD.recovery_input.value;
        SIRD.start_display.innerHTML = SIRD.start_input.value;
        SIRD.scale_display.innerHTML = SIRD.scale_input.value;
        SIRD.death_display.innerHTML = SIRD.death_input.value;
    },

    mouseMoved(event) {
        if (SIRD.dragging) {
            SIRD.offX += event.offsetX - SIRD.mouseX;
            SIRD.offX = Math.min(0, Math.max(SIRD.offX, -200));
            SIRD.renderMain();
            SIRD.renderGrid();
        }
        SIRD.mouseX = event.offsetX;
        SIRD.mouseY = event.offsetY;
        SIRD.renderOverlay();
    },
    getVariables() {
        SIRD.infectivity = parseFloat(SIRD.infectivity_input.value);
        SIRD.recovery = parseFloat(SIRD.recovery_input.value);
        SIRD.start = parseFloat(SIRD.start_input.value);
        SIRD.horizontalScale = parseFloat(SIRD.scale_input.value);
        SIRD.death = parseFloat(SIRD.death_input.value);
    },

    recalculateSIRD() {
        SIRD.getVariables();

        var S_value = 1 - SIRD.start;
        var I_value = SIRD.start;
        var R_value = 0;
        var D_value = 0;


        SIRD.SIRD_Curve.S_curve = [];
        SIRD.SIRD_Curve.I_curve = [];
        SIRD.SIRD_Curve.R_curve = [];
        SIRD.SIRD_Curve.D_curve = [];

        var t = 0;
        while (t < 200) {
            S_value -= SIRD.infectivity * I_value * S_value * dt;
            I_value += (SIRD.infectivity * I_value * S_value - I_value * SIRD.recovery - I_value * SIRD.death) * dt;
            R_value += I_value * SIRD.recovery * dt;
            D_value += I_value * SIRD.death * dt;

            SIRD.SIRD_Curve.S_curve.push(S_value);
            SIRD.SIRD_Curve.I_curve.push(I_value);
            SIRD.SIRD_Curve.R_curve.push(R_value);
            SIRD.SIRD_Curve.D_curve.push(D_value);

            t += dt;
        }
    },
    renderMain() {
        const SIRD_Context = SIRD.main.getContext("2d");

        SIRD_Context.clearRect(0, 0, 1000, 1000);
        SIRD_Context.lineWidth = 2;

        SIRD_Context.beginPath();
        SIRD_Context.moveTo(0, SIRD.map(SIRD.SIRD_Curve.S_curve[0]));
        SIRD.SIRD_Curve.S_curve.forEach((val, i) => {
            SIRD_Context.lineTo(SIRD.mapTime(i * dt), SIRD.map(val));
        });
        SIRD_Context.strokeStyle = "#5bff5e";
        SIRD_Context.stroke();

        SIRD_Context.beginPath();
        SIRD_Context.moveTo(0, SIRD.map(SIRD.SIRD_Curve.I_curve[0]));
        SIRD.SIRD_Curve.I_curve.forEach((val, i) => {
            SIRD_Context.lineTo(SIRD.mapTime(i * dt), SIRD.map(val));
        });
        SIRD_Context.strokeStyle = "#ff5b5b";
        SIRD_Context.stroke();

        SIRD_Context.beginPath();
        SIRD_Context.moveTo(0, SIRD.map(SIRD.SIRD_Curve.R_curve[0]));
        SIRD.SIRD_Curve.R_curve.forEach((val, i) => {
            SIRD_Context.lineTo(SIRD.mapTime(i * dt), SIRD.map(val));
        });
        SIRD_Context.strokeStyle = "#5b5bff";
        SIRD_Context.stroke();

        SIRD_Context.beginPath();
        SIRD_Context.moveTo(0, SIRD.map(SIRD.SIRD_Curve.D_curve[0]));
        SIRD.SIRD_Curve.D_curve.forEach((val, i) => {
            SIRD_Context.lineTo(SIRD.mapTime(i * dt), SIRD.map(val));
        });
        SIRD_Context.strokeStyle = "#b603fc";
        SIRD_Context.stroke();
    },

    renderGrid() {
        var SIRD_Grid_context = SIRD.grid.getContext("2d");
        var SIRD_Grid_label = SIRD.labels.getContext("2d");


        SIRD_Grid_context.clearRect(0, 0, 1000, 1000);
        SIRD_Grid_label.clearRect(0, 0, 1000, 1000);
        SIRD_Grid_context.lineWidth = 2;
        SIRD_Grid_context.strokeStyle = "#AAAAAA";

        var offset = 1;
        if (SIRD.horizontalScale > 10) {
            offset = 10;
        } else if (SIRD.horizontalScale > 1) {
            offset = 1;
        } else if (SIRD.horizontalScale > 0.1) {
            offset = 0.1;
        }

        for (var day = 0; day < SIRD.horizontalScale; day += offset) {
            SIRD_Grid_context.beginPath();
            SIRD_Grid_context.moveTo(SIRD.mapTime(day), 0);
            SIRD_Grid_context.lineTo(SIRD.mapTime(day), SIRD.grid.height);
            SIRD_Grid_context.stroke();

            SIRD_Grid_label.fillText(day + " Day(s)", SIRD.mapTime(day) + 4, 315);
        }
    },

    renderOverlay() {
        const SIRD_Context = SIRD.overlay.getContext("2d");



        const a = Math.min(SIRD.SIRD_Curve.I_curve.length, Math.max(0, Math.round(SIRD.demapTime(SIRD.mouseX))));

        SIRD_Context.clearRect(0, 0, 1000, 1000);
        SIRD_Context.beginPath();
        SIRD_Context.moveTo(SIRD.mouseX, SIRD.overlay.height);
        SIRD_Context.lineTo(SIRD.mouseX, 0);
        SIRD_Context.strokeStyle = "#666666";
        SIRD_Context.stroke();

        SIRD_Context.beginPath();
        SIRD_Context.ellipse(SIRD.mouseX, SIRD.map(SIRD.SIRD_Curve.S_curve[a]), 5, 5, 0, 0, Math.PI * 2);
        SIRD_Context.strokeStyle = "#42bd44";
        SIRD_Context.stroke();

        SIRD_Context.beginPath();
        SIRD_Context.ellipse(SIRD.mouseX, SIRD.map(SIRD.SIRD_Curve.I_curve[a]), 5, 5, 0, 0, Math.PI * 2);
        SIRD_Context.strokeStyle = "#d14b4b";
        SIRD_Context.stroke();

        SIRD_Context.beginPath();
        SIRD_Context.ellipse(SIRD.mouseX, SIRD.map(SIRD.SIRD_Curve.R_curve[a]), 5, 5, 0, 0, Math.PI * 2);
        SIRD_Context.strokeStyle = "#4d4ddb";
        SIRD_Context.stroke();

        SIRD_Context.beginPath();
        SIRD_Context.ellipse(SIRD.mouseX, SIRD.map(SIRD.SIRD_Curve.D_curve[a]), 5, 5, 0, 0, Math.PI * 2);
        SIRD_Context.strokeStyle = "#8800bd";
        SIRD_Context.stroke();

        SIRD.renderOutputDisplay(a);
    },

    renderOutputDisplay(a) {
        var SIRD_Context = SIRD.output.getContext("2d");
        SIRD_Context.clearRect(0, 0, 1000, 1000);
        SIRD_Context.font = '25px sans-serif';
        var height = SIRD_Context.measureText("A").actualBoundingBoxAscent;
        SIRD_Context.fillStyle = "#5bff5e";
        drawTextSquare(SIRD_Context, " - " + (Math.round(SIRD.SIRD_Curve.S_curve[a] * 100)) + "%", 0, 30, height);
        SIRD_Context.fillStyle = "#ff5b5b";
        drawTextSquare(SIRD_Context, " - " + (Math.round(SIRD.SIRD_Curve.I_curve[a] * 100)) + "%", 180, 30, height);
        SIRD_Context.fillStyle = "#5b5bff";
        drawTextSquare(SIRD_Context, " - " + (Math.round(SIRD.SIRD_Curve.R_curve[a] * 100)) + "%", 360, 30, height);
        SIRD_Context.fillStyle = "#b603fc";
        drawTextSquare(SIRD_Context, " - " + (Math.round(SIRD.SIRD_Curve.D_curve[a] * 100)) + "%", 540, 30, height);
        SIRD_Context.font = '18px sans-serif';
        height = SIRD_Context.measureText("A").actualBoundingBoxAscent;
        SIRD_Context.fillStyle = "#5bff5e";
        drawTextSquare(SIRD_Context, " - Susceptable", 0, 0, height);
        SIRD_Context.fillStyle = "#ff5b5b";
        drawTextSquare(SIRD_Context, " - Infected", 180, 0, height);
        SIRD_Context.fillStyle = "#5b5bff";
        drawTextSquare(SIRD_Context, " - Recovered", 360, 0, height);
        SIRD_Context.fillStyle = "#b603fc";
        drawTextSquare(SIRD_Context, " - Dead", 540, 0, height);
    }

};