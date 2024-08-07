const pixelCanvas = document.querySelector("#canvas");
const pixelCanvasSize = 400;

function generateGrid() {

    // clear the grid first!!
    pixelCanvas.replaceChildren();

    let pixelCellAmount = document.querySelector("#cell-amount").value;

    // generate the grid using 2 flex directions
    // TODO consider using css classes for the styles
    for (let i = 0; i < pixelCellAmount; i++) {
        let canvasRow = document.createElement("div");
        canvasRow.style.display = "flex";
        canvasRow.style.flex = "auto";

        for (let j = 0; j < pixelCellAmount; j++) {
            let canvasItem = document.createElement("div");
            canvasItem.style.flex = "auto";
            canvasItem.style.border = "1px solid black";
            canvasRow.append(canvasItem);
        }

        pixelCanvas.append(canvasRow);
    }
}


// tester button
// TODO refactor to update the input dynamically
// consider using a slider
const btn = document.querySelector("#btn");
btn.onclick = () => generateGrid();