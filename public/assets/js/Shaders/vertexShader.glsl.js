const vertexShader = `
    varying vec2 vUv;
    uniform vec3 vPosition;
    void main() {
        vUv = uv;
        gl_Position =( projectionMatrix * viewMatrix * vec4(position + vPosition, 1.0) );
    }
`;
export default vertexShader;