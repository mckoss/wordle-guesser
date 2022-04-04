// Render solution space as an SVG file for "manual" solves.

export { makeSVG };

function makeSVG(svg: HTMLElement) {
  console.log("Hello, world!", svg);

  const link = downloadSVGLink(svg, 'wordle-solution.svg', 'Download SVG');
  document.body.appendChild(link);
}

function svgElement(t: string, cls: string): SVGElement {
  const svgNS = 'http://www.w3.org/2000/svg';
  const e = document.createElementNS(svgNS, t);
  if (cls) {
    e.setAttribute('class', cls);
  }
  return e;
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


