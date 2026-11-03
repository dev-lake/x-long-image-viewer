/*
 * A small, image-only lens renderer. Rounded-box edge/refraction treatment is
 * adapted from liquidGL v3.0.0, Copyright (c) NaughtyDuk, under the MIT License.
 * Source: https://github.com/naughtyduk/liquidGL/blob/main/package/liquidGL.js
 * The complete third-party notice is distributed in public/LIQUID-GL-NOTICE.txt.
 */

export type GlassRect = { left: number; top: number; width: number; height: number };
export type GlassScene = {
  lens: GlassRect;
  image: GlassRect;
  viewport: { width: number; height: number };
  // Pointer and rectangles use viewport CSS pixels, with the origin at top left.
  pointer: { x: number; y: number; active: boolean };
};

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v_uv;
uniform sampler2D u_image;
uniform vec4 u_lens;
uniform vec4 u_imageRect;
uniform vec2 u_viewport;
uniform vec3 u_pointer;
uniform float u_hasImage;
uniform float u_pixelRatio;

// All optical distances below are CSS pixels, independent of canvas DPR.
const float BEVEL_WIDTH = 12.0;
const float REFRACTION = 11.5;
const float DISPERSION = 0.45;
const float FROST_RADIUS = 1.6;
const vec3 BACKGROUND = vec3(8.0, 12.0, 16.0) / 255.0;

