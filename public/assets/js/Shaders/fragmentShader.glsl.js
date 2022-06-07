const fragmentShader = `
    uniform sampler2D texture1;
    uniform vec2 repeat;
    uniform vec2 texOffset;
    varying vec2 vUv;
    uniform mat4 transform;
    uniform float opacity;

    void main() {
        gl_FragColor = opacity * (texture2D(texture1, (vUv * repeat) + texOffset));
    }
`;

export default fragmentShader