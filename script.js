var SIR_Curve = {};

var mouseX = 0;
var mouseY = 0;

function configureSIR() {
    var SIR_Canvas_configurable = document.getElementById("SIR-configurable");
    var SIR_Canvas_configurable_overlay = document.getElementById("SIR-configurable-overlay");
    var SIR_Canvas_configurable_grid = document.getElementById("SIR-configurable-grid");
    var SIR_Canvas_configurable_label = document.getElementById("SIR-configurable-labels");
    SIR_Canvas_configurable.width = 800;
    SIR_Canvas_configurable.height = 320;
    SIR_Canvas_configurable_overlay.width = 800;
    SIR_Canvas_configurable_overlay.height = 320;
    SIR_Canvas_configurable_grid.width = 800;
    SIR_Canvas_configurable_grid.height = 320;
    SIR_Canvas_configurable_label.width = 800;
    SIR_Canvas_configurable_label.height = 320;

    document.getElementById("SIR-configurable-infectivity").oninput = () => {
        renderSIR_Editable();
        document.getElementById("SIR-configurable-infectivity-value-display").innerHTML = document.getElementById("SIR-configurable-infectivity").value
    };
    document.getElementById("SIR-configurable-recovery").oninput = () => {
        renderSIR_Editable();
        document.getElementById("SIR-configurable-recovery-value-display").innerHTML = document.getElementById("SIR-configurable-recovery").value
    };
    document.getElementById("SIR-configurable-start").oninput = () => {
        renderSIR_Editable();
        document.getElementById("SIR-configurable-start-value-display").innerHTML = document.getElementById("SIR-configurable-start").value
    };
    document.getElementById("SIR-configurable-time").oninput = () => {
        renderSIR_Editable();
        renderSIR_Grid();
        document.getElementById("SIR-configurable-time-value-display").innerHTML = document.getElementById("SIR-configurable-time").value
    };

    SIR_Canvas_configurable_overlay.onwheel = (event) => {
        console.log("fuck");

        //event.preventDefault();
        document.getElementById("SIR-configurable-time").value = Math.min(100, Math.max(.1, parseFloat(document.getElementById("SIR-configurable-time").value) + event.deltaY * 0.1));
        document.getElementById("SIR-configurable-time-value-display").innerHTML = document.getElementById("SIR-configurable-time").value
        renderSIR_Editable();
        renderSIR_Grid();
    };

    SIR_Canvas_configurable_overlay.onmousemove = mouseMoved;

    renderSIR_Grid();
    renderSIR_Editable();
    document.getElementById("SIR-configurable-infectivity-value-display").innerHTML = document.getElementById("SIR-configurable-infectivity").value
    document.getElementById("SIR-configurable-recovery-value-display").innerHTML = document.getElementById("SIR-configurable-recovery").value
    document.getElementById("SIR-configurable-time-value-display").innerHTML = document.getElementById("SIR-configurable-time").value
    document.getElementById("SIR-configurable-start-value-display").innerHTML = document.getElementById("SIR-configurable-start").value
}

const dt = 0.01;

