# Color Gradient Editor
A lightweight web application for creating linear color gradients: [https://doklem.github.io/color-gradient-editor](https://doklem.github.io/color-gradient-editor)

## How To Use It
Add as many colors as you want to the linear gradient. Each color can be positioned from the left to the right with a percentage.

Your gradient settings can be stored in a JSON file to make working on it over time possible.

Export the color gradient either as PNG-, JPEG-, BMP- or GIF-file to use it in other projects. You can specify the dimensions of the picture up to 8k.

## How Does It Work
The web application uses [WebGPU](https://en.wikipedia.org/wiki/WebGPU) or [WebGL](https://en.wikipedia.org/wiki/WebGL) depending on your browser. The access to the graphics API is encapsulated through [Three JS](https://threejs.org).

A [plane geometry](https://threejs.org/docs/#api/en/geometries/PlaneGeometry) is created and viewed from top with an [orthographic camera](https://threejs.org/docs/#api/en/cameras/OrthographicCamera). Foreach color there are two vertices (one at the top and one at the bottom). Each vertex pair is positioned along the X-axis according to the percentage of the color and obtaines the RGB values, which are then picked up by the fragment shader via interpolation to fill the entire screen.

The export of the color gradient is achieved with a [toBlob()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob) call on the [HTML canvas](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement).

## Licence
[MIT Licence](https://github.com/doklem/color-gradient-editor/blob/main/LICENSE)