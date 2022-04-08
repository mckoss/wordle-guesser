// Render solution space as an SVG file for "manual" solves.

import { Outliner } from './outliner.js';

export { makeSVG };

let boxSize: number;
let boxSpacing: number;
const BOX_MARGIN = 2;
const SPACING_RATIO = 1.1;

const MARGIN = 10;

type CLUE = 'X' | '?' | '!';

const clueClasses = {
  'X': 'wrong',
  '?': 'has',
  '!': 'correct'
};

type TableRow = [string[], string];

async function makeSVG(svgTemplate: HTMLElement, svgs: HTMLElement) {
  let svg: HTMLElement;

  svg = newPage(svgTemplate);

  measureBoxSize(svg);

  let page = 1;
  let line = 0;
  let column = 0;

  const lineMax = Math.floor((750 - 2 * MARGIN - boxSize) / boxSpacing);
  const columnSize = 9 * boxSpacing;
  console.log(`Column size: ${columnSize}`);
  const columnMax = Math.floor((1000 - MARGIN) / columnSize);

  console.log(`Max lines: ${lineMax}, Num columns: ${columnMax}`);

  const table = await fetch('/data/decision-table.json').then(r => r.json()) as TableRow[];

  const outline = new Outliner();

  for (const row of table) {
    if (line >= lineMax) {
      column++;
      line = 0;
    }
    if (column >= columnMax) {
      closePage(svg, page);
      page++;
      column = 0;
      svg = newPage(svgTemplate);
    }

    let level = outline.level(row[0]);
    if (level % 2 === 1) {
      level--;
    }
    if (line === 0) {
      level = 0;
    }
    for (let i = level; i < row[0].length; i += 2) {
      const word = row[0][i];
      const clue = row[0][i + 1];
      const indent = i / 2;
      const [x, y] = wordPos(column, line, indent);
      renderWord(svg, word, clue, x, y);
      line++;
    }
    const [x, y] = wordPos(column, line, row[0].length / 2);
    renderWord(svg, row[1], '!!!!!', x, y);
    line++;
  }

  closePage(svg, page);

  function wordPos(column: number, line: number, indent: number): [number, number] {
    const x = MARGIN + column * columnSize + indent * boxSpacing;
    const y = MARGIN + line * boxSpacing;
    return [x, y];
  }
}

function newPage(svgTemplate: HTMLElement): HTMLElement {
  let svg = svgTemplate.cloneNode(true) as HTMLElement;
  svg.removeAttribute('id');
  document.body.appendChild(svg);
  return svg;
}

function closePage(svg: HTMLElement, page: number) {
  const link = downloadSVGLink(svg, `wordle-solution-p${page}.svg`, `Download SVG Page ${page}`);
  document.body.appendChild(link);
}

function renderWord(svg: HTMLElement, word: string, clue: string, x: number, y:number) {
  let pos = x;
  for (let i = 0; i < word.length; i++) {
    addBoxLetter(svg, word[i], pos, y, clueClasses[clue[i] as CLUE]);
    pos += boxSpacing;
  }
}

function addBoxLetter(svg: HTMLElement, letter: string, x: number, y: number, cls: string) {
  const t = svgElement('text') as SVGTextElement;
  t.textContent = letter;
  positionElement(t, x, y);
  t.setAttribute("class", cls);
  svg.appendChild(t);
  addBoxBackground(svg, t, cls);
}

function measureBoxSize(svg: HTMLElement) {
  const t = svgElement('text') as SVGTextElement;
  t.textContent = 'W';
  svg.appendChild(t);
  const rc = t.getBBox();
  boxSize = Math.max(rc.width, rc.height) + BOX_MARGIN;
  boxSpacing = boxSize * SPACING_RATIO;
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
  e.setAttribute("x", x.toFixed(3));
  e.setAttribute("y", y.toFixed(3));
}

function sizeElement(e: SVGElement, w: number, h: number) {
  e.setAttribute("width", w.toFixed(3));
  e.setAttribute("height", h.toFixed(3));
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


