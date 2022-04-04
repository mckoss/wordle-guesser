// Render solution space as an SVG file for "manual" solves.

export { makeSVG };

let boxSize: number;
const BOX_MARGIN = 4;
const BOX_SPACING = 1.1;

const MARGIN = 2;

type CLUE = 'X' | '?' | '!';

const clueClasses = {
  'X': 'wrong',
  '?': 'has',
  '!': 'correct'
};

async function makeSVG(svg: HTMLElement) {
  measureBoxSize(svg);
  console.log(`Box size: ${boxSize}`);

  const top = MARGIN + boxSize / 2;
  let pos = MARGIN + boxSize / 2;

  const tree = await fetch('/data/decision-tree.json').then(r => r.json());
  console.log(tree);

  renderWord(svg, 'RAISE', 'X?!?X', pos, top);

  const link = downloadSVGLink(svg, 'wordle-solution.svg', 'Download SVG');
  document.body.appendChild(link);
}

function renderWord(svg: HTMLElement, word: string, clue: string, x: number, y:number) {
  let pos = x;
  for (let i = 0; i < word.length; i++) {
    addBoxLetter(svg, word[i], pos, y, clueClasses[clue[i] as CLUE]);
    pos += boxSize * BOX_SPACING;
  }
}

function addBoxLetter(svg: HTMLElement, letter: string, x: number, y: number, cls: string) {
  const t = svgElement('text') as SVGTextElement;
  t.textContent = letter;
  positionElement(t, x, y);
  svg.appendChild(t);
  addBoxBackground(svg, t, cls);
}

function measureBoxSize(svg: HTMLElement) {
  const t = svgElement('text') as SVGTextElement;
  t.textContent = 'W';
  svg.appendChild(t);
  const rc = t.getBBox();
  boxSize = Math.max(rc.width, rc.height) + BOX_MARGIN;
  svg.removeChild(t);
}

function addBoxBackground(svg: HTMLElement, t: SVGTextElement, cls: string) {
  const rc = t.getBBox();

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


