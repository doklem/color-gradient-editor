import { GUI } from 'lil-gui';
import { GradientStop } from './gradient-stop';
import { GradientStopOptions } from './gradient-stop-options';
import { FileManager } from './file-manager';

export class Settings {

  private readonly gui = new GUI({ title: 'Color Gradient Editor' });
  private readonly colorsFolder: GUI;
  private readonly fileManager: FileManager;

  public readonly stops = new Map<number, GradientStop>();

  public exportWidth = 64;
  public exportHeight = 1;
  public exportQuality = 1;

  public constructor(
    private readonly applySettings: () => void,
    exportPicture: (fileType: string, writableFileStream: FileSystemWritableFileStream) => void) {

    this.fileManager = new FileManager(exportPicture);

    const fileFolder = this.gui.addFolder('File');
    fileFolder.add(this, 'loadAsync').name('Load');
    fileFolder.add(this, 'saveAsync').name('Save');
    fileFolder.add(this.fileManager, 'exportAsync').name('Export');

    const exportFolder = fileFolder.addFolder('Export Settings').close();
    exportFolder.add(this, 'exportWidth', 1, 8192, 1).name('Width');
    exportFolder.add(this, 'exportHeight', 1, 8192, 1).name('Height');
    exportFolder.add(this, 'exportQuality', 0, 1, 0.01).name('Quality');

    this.colorsFolder = this.gui.addFolder('Colors');
    this.colorsFolder.add(this, 'addStop').name('Add');

    let stop = new GradientStop({ id: 1, percentage: 0, color: { r: 0, g: 0, b: 1 } });
    this.stops.set(stop.id, stop);
    this.createFolderForStop(stop);

    stop = new GradientStop({ id: 2, percentage: 100, color: { r: 1, g: 0, b: 0 } });
    this.stops.set(stop.id, stop);
    this.createFolderForStop(stop);
  }

  public addStop(): void {
    let id = 1;
    this.stops.forEach((otherStop: GradientStop) => {
      if (otherStop.id >= id) {
        id = otherStop.id + 1;
      }
    });

    const stop = new GradientStop({ id, percentage: 50, color: { r: 1, g: 1, b: 1 } });
    this.stops.set(id, stop);
    this.createFolderForStop(stop);
    this.applySettings();
  }

  public async loadAsync(): Promise<void> {
    const stopOptions = await this.fileManager.loadConfigAsync();
    if (stopOptions === null) {
      return;
    }

    [...this.colorsFolder.folders].forEach(folder => folder.destroy());
    this.stops.clear();

    stopOptions.forEach(options => {
      const stop = new GradientStop(options);
      this.stops.set(stop.id, stop);
      this.createFolderForStop(stop);
    });

    this.applySettings();
  }

  public async saveAsync(): Promise<void> {
    const stops: GradientStopOptions[] = [];
    this.stops.forEach((stop: GradientStop) => stops.push(stop));
    await this.fileManager.saveConfigAsync(stops);
  }

  private createFolderForStop(stop: GradientStop): void {
    const folder = this.colorsFolder.addFolder(`Color ${stop.id}`).onChange(() => this.applySettings());
    folder.add(stop, 'percentage').name('Percentage');
    folder.addColor(stop, 'color').name('Color');
    folder.add({
      delete: () => {
        folder.destroy();
        this.stops.delete(stop.id);
        this.applySettings();
      }
    }, 'delete').name('Delete');
  }
}