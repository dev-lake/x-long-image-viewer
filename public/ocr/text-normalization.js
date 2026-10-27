// Clean OCR spacing without joining English words or removing paragraph breaks.
function normalizeOcrText(text) {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map(line => line
      .replace(/[\t\f\v \u00a0\u3000]+/g, " ")
      .replace(/(\p{Script=Han}) +(?=\p{Script=Han})/gu, "$1")
      .replace(/ *([，。！？；：、（）《》「」『』【】〔〕〈〉]) */g, "$1")
      .trim())
    .join("\n")
    .trim();
}
