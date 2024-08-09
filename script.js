const hoverCanvas = document.querySelector("#canvas");
const hoverCanvasSize = 400;
const solidFillBtn = document.querySelector("#solid-fill-btn");
const darkenFillBtn = document.querySelector("#darken-fill-btn");
const blendFillBtn = document.querySelector("#blend-fill-btn");
const gridBtn = document.querySelector("#grid-btn");
const refreshBtn = document.querySelector("#refresh-btn");
const colourPicker = document.querySelector("#colour-picker");
const colourPickerBox = document.querySelector("#colour-picker-box");
const canvasSize = document.querySelector("#canvas-size");

let controller = new AbortController();
let lastPickedMode = "solidFill";
let currentPickedColour = colourPicker.value;
let blendColour = "";
let currentSize = canvasSize.value;

// pSBC - Shade Blend Convert - Version 4.1 - 01/7/2021
// https://github.com/PimpTrizkit/PJs/blob/master/pSBC.js

const pSBC=(p,c0,c1,l)=>{
	let r,g,b,P,f,t,h,m=Math.round,a=typeof(c1)=="string";
	if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
	h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=pSBC.pSBCr(c0),P=p<0,t=c1&&c1!="c"?pSBC.pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
	if(!f||!t)return null;
	if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
	else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
	a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
	if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
	else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
}

pSBC.pSBCr=(d)=>{
	const i=parseInt;
	let n=d.length,x={};
	if(n>9){
		const [r, g, b, a] = (d = d.split(','));
	        n = d.length;
		if(n<3||n>4)return null;
		x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
	}else{
		if(n==8||n==6||n<4)return null;
		if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
		d=i(d.slice(1),16);
		if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=Math.round((d&255)/0.255)/1000;
		else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
	}return x
};

// End pSBC code
// --------------

function generateGrid() {

    // clear the grid first!!
    hoverCanvas.replaceChildren();

    // generate the grid using 2 flex directions
    // TODO consider using css classes for the styles
    for (let i = 0; i < currentSize; i++) {
        let canvasRow = document.createElement("div");
        canvasRow.style.display = "flex";
        canvasRow.style.flex = "auto";

        for (let j = 0; j < currentSize; j++) {
            let canvasItem = document.createElement("div");
            canvasItem.style.flex = "auto";
            canvasItem.style.border = "1px solid black";
            canvasItem.style.backgroundColor = "rgb(255, 255, 255)";
            canvasItem.classList.add("pixel-cell");
            canvasRow.append(canvasItem);
        }

        hoverCanvas.append(canvasRow);
    }
}

function addPaintingModeListeners(paintingMode) {
    let cellList = document.querySelectorAll(".pixel-cell");
    if (paintingMode === "blendFill") {
        toggleBlendUI(1);
    } else {
        toggleBlendUI(0);
    }

    cellList.forEach((cell) => {

        // Refresh state
        let visitedTimes = 0;

        // Add event listeners for current painting mode
        switch (paintingMode) {
            case "solidFill":

                cell.addEventListener("mouseenter", () => {

                    cell.style.backgroundColor = currentPickedColour;
                }, {
                    signal: controller.signal
                });
                break;
        
            case "darkenFill":

                cell.addEventListener("mouseenter", () => {

                    if (visitedTimes < 10) { visitedTimes++ };
        
                    cell.style.backgroundColor = pSBC(-0.1 * visitedTimes, "rgb(255, 255, 255)", currentPickedColour);
                }, {
                    signal: controller.signal
                });
                break;
            
            case "blendFill":

                cell.addEventListener("mouseenter", () => {

                    cell.style.backgroundColor = pSBC(0.2 * visitedTimes, currentPickedColour, blendColour);

                    if (visitedTimes < 5) { visitedTimes++ };
                }, {
                    signal: controller.signal
                });
                break;
        }
        
    });
}

function toggleBlendUI(blendState) {
    let blendUIElements = document.querySelectorAll(".blend-ui");

    if (blendState === 0) {       
        blendUIElements.forEach((element) => {
            colourPickerBox.removeChild(element);
        });

    } else  if (blendState === 1 && blendUIElements.length === 0) {
        const toArrow = document.createElement("div");
        toArrow.classList.add("blend-ui");
        toArrow.textContent = "->";

        const blendColourPicker = document.createElement("input");
        blendColourPicker.type = "color";
        blendColourPicker.value = "#0000ff";
        blendColourPicker.classList.add("blend-ui");

        blendColourPicker.addEventListener("change", (e) => {
            blendColour = e.target.value;
        });

        blendColour = blendColourPicker.value;

        colourPickerBox.append(toArrow, blendColourPicker);     
    }
}

// Add listeners to buttons
// TODO Refactor to an array of painting modes
solidFillBtn.addEventListener("click", () => {
    // generateGrid();
    controller.abort();
    controller = new AbortController();
    addPaintingModeListeners("solidFill");
    lastPickedMode = "solidFill";
});

darkenFillBtn.addEventListener("click", () => {
    // generateGrid();
    controller.abort();
    controller = new AbortController();
    addPaintingModeListeners("darkenFill");
    lastPickedMode = "darkenFill";
});

blendFillBtn.addEventListener("click", () => {
    controller.abort();
    controller = new AbortController();
    addPaintingModeListeners("blendFill");
    lastPickedMode = "blendFill";
})

refreshBtn.addEventListener("click", () => {
    generateGrid();
    controller.abort();
    controller = new AbortController();
    addPaintingModeListeners(lastPickedMode);
});

colourPicker.addEventListener("change", (e) => {
    currentPickedColour = e.target.value;
});

canvasSize.addEventListener("input", (e) => {
    currentSize = e.target.value;
    generateGrid();
});

canvasSize.addEventListener("change", () => {
    controller.abort();
    controller = new AbortController();
    addPaintingModeListeners(lastPickedMode);
});

// tester button
// TODO refactor to update the input dynamically
// consider using a slider
const btn = document.querySelector("#btn");
btn.onclick = () => {
    generateGrid();
};