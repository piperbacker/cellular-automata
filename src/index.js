import "./style.css"

const buildForm = document.getElementById("build-form");
const b_canvas = document.getElementById("build-canvas");
const b_ctx = b_canvas.getContext("2d");

const visualForm = document.getElementById("visualizer-form");
const v_canvas = document.getElementById("visual-canvas");
const v_ctx = v_canvas.getContext("2d");

let isEmpty = true; // check if b_canvas is empty
b_ctx.save(); // save empty state

let numGens; // the number of generations (rows)
let genSize; // the size of each generation (columns)

let initMode; // T: only first cell in row has state=1, F: random
let eolMode;   // T: Toric mode, F: Mirror mode

let automata = [];  // array to store generation arrays

let val;    // to store value to visualize automata

function generateInitGen(initMode) {
    let initGen = [];

    if (initMode) {
        initGen.push('1');
        for (let i = 1; i < genSize; i++) {
            initGen.push('0');
        }
    } else {
        for (let i = 0; i < genSize; i++) {
            let val = getRandomInt(2);    // get random value btw 0-1
            initGen.push(val.toString());
        }
    }

    automata.push(initGen);
    generateNextGen(initGen, (numGens - 2));
}

function generateNextGen(currentGen, n) {
    let nextGen = [];
    let state = '0';
    let expr;
    let i = 0;

    // handle generations with only 1 cell
    if (currentGen.length === 1) {
        return '0';
    }

    // handle first cell
    //Toric mode
    if (eolMode) expr = currentGen[genSize - 1] + currentGen[i] + currentGen[i + 1];
    // Mirror mode
    else expr = currentGen[i] + currentGen[i] + currentGen[i + 1];

    state = rule110(expr);
    nextGen.push(state);

    // continue until last cell
    for (i = 1; i < genSize - 1; i++) {
        expr = currentGen[i - 1] + currentGen[i] + currentGen[i + 1];
        state = rule110(expr);
        nextGen.push(state);
    }

    // handle last cell
    //Toric mode
    if (eolMode) expr = currentGen[i - 1] + currentGen[i] + currentGen[0];
    // Mirror mode
    else expr = currentGen[i - 1] + currentGen[i] + currentGen[i];

    state = rule110(expr);
    nextGen.push(state);

    automata.push(nextGen);

    if (n > 0) generateNextGen(nextGen, (n = n - 1));
    //else displayAutomata(automata)
}

function displayAutomata(automata, ctx) {
    let x = 0;
    let y = 0;

    // clear canvas
    /*if (!isEmpty) {
        ctx.restore() // restore empty state
        ctx.save(); // save empty state
        //ctx.clearRect(0, 0, b_canvas.width, b_canvas.height);
        isEmpty = true;
    }*/

    for (let i = 0; i < automata.length; i++) {
        let gen = automata[i];
        for (let j = 0; j < gen.length; j++) {
            if (gen[j] === '1') {
                ctx.fillStyle = "black";
                ctx.strokeStyle = "black";
                //b_ctx.scale((1000 / b_canvas.width), (1000 / b_canvas.height))
                ctx.strokeRect(x, y, 10, 10);
                ctx.fillRect(x, y, 10, 10);

            } else {
                ctx.fillStyle = "white";
                ctx.strokeStyle = "black";
                ctx.strokeRect(x, y, 10, 10);
                ctx.fillRect(x, y, 10, 10);
            }
            // move down row
            x += 12;
        }
        // move down column
        x = 0;
        y += 12;
    }

    isEmpty = false;
}

function rule110(expr) {
    switch (expr) {
        case '001':
            return '1';
        case '010':
            return '1';
        case '011':
            return '1';
        case '100':
            return '0';
        case '101':
            return '1';
        case '110':
            return '1';
        case '111':
            return '0';
        default:
            return '0';
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}

buildForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // get form data
    const data = new FormData(buildForm);

    numGens = data.get("num-gens");
    genSize = data.get("gen-size");

    // set b_canvas size based on user input
    //b_canvas.height = (numGens*2);
    //b_canvas.width = (genSize*2);

    let val = data.get("init-mode");
    initMode = (val === "true") ? true : false;

    val = data.get("eol-mode");
    eolMode = (val === "true") ? true : false;

    generateInitGen(initMode);
    displayAutomata(automata, b_ctx);
    //console.log(isEmpty);
})

visualForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // get form data
    const data = new FormData(visualForm);

    val = data.get("num-visual");

    let binary = dec2bin(val);
    console.log(binary);
    numGens = 1;
    genSize = binary.length;

    //eolMode = true //toric mode
    eolMode = false //mirror mode

    generateNextGen(binary, 0);
    displayAutomata(automata, v_ctx);
    //visualizeAutomaton(automata);

    console.log(automata);
});