float pillDistance(vec2 point, vec2 halfSize) {
  float radius = min(halfSize.x, halfSize.y);
  vec2 q = abs(point) - halfSize + radius;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

vec3 sampleScene(vec2 screenPixel) {
  if (u_hasImage < 0.5 ||
      screenPixel.x < 0.0 || screenPixel.y < 0.0 ||
      screenPixel.x > u_viewport.x || screenPixel.y > u_viewport.y ||
      u_imageRect.z <= 0.0 || u_imageRect.w <= 0.0) return BACKGROUND;
  vec2 uv = (screenPixel - u_imageRect.xy) / u_imageRect.zw;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return BACKGROUND;
  // DOM sources are uploaded without Y flipping, matching these top-left UVs.
  vec4 color = texture2D(u_image, uv);
  return mix(BACKGROUND, color.rgb, color.a);
}

vec3 frost(vec2 pixel) {
  float r = FROST_RADIUS;
  vec3 color = sampleScene(pixel) * 0.28;
  color += sampleScene(pixel + vec2(r, 0.0)) * 0.12;
  color += sampleScene(pixel - vec2(r, 0.0)) * 0.12;
  color += sampleScene(pixel + vec2(0.0, r)) * 0.12;
  color += sampleScene(pixel - vec2(0.0, r)) * 0.12;
  color += sampleScene(pixel + vec2(r, r) * 0.7071) * 0.06;
  color += sampleScene(pixel + vec2(-r, r) * 0.7071) * 0.06;
  color += sampleScene(pixel + vec2(r, -r) * 0.7071) * 0.06;
  color += sampleScene(pixel - vec2(r, r) * 0.7071) * 0.06;
  return color;
}

void main() {
  vec2 local = vec2(v_uv.x, 1.0 - v_uv.y) * u_lens.zw;
  vec2 halfSize = u_lens.zw * 0.5;
  vec2 point = local - halfSize;
  float distance = pillDistance(point, halfSize);
  float aa = 0.75 / u_pixelRatio;
  float mask = 1.0 - smoothstep(-aa, aa, distance);
  if (mask <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // Differentiate the SDF so the straight sides and rounded ends share a
  // continuous normal. Only the inner 12px bevel displaces the background.
  vec2 delta = vec2(0.25, 0.0);
  vec2 gradient = vec2(
    pillDistance(point + delta.xy, halfSize) - pillDistance(point - delta.xy, halfSize),
    pillDistance(point + delta.yx, halfSize) - pillDistance(point - delta.yx, halfSize)
  );
  vec2 normal = gradient / max(length(gradient), 0.0001);
  float inset = max(-distance, 0.0);
  float edge = 1.0 - smoothstep(0.0, BEVEL_WIDTH, inset);
  float bend = (pow(edge, 1.8) * 0.76 + pow(edge, 7.0) * 0.24) * REFRACTION;
  vec2 pixel = u_lens.xy + local;
  vec2 refracted = pixel + normal * bend;
  vec3 color = frost(refracted);
  vec2 chroma = normal * edge * edge * DISPERSION;
  color.r = mix(color.r, sampleScene(refracted - chroma).r, 0.4);
  color.b = mix(color.b, sampleScene(refracted + chroma).b, 0.4);

  // Keep the pane clear. The toolbar chooses its foreground colour separately
  // from the image's sampled brightness, so the shader needs only a light tint.
  color = mix(color, BACKGROUND, 0.08);
  // A soft ambient reflection keeps the pane legible over the viewer's empty
  // dark margins, where there is no image detail for the bevel to refract.
  color = mix(color, vec3(0.62, 0.67, 0.74), 0.14);
  vec2 light = normalize(vec2(-0.45, -0.9));
  float facing = pow(max(dot(normal, light), 0.0), 4.0);
  float rim = exp(-inset * 2.0);
  color += vec3(0.72, 0.86, 1.0) * edge * edge * 0.016;
  color += vec3(1.0) * rim * (0.025 + 0.085 * facing);
  if (u_pointer.z > 0.5) {
    vec2 lightVector = u_pointer.xy - pixel + vec2(0.0, -40.0);
    vec2 pointerLight = lightVector / max(length(lightVector), 0.0001);
    float proximity = exp(-length((pixel - u_pointer.xy) / vec2(150.0, 80.0)));
    float glint = pow(max(dot(normal, pointerLight), 0.0), 6.0);
    color += vec3(1.0) * edge * edge * proximity * glint * 0.045;
  }
  gl_FragColor = vec4(clamp(color, 0.0, 1.0) * mask, mask);
}`;

export function createGlassRenderer(canvas: HTMLCanvasElement): {
  setImage(image: TexImageSource): boolean;
  draw(scene: GlassScene): boolean;
  dispose(): void;
} | null {
  let gl: WebGLRenderingContext | null;
  try {
    gl = canvas.getContext("webgl", {
      alpha: true, premultipliedAlpha: true, antialias: false,
      depth: false, stencil: false, powerPreference: "low-power"
    });
  } catch {
    return null;
  }
  if (!gl) return null;
  const context = gl;
  const shaders: WebGLShader[] = [];
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let texture: WebGLTexture | null = null;
  let disposed = false;
  let lost = false;
  let hasImage = false;
  const onContextLost = () => { lost = true; };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    canvas.removeEventListener("webglcontextlost", onContextLost);
    if (texture) context.deleteTexture(texture);
    if (buffer) context.deleteBuffer(buffer);
    if (program) context.deleteProgram(program);
    shaders.forEach(shader => context.deleteShader(shader));
    texture = buffer = program = null;
    // Removing a canvas alone can retain its context until garbage collection.
    // This renderer is disposable, so release the context slot immediately too.
    if (!context.isContextLost()) {
      try { context.getExtension("WEBGL_lose_context")?.loseContext(); } catch { /* Already unavailable. */ }
    }
  };

  try {
    const compile = (type: number, source: string) => {
      const shader = context.createShader(type);
      if (!shader) throw new Error("Shader unavailable");
      shaders.push(shader);
      context.shaderSource(shader, source);
      context.compileShader(shader);
      if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) throw new Error("Shader compilation failed");
      return shader;
    };
    const vertex = compile(context.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(context.FRAGMENT_SHADER, FRAGMENT_SHADER);
    program = context.createProgram();
    if (!program) throw new Error("Program unavailable");
    context.attachShader(program, vertex);
    context.attachShader(program, fragment);
    context.linkProgram(program);
    if (!context.getProgramParameter(program, context.LINK_STATUS)) throw new Error("Shader linking failed");
    context.useProgram(program);

    buffer = context.createBuffer();
    texture = context.createTexture();
    if (!buffer || !texture) throw new Error("Renderer resources unavailable");
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), context.STATIC_DRAW);
    const attribute = context.getAttribLocation(program, "a_position");
    if (attribute < 0) throw new Error("Position attribute unavailable");
    context.enableVertexAttribArray(attribute);
    context.vertexAttribPointer(attribute, 2, context.FLOAT, false, 0, 0);
    const uniform = (name: string) => {
      const location = context.getUniformLocation(program!, name);
      if (location === null) throw new Error("Renderer uniform unavailable");
      return location;
    };
    const uniforms = {
      image: uniform("u_image"), lens: uniform("u_lens"), imageRect: uniform("u_imageRect"),
      viewport: uniform("u_viewport"), pointer: uniform("u_pointer"),
      hasImage: uniform("u_hasImage"), pixelRatio: uniform("u_pixelRatio")
    };
    context.activeTexture(context.TEXTURE0);
    context.bindTexture(context.TEXTURE_2D, texture);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
    context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, false);
    context.pixelStorei(context.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, 1, 1, 0, context.RGBA, context.UNSIGNED_BYTE, new Uint8Array([8, 12, 16, 255]));
    context.uniform1i(uniforms.image, 0);
    context.disable(context.DEPTH_TEST);
    context.disable(context.BLEND);
    context.clearColor(0, 0, 0, 0);
    if (context.getError() !== context.NO_ERROR || context.isContextLost()) throw new Error("Renderer initialization failed");
    canvas.addEventListener("webglcontextlost", onContextLost);

    return {
      setImage(image) {
        hasImage = false;
        if (disposed || lost || context.isContextLost()) return false;
        try {
          context.activeTexture(context.TEXTURE0);
          context.bindTexture(context.TEXTURE_2D, texture);
          context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, image);
          hasImage = context.getError() === context.NO_ERROR && !context.isContextLost();
          return hasImage;
        } catch {
          return false;
        }
      },
      draw(scene) {
        if (disposed || lost || context.isContextLost()) return false;
        const { lens, image, viewport, pointer } = scene;
        if (![lens.left, lens.top, lens.width, lens.height, image.left, image.top, image.width, image.height, viewport.width, viewport.height].every(Number.isFinite) ||
            lens.width <= 0 || lens.height <= 0 || viewport.width <= 0 || viewport.height <= 0) return false;
        try {
          const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
          const width = Math.max(1, Math.ceil(lens.width * dpr));
          const height = Math.max(1, Math.ceil(lens.height * dpr));
          if (canvas.width !== width) canvas.width = width;
          if (canvas.height !== height) canvas.height = height;
          context.viewport(0, 0, width, height);
          context.useProgram(program);
          context.activeTexture(context.TEXTURE0);
          context.bindTexture(context.TEXTURE_2D, texture);
          context.bindBuffer(context.ARRAY_BUFFER, buffer);
          context.enableVertexAttribArray(attribute);
          context.vertexAttribPointer(attribute, 2, context.FLOAT, false, 0, 0);
          context.uniform4f(uniforms.lens, lens.left, lens.top, lens.width, lens.height);
          context.uniform4f(uniforms.imageRect, image.left, image.top, image.width, image.height);
          context.uniform2f(uniforms.viewport, viewport.width, viewport.height);
          const validPointer = Number.isFinite(pointer.x) && Number.isFinite(pointer.y);
          context.uniform3f(uniforms.pointer, validPointer ? pointer.x : 0, validPointer ? pointer.y : 0, validPointer && pointer.active ? 1 : 0);
          context.uniform1f(uniforms.hasImage, hasImage ? 1 : 0);
          context.uniform1f(uniforms.pixelRatio, dpr);
          context.clear(context.COLOR_BUFFER_BIT);
          context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
          return context.getError() === context.NO_ERROR && !context.isContextLost();
        } catch {
          return false;
        }
      },
      dispose
    };
  } catch {
    dispose();
    return null;
  }
}
