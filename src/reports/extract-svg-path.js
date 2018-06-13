// import prettyFormat from 'pretty-format';
const { camelize } = require('underscore.string');
var cheerio = require('cheerio');
var fs = require('fs');
var assign = require('object-assign');

var contents = fs.readFileSync(`${__dirname}/../../assets/requestTypeIcons.svg`, 'utf8');
// var contents = fs.readFileSync(`${__dirname}/../assets/requestTypeIcons.svg`, 'utf8');
var $ = cheerio.load(contents, assign({ xmlMode: true }, 'utf8'));

const atts = [
  'd',
  'fill',
  'stroke',
  'stroke-linecap',
  'stroke-linejoin',
  'fill-opacity',
  'stroke-opacity',
  'stroke-width',
  'stroke-dasharray',
];
function extract(name) {
  const svg = [];
  console.warn('getting SVG', name);
  const item = $(`g#${name}`);
  item.find(`path`).each(function() {
    var path = {};
    atts.forEach((att, i) => {
      const value = $(this).attr(att);
      if (value === undefined) return;
      path[camelize(att)] = i < 6 ? value : parseFloat(value);
    });
    svg.push(path);
  });
  return svg;
}

const parse = extract;

const cache = new Map();

const drawSVG = (doc, x, y, scale, name, xtra = {}) => {
  if (!cache.has(name)) cache.set(name, extract(name));
  const svg = cache.get(name);
  doc
    .save()
    .translate(x, y)
    .scale(scale);
  svg.forEach(path => drawPath(doc, path, xtra));
  doc.restore();
};

const drawPath = (doc, path, xtra) => {
  const { fill, stroke } = xtra;
  doc.save();
  doc.path(path.d);

  if (path.strokeDasharray !== undefined) doc.dash(path.strokeDasharray);
  if (path.strokeLinejoin !== undefined) doc.lineJoin(path.strokeLinejoin);
  if (path.strokeLinecap !== undefined) doc.lineCap(path.strokeLinecap);
  if (path.fillOpacity !== undefined) doc.fillOpacity(path.fillOpacity);
  if (path.strokeOpacity !== undefined) doc.strokeOpacity(path.strokeOpacity);
  if (path.strokeWidth !== undefined) doc.lineWidth(path.strokeWidth);
  if ((fill || path.fill) && (stroke || path.stroke))
    return doc.fillAndStroke(fill || path.fill, stroke || path.stroke);
  if (fill || path.fill) doc.fill(fill || path.fill);
  if (stroke || path.stroke) doc.stroke(stroke || path.stroke);
  doc.restore();
};
module.exports = { drawSVG, parse };
