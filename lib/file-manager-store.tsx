import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import * as Sharing from "expo-sharing";
import { AppState, Platform } from "react-native";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { extensionOf, formatBytes, sanitizeFileName } from "./file-utils";

export { formatBytes } from "./file-utils";

export type FolderSize = "small" | "medium" | "large";
export type ThemePreference = "light" | "dark" | "system";
export type BackgroundPreference = "paper" | "ocean" | "violet" | "sand";
export type SortBy = "name" | "date" | "size" | "type";

export type FolderItem = {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
  icon: string;
  viewSize: FolderSize;
  createdAt: number;
  updatedAt: number;
  isFavorite: boolean;
  trashedAt: number | null;
};

export type ManagedFile = {
  id: string;
  name: string;
  folderId: string | null;
  uri: string;
  mimeType: string;
  extension: string;
  size: number;
  createdAt: number;
  updatedAt: number;
  isFavorite: boolean;
  trashedAt: number | null;
};

export type IncomingFile = {
  uri: string;
  name: string;
  mimeType?: string | null;
  size?: number | null;
};

export type FilePreferences = {
  theme: ThemePreference;
  background: BackgroundPreference;
  folderView: "grid" | "list";
  defaultFolderSize: FolderSize;
  sortBy: SortBy;
  sortDescending: boolean;
  lockEnabled: boolean;
  biometricEnabled: boolean;
};

type StoredState = {
  folders: FolderItem[];
  files: ManagedFile[];
  preferences: FilePreferences;
};

type FileManagerContextValue = StoredState & {
  ready: boolean;
  isLocked: boolean;
  createFolder: (
    input: Pick<
      FolderItem,
      "name" | "parentId" | "color" | "icon" | "viewSize"
    >,
  ) => string;
  renameItem: (
    id: string,
    kind: "folder" | "file",
    name: string,
  ) => Promise<void>;
  importFiles: (
    folderId: string | null,
    assets: DocumentPicker.DocumentPickerAsset[],
  ) => Promise<void>;
  importIncomingFiles: (
    folderId: string | null,
    assets: IncomingFile[],
  ) => Promise<void>;
  moveItems: (
    selection: Array<{ id: string; kind: "folder" | "file" }>,
    folderId: string | null,
  ) => void;
  trashItems: (
    selection: Array<{ id: string; kind: "folder" | "file" }>,
  ) => void;
  restoreItems: (
    selection: Array<{ id: string; kind: "folder" | "file" }>,
  ) => void;
  deleteForever: (
    selection: Array<{ id: string; kind: "folder" | "file" }>,
  ) => Promise<void>;
  toggleFavorite: (id: string, kind: "folder" | "file") => void;
  shareFile: (file: ManagedFile) => Promise<boolean>;
  shareFolder: (folder: FolderItem) => Promise<boolean>;
  updatePreferences: (changes: Partial<FilePreferences>) => void;
  setPin: (pin: string) => Promise<void>;
  clearPin: () => Promise<void>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  unlockWithBiometrics: () => Promise<boolean>;
  lock: () => void;
  folderTrail: (folderId: string | null) => FolderItem[];
  childFolders: (
    parentId: string | null,
    includeTrashed?: boolean,
  ) => FolderItem[];
  childFiles: (
    folderId: string | null,
    includeTrashed?: boolean,
  ) => ManagedFile[];
  totalStoredBytes: number;
};

const STORAGE_KEY = "mo7adaraty-file-manager-v1";
const PIN_KEY = "mo7adaraty-file-manager-pin-v1";
const ROOT_DIR = `${FileSystem.documentDirectory ?? ""}mo7adaraty/`;
const FILE_DIR = `${ROOT_DIR}files/`;

const DEFAULT_PREFERENCES: FilePreferences = {
  theme: "system",
  background: "paper",
  folderView: "grid",
  defaultFolderSize: "medium",
  sortBy: "date",
  sortDescending: true,
  lockEnabled: false,
  biometricEnabled: false,
};

const FileManagerContext = createContext<FileManagerContextValue | null>(null);

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function ensureStorage() {
  if (Platform.OS === "web" || !ROOT_DIR) return;
  await FileSystem.makeDirectoryAsync(FILE_DIR, { intermediates: true });
}

