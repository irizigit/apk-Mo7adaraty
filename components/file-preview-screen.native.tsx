import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { VideoView, useVideoPlayer } from "expo-video";
import Pdf from "react-native-pdf";
import { router, useLocalSearchParams } from "expo-router";
import { Icon } from "@/components/app-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useFileManager } from "@/lib/file-manager-store";
import { useFileTheme } from "@/lib/file-theme";

export default function FilePreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { files, shareFile } = useFileManager();
  const { palette, background } = useFileTheme();
  const file = files.find((item) => item.id === id && item.trashedAt === null);

  if (!file) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <Icon name="file-alert-outline" size={44} color={palette.primary} />
        <Text style={[styles.emptyTitle, { color: palette.text }]}>الملف غير متاح</Text>
      </ScreenContainer>
    );
  }

  const isImage = file.mimeType.startsWith("image/");
  const isPdf = file.extension.toLowerCase() === "pdf" || file.mimeType === "application/pdf";
  const extension = file.extension.toLowerCase();
  const isAudio = file.mimeType.startsWith("audio/") || ["mp3", "m4a", "aac", "wav", "ogg", "opus", "flac", "amr", "3gp"].includes(extension);
  const isVideo = file.mimeType.startsWith("video/") || ["mp4", "m4v", "mov", "webm", "mkv", "3gp", "avi"].includes(extension);
  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <View style={[styles.full, { backgroundColor: background }]}> 
        <View style={[styles.header, { borderBottomColor: palette.border, backgroundColor: palette.surface }]}>
          <Pressable onPress={() => router.back()} style={styles.headerAction}>
            <Icon name="arrow-right" color={palette.text} size={23} />
          </Pressable>
          <Text numberOfLines={1} style={[styles.title, { color: palette.text }]}>{file.name}</Text>
          <Pressable onPress={() => shareFile(file)} style={styles.headerAction}>
            <Icon name="share-variant-outline" color={palette.primary} size={22} />
          </Pressable>
        </View>
        {isImage ? (
          <Image source={file.uri} style={styles.preview} contentFit="contain" transition={150} />
        ) : isPdf ? (
          <Pdf
            source={{ uri: file.uri, cache: true }}
            style={styles.preview}
            trustAllCerts={false}
            enablePaging={false}
            spacing={8}
          />
        ) : isAudio ? (
          <AudioPreview uri={file.uri} name={file.name} />
        ) : isVideo ? (
          <VideoPreview uri={file.uri} />
        ) : (
          <View style={styles.unsupported}>
            <View style={[styles.unsupportedIcon, { backgroundColor: palette.soft }]}>
              <Icon name="file-eye-outline" size={38} color={palette.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: palette.text }]}>المعاينة غير متاحة لهذا النوع</Text>
            <Text style={[styles.emptyText, { color: palette.muted }]}>يمكنك مشاركة الملف وفتحه في التطبيق المناسب.</Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

function AudioPreview({ uri, name }: { uri: string; name: string }) {
  const { palette } = useFileTheme();
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);
  useEffect(() => { void setAudioModeAsync({ playsInSilentMode: true }); }, []);
  const duration = Number.isFinite(status.duration) ? status.duration : 0;
  const position = Number.isFinite(status.currentTime) ? status.currentTime : 0;
  const progress = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;
  const toggle = () => {
    if (status.playing) player.pause();
    else { if (duration > 0 && position >= duration) player.seekTo(0); player.play(); }
  };
  return <View style={styles.mediaStage}><View style={[styles.audioCard, { backgroundColor: palette.surface, borderColor: palette.border }]}><View style={[styles.audioArt, { backgroundColor: palette.soft }]}><Icon name="music-note" size={47} color={palette.primary} /></View><Text numberOfLines={2} style={[styles.audioName, { color: palette.text }]}>{name}</Text><Text style={[styles.time, { color: palette.muted }]}>{formatTime(position)} / {formatTime(duration)}</Text><View style={[styles.track, { backgroundColor: palette.border }]}><View style={[styles.trackFill, { backgroundColor: palette.primary, width: `${progress}%` }]} /></View><View style={styles.audioControls}><Pressable onPress={() => player.seekTo(Math.max(0, position - 15))} style={[styles.skip, { borderColor: palette.border }]}><Icon name="rewind-15" size={21} color={palette.text} /></Pressable><Pressable onPress={toggle} style={[styles.play, { backgroundColor: palette.primary }]}><Icon name={status.playing ? "pause" : "play"} size={29} color="#FFF" /></Pressable><Pressable onPress={() => player.seekTo(Math.min(duration || position + 15, position + 15))} style={[styles.skip, { borderColor: palette.border }]}><Icon name="fast-forward-15" size={21} color={palette.text} /></Pressable></View></View></View>;
}

function VideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer({ uri }, (createdPlayer) => { createdPlayer.timeUpdateEventInterval = 0.5; createdPlayer.audioMixingMode = "auto"; });
  return <View style={styles.videoStage}><VideoView style={styles.video} player={player} nativeControls allowsFullscreen allowsPictureInPicture contentFit="contain" surfaceType="textureView" /></View>;
}

function formatTime(value: number) {
  const seconds = Math.max(0, Math.floor(value || 0));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  full: { flex: 1 },
  header: { height: 62, borderBottomWidth: 1, flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: 8 },
  headerAction: { width: 45, height: 45, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center", fontWeight: "900", fontSize: 14, writingDirection: "rtl" },
  preview: { flex: 1, width: "100%" },
  mediaStage: { flex: 1, justifyContent: "center", padding: 22 },
  audioCard: { borderRadius: 27, padding: 24, borderWidth: 1, alignItems: "center" },
  audioArt: { width: 105, height: 105, borderRadius: 31, alignItems: "center", justifyContent: "center" },
  audioName: { fontWeight: "900", fontSize: 16, textAlign: "center", writingDirection: "rtl", marginTop: 19 },
  time: { fontSize: 12, marginTop: 7 },
  track: { height: 6, width: "100%", borderRadius: 5, overflow: "hidden", marginTop: 21 },
  trackFill: { height: "100%", borderRadius: 5 },
  audioControls: { flexDirection: "row", alignItems: "center", gap: 23, marginTop: 25 },
  play: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center" },
  skip: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  videoStage: { flex: 1, backgroundColor: "#060a12", justifyContent: "center" },
  video: { width: "100%", aspectRatio: 16 / 9 },
  unsupported: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 35 },
  unsupportedIcon: { width: 82, height: 82, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 17, fontWeight: "900", marginTop: 18, textAlign: "center", writingDirection: "rtl" },
  emptyText: { fontSize: 13, marginTop: 7, textAlign: "center", writingDirection: "rtl" },
});
