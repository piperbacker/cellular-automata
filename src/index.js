import "./style.css"
import 'bootstrap/dist/css/bootstrap.min.css';

const buildForm = document.getElementById("build-form");
const canvas = document.getElementById("canvas");
//const ctx = canvas.getContext("2d");

const loading_msg = document.getElementById("loading-msg");

let numGens; // number of generations (rows)
let genSize; // size of each generation (columns)

let initMode; // T: only first cell in row has state=1, F: random
let eolMode;   // T: Toric mode, F: Mirror mode

const keys = ['111', '110', '101', '100', '011', '010', '001', '000'];  // to hold binary keys
const rule = new Map(); // to hold key/state pairs based on rule

let automata = [];  // array to store generation arrays

/* Purpose: Generate initial row of automaton cells based on initialization mode and rule */
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

/* Purpose: Recursive function to generate following generation of automaton cells 
    based on previous generation, line end mode, and rule */
function generateNextGen(currentGen, n) {
    let nextGen = [];   // store next generation of automaton cells
    let state = '0';
    let expr;
    let i = 0;

    // handle generations with only 1 cell
    if (currentGen.length === 1) {
        automata.push(['0']);
        return;
    }

    // handle first cell
    //Toric mode
    if (eolMode) expr = currentGen[genSize - 1] + currentGen[i] + currentGen[i + 1];
    // Mirror mode
    else expr = currentGen[i] + currentGen[i] + currentGen[i + 1];

    state = checkRule(expr);
    nextGen.push(state);

    // continue until last cell
    for (i = 1; i < genSize - 1; i++) {
        expr = currentGen[i - 1] + currentGen[i] + currentGen[i + 1];
        state = checkRule(expr);
        nextGen.push(state);
    }

    // handle last cell
    //Toric mode
    if (eolMode) expr = currentGen[i - 1] + currentGen[i] + currentGen[0];
    // Mirror mode
    else expr = currentGen[i - 1] + currentGen[i] + currentGen[i];

    state = checkRule(expr);
    nextGen.push(state);

    automata.push(nextGen);

    if (n > 0) generateNextGen(nextGen, (n = n - 1));
}

/* Purpose: Display the final automata results using the canvas */
function displayAutomata(automata) {
    let x = 0, y = 0, w = 0, h = 0;

    // set width and height of cells based on number of generations or generation size
    if (numGens >= genSize) {
        w = canvas.width / numGens;
        h = canvas.width / numGens;
    } else {
        w = canvas.width / genSize;
        h = canvas.width / genSize;
    }

    // calculate x,y starting points so that automata is centered on canvas
    x = ((canvas.width / 2) - ((w * genSize) / 2));
    y = ((canvas.height / 2) - ((h * numGens)) / 2);

    // draw rectangle for each cell in automata
    for (let i = 0; i < automata.length; i++) {
        let gen = automata[i];
        for (let j = 0; j < gen.length; j++) {
            if (gen[j] === '1') {
                // add outline for visibility for smaller automata
                if ((numGens < 100) && (genSize < 100)) {
                    ctx.strokeStyle = "white";
                    ctx.strokeRect(x, y, w, h);
                }

                ctx.fillStyle = "black";
                ctx.fillRect(x, y, w, h);

            } else {
                // add outline for visibility for smaller automata
                if ((numGens < 100) && (genSize < 100)) {
                    ctx.strokeStyle = "black";
                    ctx.strokeRect(x, y, w, h);
                }

                ctx.fillStyle = "white";
                ctx.fillRect(x, y, w, h);
            }
            // move down row
            x += w;
        }
        // move down column
        //x = 0;
        x = ((canvas.width / 2) - ((w * genSize) / 2));
        y += h;
    }
}

/* Purpose: Set map using rule binary value and keys array */
function setRule(ruleVal) {
    let rBin = dec2bin(ruleVal); // convert rule value to binary
    rBin = rBin.padStart(8, '0');    // pad binary with 0's
    let binArray = Array.from(String(rBin), String);  // convert to array

    // build rule map
    for (let i = 0; i < binArray.length; i++) {
        rule.set(keys[i], binArray[i]);
    }
}

/* Purpose: Given a 3 digit binary expression, set state based on rule */
function checkRule(exp) {
    let state = rule.get(exp);
    return state;
}

/* Purpose: Generate random integer within max range */
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

/* Purpose: Given a decimal value, convert it to a binary string */
function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}

/* Purpose: Clear the canvas */
function clearCanvas() {
    // clear canvas & reset scale
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

buildForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (canvas.getContext) {
        clearCanvas();

        // get form data
        const data = new FormData(buildForm);

        let ruleVal = data.get("num-rule");
        numGens = data.get("num-gens");
        genSize = data.get("gen-size");

        let val = data.get("init-mode");
        initMode = (val === "true") ? true : false;

        val = data.get("eol-mode");
        eolMode = (val === "true") ? true : false;

        setRule(ruleVal);
        generateInitGen(initMode);
        displayAutomata(automata, canvas, ctx);

        //setTimeout(displayAutomata(automata, canvas, ctx), 2000);

        // clear automata array
        automata = [];
    }
})