function renderSIR_Editable() {
    const SIR_Canvas = document.getElementById("SIR-configurable");
    const SIR_Context = SIR_Canvas.getContext("2d");

    const infectivity = parseFloat(document.getElementById("SIR-configurable-infectivity").value);
    const recovery = parseFloat(document.getElementById("SIR-configurable-recovery").value);
    const start = parseFloat(document.getElementById("SIR-configurable-start").value);

    const horizontalScale = parseFloat(document.getElementById("SIR-configurable-time").value);

    var S_value = 1 - start;
    var I_value = start;
    var R_value = 0;


    SIR_Curve.S_curve = [];
    SIR_Curve.I_curve = [];
    SIR_Curve.R_curve = [];
    SIR_Curve.D_vals = [];

    var t = 0;
    while (t < 100) {
        S_value -= infectivity * I_value * S_value * dt;
        I_value += (infectivity * I_value * S_value - I_value * recovery) * dt;
        R_value += I_value * recovery * dt;

        SIR_Curve.S_curve.push(S_value);
        SIR_Curve.I_curve.push(I_value);
        SIR_Curve.R_curve.push(R_value);

        t += dt;
    }

    function map(val) {
        return 300 - 300 * val;
    }

    function mapTime(t) {
        return t * 800 / horizontalScale * dt;
    }

    SIR_Context.clearRect(0, 0, 1000, 1000);
    SIR_Context.lineWidth = 2;

    SIR_Context.beginPath();
    SIR_Context.moveTo(0, map(SIR_Curve.S_curve[0]));
    SIR_Curve.S_curve.forEach((val, i) => {
        SIR_Context.lineTo(mapTime(i), map(val));
    });
    SIR_Context.strokeStyle = "#5bff5e";
    SIR_Context.stroke();

    SIR_Context.beginPath();
    SIR_Context.moveTo(0, map(SIR_Curve.I_curve[0]));
    SIR_Curve.I_curve.forEach((val, i) => {
        SIR_Context.lineTo(mapTime(i), map(val));
    });
    SIR_Context.strokeStyle = "#ff5b5b";
    SIR_Context.stroke();

    SIR_Context.beginPath();
    SIR_Context.moveTo(0, map(SIR_Curve.R_curve[0]));
    SIR_Curve.R_curve.forEach((val, i) => {
        SIR_Context.lineTo(mapTime(i), map(val));
    });
    SIR_Context.strokeStyle = "#5b5bff";
    SIR_Context.stroke();
}

function renderSIR_Grid() {
    var SIR_Canvas_configurable_grid = document.getElementById("SIR-configurable-grid");
    var SIR_Grid_context = SIR_Canvas_configurable_grid.getContext("2d");
    var SIR_Canvas_configurable_label = document.getElementById("SIR-configurable-labels");
    var SIR_Grid_label = SIR_Canvas_configurable_grid.getContext("2d");
    const horizontalScale = parseFloat(document.getElementById("SIR-configurable-time").value);

    function mapTime(t) {
        return t * 800 / horizontalScale;
    }

    SIR_Grid_context.clearRect(0, 0, 1000, 1000);
    SIR_Grid_context.lineWidth = 2;
    SIR_Grid_context.strokeStyle = "#AAAAAA";

    var offset = 1;
    if (horizontalScale > 10) {
        offset = 10;
    } else if (horizontalScale > 1) {
        offset = 1;
    } else if (horizontalScale > 0.1) {
        offset = 0.1;
    }

    for (var day = 0; day < horizontalScale; day += offset) {
        SIR_Grid_context.beginPath();
        SIR_Grid_context.moveTo(mapTime(day), 0);
        SIR_Grid_context.lineTo(mapTime(day), SIR_Canvas_configurable_grid.height);
        SIR_Grid_context.stroke();

        SIR_Grid_label.fillText(day, mapTime(day), 320);
    }
}

function mouseMoved(event) {
    mouseX = event.offsetX;
    mouseY = event.offsetY;
    const SIR_Canvas = document.getElementById("SIR-configurable-overlay");
    const SIR_Context = SIR_Canvas.getContext("2d");

    const horizontalScale = parseFloat(document.getElementById("SIR-configurable-time").value);

    function demapTime(t) {
        return t / 800 * horizontalScale / dt;
    }

    function map(val) {
        return 300 - 300 * val;
    }

    const a = Math.min(SIR_Curve.I_curve.length, Math.max(0, Math.round(demapTime(mouseX))));

    SIR_Context.clearRect(0, 0, 1000, 1000);
    SIR_Context.beginPath();
    SIR_Context.moveTo(mouseX, SIR_Canvas.height);
    SIR_Context.lineTo(mouseX, 0);
    SIR_Context.stroke();
}