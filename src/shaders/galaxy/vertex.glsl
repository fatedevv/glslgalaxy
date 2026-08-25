uniform float uTime;
uniform float uSize;
attribute float aScale;
attribute vec3 aRandomness;
attribute float aAngle;
attribute float aRadius;

varying vec3 vColor;
varying float vDistance;
varying float vAngleFade;

void main() {
          
  /**
    * Position
    */
  vec3 newPosition = position + aRandomness;
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  /* // Spin
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float angleOffsetTime = uTime * 0.00001;
    float angleOffset = (1.0 / distanceToCenter) * uTime * 0.1;
    angle += angleOffset;

    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter; */

  // Spin opt
  float angleOffset = (1.0 / aRadius) * uTime * 0.05;
  float currentAngle = aAngle + angleOffset;

  modelPosition.x = cos(currentAngle) * aRadius;
  modelPosition.z = sin(currentAngle) * aRadius;

  // Randomness
  modelPosition.xyz += aRandomness;


  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  vDistance = -viewPosition.z;
  /**
    * Size
    */
  gl_PointSize = uSize * aScale;
  gl_PointSize *= (1.0 / - viewPosition.z);


  /**
    * Color
    */
  vColor = color;


  /**
   *  Angle fade
   */
   vec3 viewDirection = normalize(cameraPosition - modelPosition.xyz);

   vec3 galaxyNormal = vec3(0.0, 1.0, 0.0);

   float dotProduct = abs(dot(viewDirection, galaxyNormal));

   vAngleFade = mix(0.07, 1.0, dotProduct);

}