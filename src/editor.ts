import { BufferAttribute, DynamicDrawUsage, Mesh, OrthographicCamera, PlaneGeometry, Scene } from 'three';
import { NodeMaterial, WebGPURenderer } from 'three/webgpu';
import { Settings } from './settings';
import { attribute, Fn, vec4 } from 'three/tsl';
import { GradientStop } from './gradient-stop';

export class Editor {

  private static readonly CLIP_SPACE_SIZE = 2;
  private static readonly CLIP_SPACE_CENTER = 0;
  private static readonly CLIP_SPACE_SIZE_HALF = Editor.CLIP_SPACE_SIZE * 0.5;
  private static readonly CLIP_SPACE_SIZE_PERCENT = Editor.CLIP_SPACE_SIZE * 0.01;
  private static readonly CLIP_SPACE_POSITION_ATTRIBUTE = 'clipSpacePosition';
  private static readonly COLOR_ATTRIBUTE = 'color';

  private readonly scene: Scene;
  private readonly camera: OrthographicCamera;
  private readonly renderer: WebGPURenderer;
  private readonly material: NodeMaterial;

  private mesh?: Mesh<PlaneGeometry, NodeMaterial>;
  private colorAttribute: BufferAttribute;
  private clipSpacePositionAttribute: BufferAttribute;
  private gradientStopCount = 0;

  public constructor(private readonly canvas: HTMLCanvasElement) {
    this.colorAttribute = new BufferAttribute(new Float32Array(), 3).setUsage(DynamicDrawUsage);
    this.clipSpacePositionAttribute = new BufferAttribute(new Float32Array(), 2).setUsage(DynamicDrawUsage);

    this.renderer = new WebGPURenderer({
      antialias: true,
      canvas
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);

    this.camera = new OrthographicCamera(
      -Editor.CLIP_SPACE_SIZE_HALF,
      Editor.CLIP_SPACE_SIZE_HALF,
      Editor.CLIP_SPACE_SIZE_HALF,
      -Editor.CLIP_SPACE_SIZE_HALF,
      0.01,
      2
    );
    this.camera.position.set(0, 0, this.camera.far * 0.5);

    this.scene = new Scene();

    this.material = new NodeMaterial();
    this.material.colorNode = Fn(() => {
      return vec4(attribute(Editor.COLOR_ATTRIBUTE, 'vec3'), 1);
    })();
    this.material.vertexNode = Fn(() => {
      return vec4(attribute(Editor.CLIP_SPACE_POSITION_ATTRIBUTE, 'vec2'), Editor.CLIP_SPACE_CENTER, 1);
    })();
  }

  public applySettings(settings: Settings): void {
    if (settings.stops.size === 0) {
      return;
    }

    const gradientStops: GradientStop[] = [];
    settings.stops.forEach(stop => gradientStops.push(stop));
    gradientStops.sort(GradientStop.compare);

    const colors: number[] = [];
    const clipSpacePositions: number[] = [];
    // Upper row of vertices
    gradientStops.forEach(
      (stop: GradientStop, index: number) => Editor.applyGradientStopToVertexRow(stop, index, gradientStops.length, colors, clipSpacePositions, Editor.CLIP_SPACE_SIZE_HALF)
    );
    // Lower row of vertices
    gradientStops.forEach(
      (stop: GradientStop, index: number) => Editor.applyGradientStopToVertexRow(stop, index, gradientStops.length, colors, clipSpacePositions, -Editor.CLIP_SPACE_SIZE_HALF)
    );

    if (this.gradientStopCount === gradientStops.length) {
      this.update(colors, clipSpacePositions);
    } else {
      this.rebuild(gradientStops.length, colors, clipSpacePositions);
    }

    requestAnimationFrame(async () => await this.renderer.renderAsync(this.scene, this.camera));
  }

  public onResize(width: number, height: number, devicePixelRatio: number): void {
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(width, height, false);
  }

  public exportPicture(settings: Settings, fileType: string, writableFileStream: FileSystemWritableFileStream): void {
    this.onResize(settings.exportWidth, settings.exportHeight, 1);
    requestAnimationFrame(() => {
      this.renderer.render(this.scene, this.camera);
      this.canvas.toBlob(async (blob: Blob | null) => {
        this.onResize(window.innerWidth, window.innerHeight, window.devicePixelRatio);
        if (blob !== null) {
          await writableFileStream.write(blob);
        }
        await writableFileStream.close();
      }, fileType, settings.exportQuality);
    });
  }

  private update(colors: number[], clipSpacePositions: number[]): void {
    this.colorAttribute.set(colors);
    this.clipSpacePositionAttribute.set(clipSpacePositions);
  }

  private rebuild(count: number, colors: number[], clipSpacePositions: number[]): void {
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }

    this.colorAttribute = new BufferAttribute(new Float32Array(colors), 3).setUsage(DynamicDrawUsage);
    this.clipSpacePositionAttribute = new BufferAttribute(new Float32Array(clipSpacePositions), 2).setUsage(DynamicDrawUsage);
    const geometry = new PlaneGeometry(Editor.CLIP_SPACE_SIZE, Editor.CLIP_SPACE_SIZE, count + 1, 1);
    geometry.setAttribute(Editor.COLOR_ATTRIBUTE, this.colorAttribute);
    geometry.setAttribute(Editor.CLIP_SPACE_POSITION_ATTRIBUTE, this.clipSpacePositionAttribute)

    this.mesh = new Mesh(geometry, this.material);
    this.scene.add(this.mesh);

    this.gradientStopCount = count;
  }

  private static applyGradientStopToVertexRow(
    stop: GradientStop,
    index: number,
    gardientStopsCount: number,
    colors: number[],
    clipSpacePositions: number[],
    y: number): void {
    const x = stop.percentage * Editor.CLIP_SPACE_SIZE_PERCENT - Editor.CLIP_SPACE_SIZE_HALF

    if (index === 0) {
      stop.writeColor(colors);
      clipSpacePositions.push(Math.min(-Editor.CLIP_SPACE_SIZE_HALF, x));
      clipSpacePositions.push(y);
    }

    clipSpacePositions.push(x);
    clipSpacePositions.push(y);

    if (index === gardientStopsCount - 1) {
      stop.writeColor(colors);
      clipSpacePositions.push(Math.max(Editor.CLIP_SPACE_SIZE_HALF, x));
      clipSpacePositions.push(y);
    }

    stop.writeColor(colors);
  }
}