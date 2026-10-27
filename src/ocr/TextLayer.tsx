import type { OcrResult } from "./client";

let context: CanvasRenderingContext2D | null;
function textWidth(text: string, size: number): number {
  context ??= document.createElement("canvas").getContext("2d");
  if (!context) return Math.max(1, text.length * size * 0.6);
  context.font = `${size}px sans-serif`;
  return Math.max(1, context.measureText(text).width);
}

export function TextLayer({ result }: { result: OcrResult }) {
  return (
    <div className="xpe-text-layer" onPointerDown={event => event.stopPropagation()}
      onClick={event => event.stopPropagation()} onDoubleClick={event => event.stopPropagation()}>
      {result.lines.map((line, index) => {
        const { x0, y0, x1, y1 } = line.bbox;
        const height = Math.max(1, y1 - y0);
        return <span key={index} style={{
          left: `${x0 / result.width * 100}%`, top: `${y0 / result.height * 100}%`,
          fontSize: `${height}px`,
          transform: `scaleX(${(x1 - x0) / textWidth(line.text, height)})`
        }}>{line.text}{"\n"}</span>;
      })}
    </div>
  );
}
