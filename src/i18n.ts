type Locale = "en" | "ja" | "pt_BR" | "zh_CN";

type TranslationKey =
  | "selectText"
  | "exitTextMode"
  | "copyAllText"
  | "textCopied"
  | "recognizingText"
  | "recognitionFailed"
  | "selectTextHint"
  | "textGuideTitle"
  | "textGuideIntro"
  | "textGuideRecognize"
  | "textGuideSelect"
  | "textGuideCopyAll"
  | "textGuideExit"
  | "textGuideStart"
  | "textGuideContinue"
  | "textGuideDismiss"
  | "textGuideHelp"
  | "noTextFound"
  | "copyTextFailed"
  | "close"
  | "currentZoom"
  | "defaultImageAlt"
  | "dialogLabel"
  | "loadingImage"
  | "imagePosition"
  | "imageOverview"
  | "toolbarPosition"
  | "toolbarPositionTop"
  | "toolbarPositionBottom"
  | "toolbarSettings"
  | "toolbarStyle"
  | "toolbarStyleClassic"
  | "toolbarStyleLiquidGlass"
  | "toolbarStyleHint"
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
  | "cycleZoom"
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
    textGuideTitle: "Select text in images",
    textGuideIntro: "Recognize English and Simplified Chinese text, then select and copy it like text on a webpage.",
    textGuideRecognize: "Click the highlighted Select text button and wait for recognition.",
    textGuideSelect: "Drag to select text, then press Ctrl+C / ⌘C to copy.",
    textGuideCopyAll: "Use Copy all to copy all the text in the image at once.",
    textGuideExit: "Click the text selection button again to exit and resume dragging the image.",
    textGuideStart: "Start selecting",
    textGuideContinue: "Continue selecting",
    textGuideDismiss: "Got it",
    textGuideHelp: "Text selection guide",
    noTextFound: "No text found.",
    copyTextFailed: "Copy failed. Select text and press Ctrl+C / ⌘C.",

    close: "Close",
    currentZoom: "Current zoom",
    defaultImageAlt: "X image",
    dialogLabel: "Enhanced X image viewer",
    imagePosition: "Image position",
    imageOverview: "Image overview. Click or drag to move around the image.",
    loadingImage: "Loading image...",
    toolbarPosition: "Toolbar position",
    toolbarPositionTop: "Top",
    toolbarPositionBottom: "Bottom",
    toolbarSettings: "Toolbar settings",
    toolbarStyle: "Toolbar style",
    toolbarStyleClassic: "Classic",
    toolbarStyleLiquidGlass: "iOS Liquid Glass",
    toolbarStyleHint: "Your choice is saved automatically for future sessions.",
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
    cycleZoom: "Cycle zoom: 50% → 80% → 100%",
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
    textGuideTitle: "画像の文字を選択",
    textGuideIntro: "画像の英語と簡体字中国語を認識し、ウェブページのように選択・コピーできます。",
    textGuideRecognize: "強調表示された「文字を選択」を押し、認識が終わるまで待ちます。",
    textGuideSelect: "文字をドラッグで選択し、Ctrl+C / ⌘C でコピーします。",
    textGuideCopyAll: "「すべてコピー」で画像内の文字をまとめてコピーできます。",
    textGuideExit: "文字選択ボタンをもう一度押すと、画像のドラッグ操作に戻ります。",
    textGuideStart: "選択を開始",
    textGuideContinue: "選択を続ける",
    textGuideDismiss: "わかりました",
    textGuideHelp: "文字選択ガイド",
    noTextFound: "文字が見つかりません。",
    copyTextFailed: "コピーできません。選択後 Ctrl+C / ⌘C を押してください。",

    close: "閉じる",
    currentZoom: "現在のズーム",
    defaultImageAlt: "X の画像",
    dialogLabel: "拡張 X 画像ビューア",
    imagePosition: "画像の位置",
    imageOverview: "画像全体表示。クリックまたはドラッグで表示位置を移動します。",
    loadingImage: "画像を読み込み中...",
    toolbarPosition: "ツールバーの位置",
    toolbarPositionTop: "上部",
    toolbarPositionBottom: "下部",
    toolbarSettings: "ツールバー設定",
    toolbarStyle: "ツールバーのスタイル",
    toolbarStyleClassic: "クラシック",
    toolbarStyleLiquidGlass: "iOS Liquid Glass",
    toolbarStyleHint: "選択は自動保存され、次回も適用されます。",
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
    cycleZoom: "ズーム切替：50% → 80% → 100%",
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
    textGuideTitle: "Selecione texto nas imagens",
    textGuideIntro: "Reconheça texto em inglês e chinês simplificado e selecione e copie como em uma página da web.",
    textGuideRecognize: "Clique no botão Selecionar texto destacado e aguarde o reconhecimento.",
    textGuideSelect: "Arraste para selecionar o texto e pressione Ctrl+C / ⌘C para copiar.",
    textGuideCopyAll: "Use Copiar tudo para copiar todo o texto da imagem de uma vez.",
    textGuideExit: "Clique novamente no botão de seleção para voltar a arrastar a imagem.",
    textGuideStart: "Começar seleção",
    textGuideContinue: "Continuar seleção",
    textGuideDismiss: "Entendi",
    textGuideHelp: "Guia de seleção de texto",
    noTextFound: "Nenhum texto encontrado.",
    copyTextFailed: "Falha ao copiar. Selecione o texto e pressione Ctrl+C / ⌘C.",

    close: "Fechar",
    currentZoom: "Zoom atual",
    defaultImageAlt: "Imagem do X",
    dialogLabel: "Visualizador aprimorado de imagens do X",
    imagePosition: "Posição da imagem",
    imageOverview: "Visão geral da imagem. Clique ou arraste para navegar.",
    loadingImage: "Carregando imagem...",
    toolbarPosition: "Posição da barra de ferramentas",
    toolbarPositionTop: "Em cima",
    toolbarPositionBottom: "Embaixo",
    toolbarSettings: "Configurações da barra de ferramentas",
    toolbarStyle: "Estilo da barra de ferramentas",
    toolbarStyleClassic: "Clássico",
    toolbarStyleLiquidGlass: "Liquid Glass do iOS",
    toolbarStyleHint: "Sua escolha é salva automaticamente para as próximas sessões.",
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
    cycleZoom: "Alternar zoom: 50% → 80% → 100%",
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
    textGuideTitle: "选中图片里的文字",
    textGuideIntro: "识别图片中的简体中文和英文，再拖动选中复制。",
    textGuideRecognize: "点击高亮的「选择文字」按钮，等待识别完成。",
    textGuideSelect: "拖动选中文字，按 Ctrl+C / ⌘C 复制。",
    textGuideCopyAll: "点击「复制全部」，可一次复制整张图片的文字。",
    textGuideExit: "再次点击选字按钮即可退出，恢复拖动浏览。",
    textGuideStart: "开始选字",
    textGuideContinue: "继续选字",
    textGuideDismiss: "知道了",
    textGuideHelp: "文字选中指南",
    noTextFound: "未识别到文字。",
    copyTextFailed: "复制失败，请选中文字后按 Ctrl+C / ⌘C。",

    close: "关闭",
    currentZoom: "当前缩放",
    defaultImageAlt: "X 图片",
    dialogLabel: "增强版 X 图片查看器",
    imagePosition: "图片位置",
    imageOverview: "图片缩略导航。点击或拖动可快速定位。",
    loadingImage: "正在加载图片...",
    toolbarPosition: "工具栏位置",
    toolbarPositionTop: "顶部",
    toolbarPositionBottom: "底部",
    toolbarSettings: "工具栏设置",
    toolbarStyle: "工具栏样式",
    toolbarStyleClassic: "经典",
    toolbarStyleLiquidGlass: "iOS 液态玻璃",
    toolbarStyleHint: "选择后自动保存，下次打开时继续使用。",
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
    cycleZoom: "切换缩放：50% → 80% → 100%",
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
