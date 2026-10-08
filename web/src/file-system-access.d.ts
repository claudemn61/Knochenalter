// TypeScript's bundled DOM lib doesn't yet cover the permission methods or
// the window-level pickers of the File System Access API, even with
// "DOM.AsyncIterable" enabled for directory iteration. Minimal ambient
// declarations for what this app actually uses.

type FileSystemPermissionMode = "read" | "readwrite";

interface FileSystemHandlePermissionDescriptor {
  mode?: FileSystemPermissionMode;
}

interface FileSystemHandle {
  queryPermission(
    descriptor?: FileSystemHandlePermissionDescriptor,
  ): Promise<PermissionState>;
  requestPermission(
    descriptor?: FileSystemHandlePermissionDescriptor,
  ): Promise<PermissionState>;
}

interface FileSystemFilePickerAcceptType {
  description?: string;
  accept: Record<string, string | string[]>;
}

interface OpenFilePickerOptions {
  multiple?: boolean;
  excludeAcceptAllOption?: boolean;
  types?: FileSystemFilePickerAcceptType[];
}

interface DirectoryPickerOptions {
  id?: string;
  mode?: FileSystemPermissionMode;
}

interface Window {
  showOpenFilePicker(
    options?: OpenFilePickerOptions,
  ): Promise<FileSystemFileHandle[]>;
  showDirectoryPicker(
    options?: DirectoryPickerOptions,
  ): Promise<FileSystemDirectoryHandle>;
}
