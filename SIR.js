const SIR = {
    mouseX: 0,
    mouseY: 0,
    offX: 0,
    dragging: false,
    horizontalScale: 0,
    SIR_Curve: {
        S_curve: [],
        I_curve: [],
        R_curve: [],
    },
    map(val) {
        return 300 - 300 * val;
    },
    mapTime(t) {
        return t * 800 / SIR.horizontalScale + SIR.offX;
    },
    demapTime(t) {
        return (t - SIR.offX) / 800 * SIR.horizontalScale / dt;
    },

    main: null,
    overlay: null,
    grid: null,
    labels: null,
    output: null,

    infectivity: 0,
    recovery: 0,
    start: 0,

    infectivity_input: null,
    recovery_input: null,
    start_input: null,
    scale_input: null,

    infectivity_display: null,
    recovery_display: null,
    start_display: null,
    scale_display: null,

    initialize() {
        SIR.main = document.getElementById("SIR-configurable");
        SIR.overlay = document.getElementById("SIR-configurable-overlay");
        SIR.grid = document.getElementById("SIR-configurable-grid");
        SIR.labels = document.getElementById("SIR-configurable-labels");
        SIR.output = document.getElementById("SIR-output");

        SIR.main.width = SIR.overlay.width = SIR.grid.width = SIR.labels.width = 800;
        SIR.main.height = SIR.overlay.height = SIR.grid.height = SIR.labels.height = 320;

        SIR.output.width = 800;
        SIR.output.height = 60;

        SIR.infectivity_input = document.getElementById("SIR-configurable-infectivity");
        SIR.recovery_input = document.getElementById("SIR-configurable-recovery");
        SIR.start_input = document.getElementById("SIR-configurable-start");
        SIR.scale_input = document.getElementById("SIR-configurable-time");

        SIR.infectivity_display = document.getElementById("SIR-configurable-infectivity-value-display");
        SIR.recovery_display = document.getElementById("SIR-configurable-recovery-value-display");
        SIR.start_display = document.getElementById("SIR-configurable-start-value-display");
        SIR.scale_display = document.getElementById("SIR-configurable-time-value-display");

        SIR.infectivity_input.oninput = () => {
            SIR.recalculateSIR();
            SIR.renderMain();
            SIR.infectivity_display.innerHTML = SIR.infectivity_input.value;
            SIR.renderOverlay();
        };

        SIR.recovery_input.oninput = () => {
            SIR.recalculateSIR();
            SIR.renderMain();
            SIR.recovery_display.innerHTML = SIR.recovery_input.value;
            SIR.renderOverlay();
        };

        SIR.start_input.oninput = () => {
            SIR.recalculateSIR();
            SIR.renderMain();
            SIR.start_display.innerHTML = SIR.start_input.value;
            SIR.renderOverlay();
        };

        SIR.scale_input.oninput = () => {
            SIR.renderMain();
            SIR.scale_display.innerHTML = SIR.scale_input.value;
            SIR.renderOverlay();
        };

        SIR.overlay.onwheel = (event) => {
            event.preventDefault();
            SIR.scale_input.value = Math.min(100, Math.max(.1, parseFloat(SIR.scale_input.value) + event.deltaY * 0.01));
            SIR.scale_display.innerHTML = SIR.scale_input.value;
            SIR.renderMain();
            SIR.renderGrid();
            SIR.renderOverlay();
        };

        SIR.overlay.onmousemove = SIR.mouseMoved;
        SIR.overlay.onmousedown = (event) => {
            SIR.dragging = true;
        };
        SIR.overlay.onmouseup = (event) => {
            SIR.dragging = false;
        };


        SIR.recalculateSIR();
        SIR.renderGrid();
        SIR.renderMain();
        SIR.renderOverlay();

        SIR.infectivity_display.innerHTML = SIR.infectivity_input.value;
        SIR.recovery_display.innerHTML = SIR.recovery_input.value;
        SIR.start_display.innerHTML = SIR.start_input.value;
        SIR.scale_display.innerHTML = SIR.scale_input.value;
    },

    mouseMoved(event) {
        if (SIR.dragging) {
            SIR.offX += event.offsetX - SIR.mouseX;
            SIR.offX = Math.min(0, Math.max(SIR.offX, -200));
            SIR.renderMain();
            SIR.renderGrid();
        }
        SIR.mouseX = event.offsetX;
        SIR.mouseY = event.offsetY;
        SIR.renderOverlay();
    },
    getVariables() {
        SIR.infectivity = parseFloat(SIR.infectivity_input.value);
        SIR.recovery = parseFloat(SIR.recovery_input.value);
        SIR.start = parseFloat(SIR.start_input.value);
        SIR.horizontalScale = parseFloat(SIR.scale_input.value);
    },

    recalculateSIR() {
        SIR.getVariables();

        var S_value = 1 - SIR.start;
        var I_value = SIR.start;
        var R_value = 0;


        SIR.SIR_Curve.S_curve = [];
        SIR.SIR_Curve.I_curve = [];
        SIR.SIR_Curve.R_curve = [];
        SIR.SIR_Curve.D_vals = [];

        var t = 0;
        while (t < 200) {
            S_value -= SIR.infectivity * I_value * S_value * dt;
            I_value += (SIR.infectivity * I_value * S_value - I_value * SIR.recovery) * dt;
            R_value += I_value * SIR.recovery * dt;

            SIR.SIR_Curve.S_curve.push(S_value);
            SIR.SIR_Curve.I_curve.push(I_value);
            SIR.SIR_Curve.R_curve.push(R_value);

            t += dt;
        }
    },
    renderMain() {
        const SIR_Context = SIR.main.getContext("2d");

        SIR_Context.clearRect(0, 0, 1000, 1000);
        SIR_Context.lineWidth = 2;

        SIR_Context.beginPath();
        SIR_Context.moveTo(0, SIR.map(SIR.SIR_Curve.S_curve[0]));
        SIR.SIR_Curve.S_curve.forEach((val, i) => {
            SIR_Context.lineTo(SIR.mapTime(i * dt), SIR.map(val));
        });
        SIR_Context.strokeStyle = "#5bff5e";
        SIR_Context.stroke();

        SIR_Context.beginPath();
        SIR_Context.moveTo(0, SIR.map(SIR.SIR_Curve.I_curve[0]));
        SIR.SIR_Curve.I_curve.forEach((val, i) => {
            SIR_Context.lineTo(SIR.mapTime(i * dt), SIR.map(val));
        });
        SIR_Context.strokeStyle = "#ff5b5b";
        SIR_Context.stroke();

        SIR_Context.beginPath();
        SIR_Context.moveTo(0, SIR.map(SIR.SIR_Curve.R_curve[0]));
        SIR.SIR_Curve.R_curve.forEach((val, i) => {
            SIR_Context.lineTo(SIR.mapTime(i * dt), SIR.map(val));
        });
        SIR_Context.strokeStyle = "#5b5bff";
        SIR_Context.stroke();
    },

    renderGrid() {
        var SIR_Grid_context = SIR.grid.getContext("2d");
        var SIR_Grid_label = SIR.labels.getContext("2d");


        SIR_Grid_context.clearRect(0, 0, 1000, 1000);
        SIR_Grid_label.clearRect(0, 0, 1000, 1000);
        SIR_Grid_context.lineWidth = 2;
        SIR_Grid_context.strokeStyle = "#AAAAAA";

        var offset = 1;
        if (SIR.horizontalScale > 10) {
            offset = 10;
        } else if (SIR.horizontalScale > 1) {
            offset = 1;
        } else if (SIR.horizontalScale > 0.1) {
            offset = 0.1;
        }

        for (var day = 0; day < SIR.horizontalScale; day += offset) {
            SIR_Grid_context.beginPath();
            SIR_Grid_context.moveTo(SIR.mapTime(day), 0);
            SIR_Grid_context.lineTo(SIR.mapTime(day), SIR.grid.height);
            SIR_Grid_context.stroke();

            SIR_Grid_label.fillText(day + " Day(s)", SIR.mapTime(day) + 4, 315);
        }
    },

    renderOverlay() {
        const SIR_Context = SIR.overlay.getContext("2d");



        const a = Math.min(SIR.SIR_Curve.I_curve.length, Math.max(0, Math.round(SIR.demapTime(SIR.mouseX))));

        SIR_Context.clearRect(0, 0, 1000, 1000);
        SIR_Context.beginPath();
        SIR_Context.moveTo(SIR.mouseX, SIR.overlay.height);
        SIR_Context.lineTo(SIR.mouseX, 0);
        SIR_Context.strokeStyle = "#666666";
        SIR_Context.stroke();

        SIR_Context.beginPath();
        SIR_Context.ellipse(SIR.mouseX, SIR.map(SIR.SIR_Curve.S_curve[a]), 5, 5, 0, 0, Math.PI * 2);
        SIR_Context.strokeStyle = "#42bd44";
        SIR_Context.stroke();

        SIR_Context.beginPath();
        SIR_Context.ellipse(SIR.mouseX, SIR.map(SIR.SIR_Curve.I_curve[a]), 5, 5, 0, 0, Math.PI * 2);
        SIR_Context.strokeStyle = "#d14b4b";
        SIR_Context.stroke();

        SIR_Context.beginPath();
        SIR_Context.ellipse(SIR.mouseX, SIR.map(SIR.SIR_Curve.R_curve[a]), 5, 5, 0, 0, Math.PI * 2);
        SIR_Context.strokeStyle = "#4d4ddb";
        SIR_Context.stroke();

        SIR.renderOutputDisplay(a);
    },

    renderOutputDisplay(a) {
        var SIR_Context = SIR.output.getContext("2d");
        SIR_Context.clearRect(0, 0, 1000, 1000);
        SIR_Context.font = '25px sans-serif';
        var height = SIR_Context.measureText("A").actualBoundingBoxAscent;
        SIR_Context.fillStyle = "#5bff5e";
        drawTextSquare(SIR_Context, " - " + (Math.round(SIR.SIR_Curve.S_curve[a] * 100)) + "%", 0, 30, height);
        SIR_Context.fillStyle = "#ff5b5b";
        drawTextSquare(SIR_Context, " - " + (Math.round(SIR.SIR_Curve.I_curve[a] * 100)) + "%", 180, 30, height);
        SIR_Context.fillStyle = "#5b5bff";
        drawTextSquare(SIR_Context, " - " + (Math.round(SIR.SIR_Curve.R_curve[a] * 100)) + "%", 360, 30, height);
        SIR_Context.font = '18px sans-serif';
        height = SIR_Context.measureText("A").actualBoundingBoxAscent;
        SIR_Context.fillStyle = "#5bff5e";
        drawTextSquare(SIR_Context, " - Susceptable", 0, 0, height);
        SIR_Context.fillStyle = "#ff5b5b";
        drawTextSquare(SIR_Context, " - Infected", 180, 0, height);
        SIR_Context.fillStyle = "#5b5bff";
        drawTextSquare(SIR_Context, " - Removed", 360, 0, height);
    }

};

function drawTextSquare(ctx, text, x, y, h) {
    ctx.fillRect(x, y, 24, 24);
    ctx.fillStyle = "#000000";
    ctx.fillText(text, x + 30, y + 12 + h / 2);
}