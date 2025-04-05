import { GradientStopOptions } from './gradient-stop-options';

export class FileManager {

  private static readonly PNG_MIME = 'image/png';
  private static readonly PNG_EXTENSION = '.png';

  private static readonly JPG_MIME = 'image/jpg';
  private static readonly JPG_EXTENSION = '.jpg';
  private static readonly JPEG_EXTENSION = '.jpeg';

  private static readonly BMP_MIME = 'image/bmp';
  private static readonly BMP_EXTENSION = '.bmp';

  private static readonly GIF_MIME = 'image/gif';
  private static readonly GIF_EXTENSION = '.gif';

  private static readonly JSON_MIME = 'application/json';
  private static readonly JSON_EXTENSION = '.json';

  private static readonly EXPORT_PICKER_OPTIONS: SaveFilePickerOptions = {
    suggestedName: `color-gradient${FileManager.PNG_EXTENSION}`,
    types: [
      {
        description: 'PNG Image',
        accept: {
          [FileManager.PNG_MIME]: [FileManager.PNG_EXTENSION],
        },
      },
      {
        description: 'JPEG Image',
        accept: {
          [FileManager.JPG_MIME]: [FileManager.JPG_EXTENSION, FileManager.JPEG_EXTENSION],
        },
      },
      {
        description: 'BMP Image',
        accept: {
          [FileManager.BMP_MIME]: [FileManager.BMP_EXTENSION],
        },
      },
      {
        description: 'GIF Image',
        accept: {
          [FileManager.GIF_MIME]: [FileManager.GIF_EXTENSION],
        },
      },
    ],
    excludeAcceptAllOption: true,
  };

  private static readonly LOAD_PICKER_OPTIONS: OpenFilePickerOptions = {
    types: [
      {
        description: 'Color Gradient Configuration',
        accept: {
          [FileManager.JSON_MIME]: [FileManager.JSON_EXTENSION],
        },
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false,
  };

  private static readonly SAVE_PICKER_OPTIONS: SaveFilePickerOptions = {
    suggestedName: `color-gradient-config${FileManager.JSON_EXTENSION}`,
    types: [
      {
        description: 'Color Gradient Configuration',
        accept: {
          [FileManager.JSON_MIME]: [FileManager.JSON_EXTENSION],
        },
      },
    ],
    excludeAcceptAllOption: true,
  };

  public constructor(private readonly exportPicture: (fileType: string, writableFileStream: FileSystemWritableFileStream) => void) {
  }

  public async exportAsync(): Promise<void> {
    const fileHandle = await window.showSaveFilePicker(FileManager.EXPORT_PICKER_OPTIONS);
    const normalizedName = fileHandle.name.normalize();
    let fileType: string;
    if (normalizedName.endsWith(FileManager.BMP_EXTENSION)) {
      fileType = FileManager.BMP_MIME;
    } else if (normalizedName.endsWith(FileManager.JPG_EXTENSION) || normalizedName.endsWith(FileManager.JPEG_EXTENSION)) {
      fileType = FileManager.JPG_MIME;
    } else if (normalizedName.endsWith(FileManager.GIF_EXTENSION)) {
      fileType = FileManager.GIF_MIME;
    } else {
      fileType = FileManager.PNG_MIME;
    }
    this.exportPicture(fileType, await fileHandle.createWritable());
  }

  public async loadConfigAsync(): Promise<GradientStopOptions[] | null> {
    const fileHandle = await window.showOpenFilePicker(FileManager.LOAD_PICKER_OPTIONS);
    if (fileHandle.length < 1) {
      return null;
    }
    const file = await fileHandle[0].getFile();
    const json = await file.text();
    return JSON.parse(json) as GradientStopOptions[];
  }

  public async saveConfigAsync(stops: GradientStopOptions[]): Promise<void> {
    const fileHandle = await window.showSaveFilePicker(FileManager.SAVE_PICKER_OPTIONS);
    const writableFileStream = await fileHandle.createWritable();
    await writableFileStream.write(new Blob([JSON.stringify(stops)], { type: FileManager.JSON_MIME }));
    await writableFileStream.close();
  }
}