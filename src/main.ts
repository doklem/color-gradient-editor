import { Editor } from './editor';
import { Settings } from './settings';

export class Main {

  private readonly canvas: HTMLCanvasElement;
  private readonly settings: Settings;
  private readonly editor: Editor;

  public constructor() {
    const display = document.querySelector<HTMLCanvasElement>('#display');;
    if (display === null) {
      throw new Error('Failed to obtain the HTML canvas element');
    }
    this.canvas = display;
    this.settings = new Settings(this.applySettings.bind(this), this.exportPicture.bind(this));
    this.editor = new Editor(this.canvas);
  }

  public run(): void {
    this.editor.applySettings(this.settings);
    window.addEventListener('resize', this.onResize.bind(this));
  }

  public onResize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.editor.onResize(window.innerWidth, window.innerHeight, window.devicePixelRatio);
  }

  private applySettings(): void {
    this.editor.applySettings(this.settings);
  }

  private exportPicture(fileType: string, writableFileStream: FileSystemWritableFileStream): void {
    this.editor.exportPicture(this.settings, fileType, writableFileStream);
  }
}

new Main().run();
