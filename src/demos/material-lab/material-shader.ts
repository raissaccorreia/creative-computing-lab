export const WAVE_VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;
varying vec3 vViewNormal;

void main() {
  vUv = uv;
  vViewNormal = normalize(normalMatrix * normal);

  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewPosition;
}
`

export const WAVE_FRAGMENT_SHADER = /* glsl */ `
uniform vec3 uBaseColor;
uniform float uPatternScale;

varying vec2 vUv;
varying vec3 vViewNormal;

void main() {
  float bend = sin(vUv.x * 6.2831853) * 0.14;
  float wave = sin((vUv.y + bend) * uPatternScale * 6.2831853);
  float band = smoothstep(-0.2, 0.2, wave);

  vec3 lowColor = uBaseColor * 0.42;
  vec3 highColor = min(uBaseColor * 1.48 + vec3(0.035), vec3(1.0));
  vec3 bandColor = mix(lowColor, highColor, band);

  vec3 normal = normalize(vViewNormal);
  vec3 lightDirection = normalize(vec3(-0.35, 0.55, 0.75));
  float diffuse = max(dot(normal, lightDirection), 0.0);
  vec3 shadedColor = bandColor * (0.64 + diffuse * 0.36);

  gl_FragColor = vec4(shadedColor, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`