async function secureGet(key: string) {
  if (Platform.OS === "web") return AsyncStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function secureSet(key: string, value: string) {
  if (Platform.OS === "web") return AsyncStorage.setItem(key, value);
  return SecureStore.setItemAsync(key, value);
}

async function secureDelete(key: string) {
  if (Platform.OS === "web") return AsyncStorage.removeItem(key);
  return SecureStore.deleteItemAsync(key);
}

export function fileIcon(file: ManagedFile) {
  if (file.mimeType.startsWith("image/")) return "file-image-outline";
  if (file.mimeType.startsWith("video/")) return "file-video-outline";
  if (file.mimeType.startsWith("audio/")) return "file-music-outline";
  if (file.extension === "pdf") return "file-pdf-box";
  if (["doc", "docx", "txt", "rtf"].includes(file.extension))
    return "file-document-outline";
  if (["xls", "xlsx", "csv"].includes(file.extension))
    return "file-excel-outline";
  if (["zip", "rar", "7z"].includes(file.extension))
    return "folder-zip-outline";
  return "file-outline";
}

export function FileManagerProvider({ children }: PropsWithChildren) {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<ManagedFile[]>([]);
  const [preferences, setPreferences] =
    useState<FilePreferences>(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), ensureStorage()])
      .then(([stored]) => {
        if (!stored) return;
        const parsed = JSON.parse(stored) as Partial<StoredState>;
        setFolders(parsed.folders ?? []);
        setFiles(parsed.files ?? []);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed.preferences });
        if (parsed.preferences?.lockEnabled) setIsLocked(true);
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready)
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ folders, files, preferences } satisfies StoredState),
      );
  }, [folders, files, preferences, ready]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active" && preferences.lockEnabled) setIsLocked(true);
    });
    return () => subscription.remove();
  }, [preferences.lockEnabled]);

  const value = useMemo<FileManagerContextValue>(() => {
    const childFolders = (parentId: string | null, includeTrashed = false) =>
      folders.filter(
        (folder) =>
          folder.parentId === parentId &&
          (includeTrashed
            ? folder.trashedAt !== null
            : folder.trashedAt === null),
      );
    const childFiles = (folderId: string | null, includeTrashed = false) =>
      files.filter(
        (file) =>
          file.folderId === folderId &&
          (includeTrashed ? file.trashedAt !== null : file.trashedAt === null),
      );
    const folderTrail = (folderId: string | null) => {
      const trail: FolderItem[] = [];
      let cursor = folders.find((folder) => folder.id === folderId);
      while (cursor) {
        trail.unshift(cursor);
        cursor = folders.find((folder) => folder.id === cursor?.parentId);
      }
      return trail;
    };
    const selectedFolderDescendants = (folderId: string): string[] => {
      const direct = folders
        .filter((folder) => folder.parentId === folderId)
        .map((folder) => folder.id);
      return [folderId, ...direct.flatMap(selectedFolderDescendants)];
    };
    const importIncomingFiles = async (
      folderId: string | null,
      assets: IncomingFile[],
    ) => {
      await ensureStorage();
      const now = Date.now();
      const additions: ManagedFile[] = [];
      for (const asset of assets) {
        const id = makeId("file");
        const name = sanitizeFileName(asset.name);
        const extension = extensionOf(name);
        const destination = `${FILE_DIR}${id}${extension ? `.${extension}` : ""}`;
        let uri = asset.uri;
        if (Platform.OS !== "web" && ROOT_DIR) {
          await FileSystem.copyAsync({ from: asset.uri, to: destination });
          uri = destination;
        }
        additions.push({
          id,
          name,
          folderId,
          uri,
          mimeType: asset.mimeType ?? "application/octet-stream",
          extension,
          size: asset.size ?? 0,
          createdAt: now,
          updatedAt: now,
          isFavorite: false,
          trashedAt: null,
        });
      }
      setFiles((current) => [...additions, ...current]);
    };

    return {
      folders,
      files,
      preferences,
      ready,
      isLocked,
      totalStoredBytes: files
        .filter((file) => file.trashedAt === null)
        .reduce((total, file) => total + file.size, 0),
      createFolder(input) {
        const timestamp = Date.now();
        const id = makeId("folder");
        setFolders((current) => [
          {
            id,
            name: sanitizeFileName(input.name),
            parentId: input.parentId,
            color: input.color,
            icon: input.icon,
            viewSize: input.viewSize,
            createdAt: timestamp,
            updatedAt: timestamp,
            isFavorite: false,
            trashedAt: null,
          },
          ...current,
        ]);
        return id;
      },
      async renameItem(id, kind, name) {
        const cleanName = sanitizeFileName(name);
        const now = Date.now();
        if (kind === "folder") {
          setFolders((current) =>
            current.map((folder) =>
              folder.id === id
                ? { ...folder, name: cleanName, updatedAt: now }
                : folder,
            ),
          );
          return;
        }
        const item = files.find((file) => file.id === id);
        if (!item) return;
        const nextExtension = extensionOf(cleanName);
        if (Platform.OS !== "web" && item.uri.startsWith("file://")) {
          const nextUri = `${FILE_DIR}${item.id}${nextExtension ? `.${nextExtension}` : ""}`;
          if (nextUri !== item.uri)
            await FileSystem.moveAsync({ from: item.uri, to: nextUri });
          setFiles((current) =>
            current.map((file) =>
              file.id === id
                ? {
                    ...file,
                    name: cleanName,
                    uri: nextUri,
                    extension: nextExtension,
                    updatedAt: now,
                  }
                : file,
            ),
          );
          return;
        }
        setFiles((current) =>
          current.map((file) =>
            file.id === id
              ? {
                  ...file,
                  name: cleanName,
                  extension: nextExtension,
                  updatedAt: now,
                }
              : file,
          ),
        );
      },
      importIncomingFiles,
      async importFiles(folderId, assets) {
        await importIncomingFiles(
          folderId,
          assets.map((asset) => ({
            uri: asset.uri,
            name: asset.name,
            mimeType: asset.mimeType,
            size: asset.size,
          })),
        );
      },
      moveItems(selection, folderId) {
        const folderIds = selection
          .filter((item) => item.kind === "folder")
          .map((item) => item.id);
        if (
          folderId &&
          folderIds.some((id) =>
            selectedFolderDescendants(id).includes(folderId),
          )
        )
          return;
        const now = Date.now();
        setFolders((current) =>
          current.map((folder) =>
            folderIds.includes(folder.id)
              ? { ...folder, parentId: folderId, updatedAt: now }
              : folder,
          ),
        );
        const fileIds = selection
          .filter((item) => item.kind === "file")
          .map((item) => item.id);
        setFiles((current) =>
          current.map((file) =>
            fileIds.includes(file.id)
              ? { ...file, folderId, updatedAt: now }
              : file,
          ),
        );
      },
      trashItems(selection) {
        const now = Date.now();
        const foldersToTrash = new Set(
          selection
            .filter((item) => item.kind === "folder")
            .flatMap((item) => selectedFolderDescendants(item.id)),
        );
        const fileIds = new Set(
          selection
            .filter((item) => item.kind === "file")
            .map((item) => item.id),
        );
        setFolders((current) =>
          current.map((folder) =>
            foldersToTrash.has(folder.id)
              ? { ...folder, trashedAt: now, updatedAt: now }
              : folder,
          ),
        );
        setFiles((current) =>
          current.map((file) =>
            fileIds.has(file.id) ||
            (file.folderId ? foldersToTrash.has(file.folderId) : false)
              ? { ...file, trashedAt: now, updatedAt: now }
              : file,
          ),
        );
      },
      restoreItems(selection) {
        const folderIds = new Set(
          selection
            .filter((item) => item.kind === "folder")
            .flatMap((item) => selectedFolderDescendants(item.id)),
        );
        const fileIds = new Set(
          selection
            .filter((item) => item.kind === "file")
            .map((item) => item.id),
        );
        const now = Date.now();
        setFolders((current) =>
          current.map((folder) =>
            folderIds.has(folder.id)
              ? { ...folder, trashedAt: null, updatedAt: now }
              : folder,
          ),
        );
        setFiles((current) =>
          current.map((file) =>
            fileIds.has(file.id) ||
            (file.folderId ? folderIds.has(file.folderId) : false)
              ? { ...file, trashedAt: null, updatedAt: now }
              : file,
          ),
        );
      },
      async deleteForever(selection) {
        const folderIds = new Set(
          selection
            .filter((item) => item.kind === "folder")
            .flatMap((item) => selectedFolderDescendants(item.id)),
        );
        const fileIds = new Set(
          selection
            .filter((item) => item.kind === "file")
            .map((item) => item.id),
        );
        const removingFiles = files.filter(
          (file) =>
            fileIds.has(file.id) ||
            (file.folderId ? folderIds.has(file.folderId) : false),
        );
        await Promise.all(
          removingFiles.map(async (file) => {
            if (Platform.OS !== "web" && file.uri.startsWith("file://")) {
              const info = await FileSystem.getInfoAsync(file.uri);
              if (info.exists)
                await FileSystem.deleteAsync(file.uri, { idempotent: true });
            }
          }),
        );
        setFolders((current) =>
          current.filter((folder) => !folderIds.has(folder.id)),
        );
        setFiles((current) =>
          current.filter(
            (file) =>
              !fileIds.has(file.id) &&
              !(file.folderId ? folderIds.has(file.folderId) : false),
          ),
        );
      },
      toggleFavorite(id, kind) {
        if (kind === "folder")
          setFolders((current) =>
            current.map((folder) =>
              folder.id === id
                ? {
                    ...folder,
                    isFavorite: !folder.isFavorite,
                    updatedAt: Date.now(),
                  }
                : folder,
            ),
          );
        else
          setFiles((current) =>
            current.map((file) =>
              file.id === id
                ? {
                    ...file,
                    isFavorite: !file.isFavorite,
                    updatedAt: Date.now(),
                  }
                : file,
            ),
          );
      },
      async shareFile(file) {
        if (Platform.OS === "web" || !(await Sharing.isAvailableAsync()))
          return false;
        await Sharing.shareAsync(file.uri, {
          dialogTitle: `مشاركة ${file.name}`,
          mimeType: file.mimeType,
        });
        return true;
      },
      async shareFolder(folder) {
        if (Platform.OS === "web" || !(await Sharing.isAvailableAsync()))
          return false;
        const folderIds = new Set(selectedFolderDescendants(folder.id));
        const sourceFiles = files
          .filter(
            (file) =>
              file.trashedAt === null &&
              file.folderId &&
              folderIds.has(file.folderId) &&
              file.uri.startsWith("file://"),
          )
          .map((file) => file.uri);
        if (!sourceFiles.length) return false;
        const { zip, BEST_COMPRESSION } = await import(
          "react-native-zip-archive"
        );
        const archiveUri = `${FileSystem.cacheDirectory ?? FILE_DIR}${sanitizeFileName(folder.name)}-${Date.now()}.zip`;
        await zip(sourceFiles, archiveUri, BEST_COMPRESSION);
        await Sharing.shareAsync(archiveUri, {
          dialogTitle: `مشاركة مجلد ${folder.name}`,
          mimeType: "application/zip",
        });
        return true;
      },
      updatePreferences(changes) {
        setPreferences((current) => ({ ...current, ...changes }));
      },
      async setPin(pin) {
        await secureSet(PIN_KEY, pin);
        setPreferences((current) => ({ ...current, lockEnabled: true }));
        setIsLocked(false);
      },
      async clearPin() {
        await secureDelete(PIN_KEY);
        setPreferences((current) => ({
          ...current,
          lockEnabled: false,
          biometricEnabled: false,
        }));
        setIsLocked(false);
      },
      async unlockWithPin(pin) {
        const storedPin = await secureGet(PIN_KEY);
        const success = !!storedPin && pin === storedPin;
        if (success) setIsLocked(false);
        return success;
      },
      async unlockWithBiometrics() {
        if (Platform.OS === "web" || !preferences.biometricEnabled)
          return false;
        const [hasHardware, enrolled] = await Promise.all([
          LocalAuthentication.hasHardwareAsync(),
          LocalAuthentication.isEnrolledAsync(),
        ]);
        if (!hasHardware || !enrolled) return false;
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "فتح تطبيق محاضراتي",
          fallbackLabel: "استخدم رمز PIN",
        });
        if (result.success) setIsLocked(false);
        return result.success;
      },
      lock() {
        if (preferences.lockEnabled) setIsLocked(true);
      },
      folderTrail,
      childFolders,
      childFiles,
    };
  }, [folders, files, preferences, ready, isLocked]);

  return (
    <FileManagerContext.Provider value={value}>
      {children}
    </FileManagerContext.Provider>
  );
}

export function useFileManager() {
  const context = useContext(FileManagerContext);
  if (!context)
    throw new Error("useFileManager must be used within FileManagerProvider");
  return context;
}
