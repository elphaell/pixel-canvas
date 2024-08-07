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
            canvasItem.classList.add("pixel-cell");
            canvasRow.append(canvasItem);
        }

        pixelCanvas.append(canvasRow);
    }
}

function solidColour() {
    let cellList = document.querySelectorAll(".pixel-cell");

    cellList.forEach((cell) => {
        cell.addEventListener("mouseenter", (e) => {

            // TODO make colour selectable
            cell.style.backgroundColor = "red";
        });
    });
}


// tester button
// TODO refactor to update the input dynamically
// consider using a slider
const btn = document.querySelector("#btn");
btn.onclick = () => {
    generateGrid();
    solidColour();
};