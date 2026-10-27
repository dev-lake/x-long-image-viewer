type Locale = "en" | "ja" | "pt_BR" | "zh_CN";

type TranslationKey =
  | "selectText"
  | "exitTextMode"
  | "copyAllText"
  | "textCopied"
  | "recognizingText"
  | "recognitionFailed"
  | "selectTextHint"
  | "noTextFound"
  | "copyTextFailed"
  | "close"
  | "currentZoom"
  | "defaultImageAlt"
  | "dialogLabel"
  | "loadingImage"
  | "imagePosition"
  | "imageOverview"
  | "moveToolbarToBottom"
  | "moveToolbarToTop"
  | "moveOverviewToLeft"
  | "moveOverviewToRight"
  | "nextImage"
  | "noThanks"
  | "openOriginal"
  | "previousImage"
  | "rate"
  | "ratePrompt"
  | "rateTitle"
  | "remindLater"
  | "resetView"
  | "actualSize"
  | "zoomIn"
  | "zoomOut";

const DEFAULT_LOCALE: Locale = "en";

const translations: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    selectText: "Select text",
    exitTextMode: "Exit text mode",
    copyAllText: "Copy all",
    textCopied: "Copied",
    recognizingText: "Recognizing text…",
    recognitionFailed: "Recognition failed. Exit and try again.",
    selectTextHint: "Drag to select text, then copy. Scroll to move through the image.",
    noTextFound: "No text found.",
    copyTextFailed: "Copy failed. Select text and press Ctrl+C / ⌘C.",

    close: "Close",
    currentZoom: "Current zoom",
    defaultImageAlt: "X image",
    dialogLabel: "Enhanced X image viewer",
    imagePosition: "Image position",
    imageOverview: "Image overview. Click or drag to move around the image.",
    loadingImage: "Loading image...",
    moveToolbarToBottom: "Move toolbar to bottom",
    moveToolbarToTop: "Move toolbar to top",
    moveOverviewToLeft: "Move overview to lower left",
    moveOverviewToRight: "Move overview to lower right",
    nextImage: "Next image",
    noThanks: "No thanks",
    openOriginal: "Open",
    previousImage: "Previous image",
    rate: "Rate",
    ratePrompt: "Enjoying the long image viewer? A quick rating helps others find it.",
    rateTitle: "Rate X Long Image Viewer",
    remindLater: "Later",
    resetView: "Reset view",
    actualSize: "Actual size",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out"
  },
  ja: {
    selectText: "文字を選択",
    exitTextMode: "選択を終了",
    copyAllText: "すべてコピー",
    textCopied: "コピー済み",
    recognizingText: "文字を認識中…",
    recognitionFailed: "認識できませんでした。終了して再試行してください。",
    selectTextHint: "ドラッグで文字を選択してコピー。スクロールで画像を移動。",
    noTextFound: "文字が見つかりません。",
    copyTextFailed: "コピーできません。選択後 Ctrl+C / ⌘C を押してください。",

    close: "閉じる",
    currentZoom: "現在のズーム",
    defaultImageAlt: "X の画像",
    dialogLabel: "拡張 X 画像ビューア",
    imagePosition: "画像の位置",
    imageOverview: "画像全体表示。クリックまたはドラッグで表示位置を移動します。",
    loadingImage: "画像を読み込み中...",
    moveToolbarToBottom: "ツールバーを下に移動",
    moveToolbarToTop: "ツールバーを上に移動",
    moveOverviewToLeft: "全体表示を左下に移動",
    moveOverviewToRight: "全体表示を右下に移動",
    nextImage: "次の画像",
    noThanks: "不要",
    openOriginal: "開く",
    previousImage: "前の画像",
    rate: "評価する",
    ratePrompt: "長い画像ビューアが役に立ったら、評価で応援してください。",
    rateTitle: "X Long Image Viewer を評価",
    remindLater: "あとで",
    resetView: "表示をリセット",
    actualSize: "実寸表示",
    zoomIn: "拡大",
    zoomOut: "縮小"
  },
  pt_BR: {
    selectText: "Selecionar texto",
    exitTextMode: "Sair da seleção",
    copyAllText: "Copiar tudo",
    textCopied: "Copiado",
    recognizingText: "Reconhecendo texto…",
    recognitionFailed: "Falha no reconhecimento. Saia e tente novamente.",
    selectTextHint: "Arraste para selecionar e copiar. Role para navegar na imagem.",
    noTextFound: "Nenhum texto encontrado.",
    copyTextFailed: "Falha ao copiar. Selecione o texto e pressione Ctrl+C / ⌘C.",

    close: "Fechar",
    currentZoom: "Zoom atual",
    defaultImageAlt: "Imagem do X",
    dialogLabel: "Visualizador aprimorado de imagens do X",
    imagePosition: "Posição da imagem",
    imageOverview: "Visão geral da imagem. Clique ou arraste para navegar.",
    loadingImage: "Carregando imagem...",
    moveToolbarToBottom: "Mover barra para baixo",
    moveToolbarToTop: "Mover barra para cima",
    moveOverviewToLeft: "Mover visão geral para o canto inferior esquerdo",
    moveOverviewToRight: "Mover visão geral para o canto inferior direito",
    nextImage: "Próxima imagem",
    noThanks: "Agora não",
    openOriginal: "Abrir",
    previousImage: "Imagem anterior",
    rate: "Avaliar",
    ratePrompt: "Gostando do visualizador de imagens longas? Uma avaliação rápida ajuda outras pessoas a encontrá-lo.",
    rateTitle: "Avaliar o X Long Image Viewer",
    remindLater: "Depois",
    resetView: "Redefinir visualização",
    actualSize: "Tamanho real",
    zoomIn: "Aumentar zoom",
    zoomOut: "Diminuir zoom"
  },
  zh_CN: {
    selectText: "选择文字",
    exitTextMode: "退出选字",
    copyAllText: "复制全部",
    textCopied: "已复制",
    recognizingText: "正在识别文字…",
    recognitionFailed: "识别失败，请退出选字后重试。",
    selectTextHint: "拖动选中文字后复制，滚动可浏览图片。",
    noTextFound: "未识别到文字。",
    copyTextFailed: "复制失败，请选中文字后按 Ctrl+C / ⌘C。",

    close: "关闭",
    currentZoom: "当前缩放",
    defaultImageAlt: "X 图片",
    dialogLabel: "增强版 X 图片查看器",
    imagePosition: "图片位置",
    imageOverview: "图片缩略导航。点击或拖动可快速定位。",
    loadingImage: "正在加载图片...",
    moveToolbarToBottom: "将控制栏移至下方",
    moveToolbarToTop: "将控制栏移至上方",
    moveOverviewToLeft: "将缩略图移至左下角",
    moveOverviewToRight: "将缩略图移至右下角",
    nextImage: "下一张图片",
    noThanks: "不再提示",
    openOriginal: "打开",
    previousImage: "上一张图片",
    rate: "评分",
    ratePrompt: "觉得长图查看器好用吗？给个评分可以帮助更多人发现它。",
    rateTitle: "为 X Long Image Viewer 评分",
    remindLater: "稍后",
    resetView: "重置视图",
    actualSize: "实际大小",
    zoomIn: "放大",
    zoomOut: "缩小"
  }
};

