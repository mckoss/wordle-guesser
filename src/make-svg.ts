// Render solution space as an SVG file for "manual" solves.

export { makeSVG };

let boxSize: number;
const BOX_MARGIN = 4;

function makeSVG(svg: HTMLElement) {
  const top = 20;
  let pos = 20;

  addBoxLetter(svg, 'A', pos, top, 'correct');
  pos += boxSize * 1.1;
  addBoxLetter(svg, 'B', pos, top, 'wrong');
  pos += boxSize * 1.1;
  addBoxLetter(svg, 'C', pos, top, 'has');
  const link = downloadSVGLink(svg, 'wordle-solution.svg', 'Download SVG');
  document.body.appendChild(link);
}

function addBoxLetter(svg: HTMLElement, letter: string, x: number, y: number, cls: string) {
  const t = svgElement('text') as SVGTextElement;
  t.textContent = letter;
  positionElement(t, x, y);
  svg.appendChild(t);
  addBoxBackground(svg, t, cls);
}

function addBoxBackground(svg: HTMLElement, t: SVGTextElement, cls: string) {
  const rc = t.getBBox();

  // Intialize box size from first measured letter.
  if (boxSize === undefined) {
    boxSize = Math.max(rc.width, rc.height) + BOX_MARGIN;
  }

  // Center box around letter.
  rc.x -= (boxSize - rc.width) / 2;
  rc.y -= (boxSize - rc.height) / 2;

  const r = svgElement('rect');
  positionElement(r, rc.x, rc.y);
  sizeElement(r, boxSize, boxSize);

  r.setAttribute("class", cls);
  svg.insertBefore(r, t);
  svg.insertBefore(newLine(), t);
}

function svgElement(t: string, cls?: string): SVGElement {
  const svgNS = 'http://www.w3.org/2000/svg';
  const e = document.createElementNS(svgNS, t);
  if (cls) {
    e.setAttribute('class', cls);
  }
  return e;
}

function positionElement(e: SVGElement, x: number, y: number) {
  e.setAttribute("x", x.toFixed(2));
  e.setAttribute("y", y.toFixed(2));
}

function sizeElement(e: SVGElement, w: number, h: number) {
  e.setAttribute("width", w.toFixed(2));
  e.setAttribute("height", h.toFixed(2));
}

function newLine(): Text {
  return document.createTextNode('\n');
}

function downloadSVGLink(svg: HTMLElement, filename: string, label: string): HTMLAnchorElement {
  const blob = new Blob([svg.outerHTML], {type: 'image/svg+xml'});
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.textContent = label;

  return link;
}


