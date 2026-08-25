
varying vec3 vColor;
varying float vDistance;
varying float vAngleFade;

void main() {

  float strength = distance(gl_PointCoord, vec2(0.5));
  strength = 1.0 - strength;
  strength *= strength;
  strength *= strength;
  strength *= strength;

  //
  float distanceFade = smoothstep(50.0, 10.0, vDistance);


  vec3 color = mix(vec3(0.0), vColor, strength) * distanceFade * vAngleFade;

  gl_FragColor = vec4(vec3(color), 1.0);


}