function getChromeApi(): typeof chrome | undefined {
  return typeof chrome === "undefined" ? undefined : chrome;
}

function normalizeLanguage(language: string): string {
  return language.trim().replace("_", "-").toLowerCase();
}

function localeFromLanguage(language: string): Locale | null {
  const normalized = normalizeLanguage(language);

  if (!normalized) {
    return null;
  }

  if (normalized === "ja" || normalized.startsWith("ja-")) {
    return "ja";
  }

  if (normalized === "pt" || normalized.startsWith("pt-")) {
    return "pt_BR";
  }

  if (normalized === "zh" || normalized.startsWith("zh-")) {
    return "zh_CN";
  }

  if (normalized === "en" || normalized.startsWith("en-")) {
    return "en";
  }

  return null;
}

function getBrowserLanguages(): string[] {
  const extensionLanguage = getChromeApi()?.i18n?.getUILanguage?.();
  const navigatorLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];

  return [extensionLanguage, ...navigatorLanguages].filter((language): language is string => Boolean(language));
}

export function getLocale(): Locale {
  for (const language of getBrowserLanguages()) {
    const locale = localeFromLanguage(language);
    if (locale) {
      return locale;
    }
  }

  return DEFAULT_LOCALE;
}

const activeLocale = getLocale();

export function t(key: TranslationKey): string {
  return translations[activeLocale][key] ?? translations[DEFAULT_LOCALE][key];
}
