# Chrome Web Store Listing

## Product Details

Extension name:
X Long Image Viewer

Short description:
View long X/Twitter images with zoom and scrolling, and select and copy image text.

Category:
Productivity

Language:
English

## Detailed Description

X Long Image Viewer improves how long images open on X/Twitter.

When you click an image from x.com or twitter.com, the extension opens the original media file in a focused full-page viewer. It is designed for comics, screenshots, infographics, chat captures, and other tall images that are hard to inspect in the default media preview.

Features:
- Select and copy recognized English and Simplified Chinese text directly from an image, or copy all recognized text.
- Opens X/Twitter media images at original quality when available.
- Shows the cached page preview immediately while the original image loads and decodes in the background.
- Automatically fits and centers images within the available viewport.
- Navigates between every image in a multi-image post without closing the viewer.
- Shows convenient edge navigation in wide windows and preloads neighboring images for faster browsing.
- Lets users place the toolbar at the top or bottom and remembers the selected position.
- Provides smooth animated zoom from the toolbar, keyboard, double-click, or Ctrl/Command + mouse wheel.
- Keeps normal mouse wheel scrolling for reading tall images.
- Shows an interactive overview when the image is sufficiently enlarged and lets users keep it in either lower corner.
- Hides horizontal scrollbars while keeping horizontal navigation available through dragging, arrow keys, and the overview.
- Supports keyboard controls: Esc to close, + and - to zoom, 0 to reset, arrow keys to nudge.
- Runs only on x.com and twitter.com.
- No account access, no tracking, no analytics, and no remote service.

## Store Form Answers

Single purpose:
This extension provides an enhanced viewer for long images on X/Twitter, making tall media easier to read with scrolling, zooming, panning, and image text selection.

Permission justification:
The extension requests host access for https://x.com/* and https://twitter.com/* so its content script can detect clicked media images and open the enhanced viewer on those sites.

Additional host permission justification:
Access to https://pbs.twimg.com/* downloads the selected media image for on-device text recognition only.

Offscreen permission justification:
The offscreen document runs the bundled OCR engine in a Web Worker without uploading images or recognized text.

Storage permission justification:
The extension uses Chrome storage only to remember local viewer preferences and rating prompt state, including the selected toolbar and overview positions, viewer open count, reminder cooldown, and whether the user already rated or dismissed the prompt. This data stays in the browser and is not transmitted.

Remote code:
The extension does not use remote code. All JavaScript and CSS are bundled in the extension package.

Data usage:
The extension reads the selected image URL and fetches that image from X/Twitter’s image host to display it and optionally recognize text locally. OCR results are cached temporarily in page memory and copied only at the user’s request. No images or recognized text are sent to the developer or an OCR service.

Privacy policy summary:
X Long Image Viewer does not collect personal information, browsing history, authentication data, or page content. Recognition runs in the browser; the selected image is requested from X/Twitter’s image host and is not sent to an OCR service.

## Chinese Listing Draft

扩展名称：
X Long Image Viewer

简短描述：
在 X/Twitter 上浏览长图、缩放和拖动，并选中复制图片中的文字。

详细描述：
X Long Image Viewer 用于改善 X/Twitter 长图浏览体验。点击 x.com 或 twitter.com 中的媒体图片后，扩展会以专注的全屏查看器打开原始图片，适合阅读漫画、截图、信息图、聊天记录截图等较长图片。

主要功能：
- 识别图片中的英文和简体中文，直接选中复制文字，或一键复制全部识别结果。
- 尽可能打开 X/Twitter 原始质量图片。
- 立即显示页面中已经缓存的预览图，并在后台加载和解码原图后无缝替换。
- 图片打开时自动适应窗口大小并上下左右居中。
- 无需关闭查看器即可浏览多图帖中的上一张或下一张图片。
- 宽屏下在页面左右两侧显示翻页按钮，并预加载相邻图片以加快切换速度。
- 控制栏可以放在页面顶部或底部，并自动记住选择。
- 工具栏、键盘、双击以及 Ctrl/Command + 滚轮缩放均带有平滑动画。
- 普通滚轮用于上下阅读长图，按住 Ctrl/Command 后滚轮用于缩放。
- 图片放大到超出视窗一定程度时显示缩略导航，支持点击、拖动定位，可放在左下角或右下角。
- 始终隐藏横向滚动条，同时保留拖拽、方向键和缩略图横向导航。
- 支持键盘操作：Esc 关闭，+/- 缩放，0 重置，方向键微调位置。
- 仅在 x.com 和 twitter.com 运行。
- 不读取账号数据，不跟踪，不包含分析服务，不依赖远程服务。

## Japanese Listing Draft

Extension name:
X Long Image Viewer

Short description:
X/Twitter の縦長画像をスクロール・ズームし、画像内の文字を選択してコピー。

Detailed description:
X Long Image Viewer は、X/Twitter で縦長画像を読みやすくする拡張機能です。x.com または twitter.com のメディア画像をクリックすると、元画像を集中して見られる全画面ビューアで開きます。漫画、スクリーンショット、インフォグラフィック、チャット履歴など、標準のメディアプレビューでは見づらい縦長画像に向いています。

Features:
- 画像内の英語・簡体字中国語を認識し、選択してコピー、または全文をコピーできます。
- 利用可能な場合は X/Twitter の元品質画像を開きます。
- ページ内のキャッシュ済みプレビューをすぐに表示し、元画像をバックグラウンドで読み込み・デコードしてから切り替えます。
- 画像を表示領域に自動で合わせ、上下左右の中央に配置します。
- ビューアを閉じずに、複数画像の投稿内を前後に移動できます。
- 幅の広い画面では左右に移動ボタンを表示し、前後の画像を事前読み込みします。
- ツールバーを上部または下部に配置でき、選択した位置を保存します。
- ツールバー、キーボード、ダブルクリック、Ctrl/Command + マウスホイールから滑らかにズームできます。
- 通常のマウスホイール操作では縦長画像を上下にスクロールします。
- 画像が十分に拡大されたときに操作可能な全体表示を表示し、左右どちらかの下隅に配置できます。
- 横スクロールバーを常に非表示にしながら、ドラッグ、矢印キー、全体表示で横方向に移動できます。
- キーボード操作に対応します: Esc で閉じる、+/- でズーム、0 でリセット、矢印キーで位置調整。
- x.com と twitter.com でのみ動作します。
- アカウント情報の読み取り、追跡、分析、外部サービスへの送信は行いません。

## Brazilian Portuguese Listing Draft

Extension name:
X Long Image Viewer

Short description:
Veja imagens longas no X/Twitter com zoom e rolagem, e selecione e copie o texto da imagem.

Detailed description:
O X Long Image Viewer melhora a visualização de imagens longas no X/Twitter. Ao clicar em uma imagem de mídia no x.com ou twitter.com, a extensão abre o arquivo original em um visualizador focado em tela cheia. Ela foi criada para quadrinhos, capturas de tela, infográficos, registros de conversa e outras imagens altas que são difíceis de inspecionar na prévia padrão de mídia.

Features:
- Reconhece inglês e chinês simplificado nas imagens para selecionar e copiar o texto, ou copiar tudo.
- Abre imagens de mídia do X/Twitter na qualidade original quando disponível.
- Mostra imediatamente a prévia já armazenada em cache enquanto carrega e decodifica a imagem original em segundo plano.
- Ajusta e centraliza automaticamente as imagens na área disponível da janela.
- Navega entre todas as imagens de uma publicação sem fechar o visualizador.
- Mostra botões de navegação nas laterais em janelas largas e pré-carrega imagens vizinhas.
- Permite colocar a barra de ferramentas na parte superior ou inferior e salva a posição escolhida.
- Oferece zoom animado e suave pela barra de ferramentas, teclado, clique duplo ou Ctrl/Command + roda do mouse.
- Mantém a rolagem vertical normal da roda do mouse para a leitura de imagens altas.
- Mostra uma visão geral interativa quando a imagem está suficientemente ampliada e permite posicioná-la em qualquer canto inferior.
- Oculta a barra de rolagem horizontal, mantendo a navegação por arrasto, setas e visão geral.
- Suporta atalhos de teclado: Esc para fechar, + e - para zoom, 0 para redefinir e setas para ajustar a posição.
- Funciona apenas em x.com e twitter.com.
- Não acessa dados da conta, não rastreia, não usa analytics e não depende de serviço remoto.

## Release Notes

### 2.0.0

- Added image text recognition with selectable English and Simplified Chinese text and a copy-all action.
- Redesigned the toolbar with compact controls and accessible hints.
- Show the overview only when the image is sufficiently enlarged; prevent horizontal overview movement when the image fits the viewport width.
- Improved handling of extension reloads and routine recognition diagnostics.

### 1.2.1

- Fixed the X/Twitter timeline jumping back to the top after closing the image viewer.

### 1.2.0

- Added smooth animated zoom for toolbar, keyboard, double-click, and Ctrl/Command + mouse wheel controls.
- Added an interactive viewport overview with click-and-drag navigation and a persistent lower-left or lower-right position.
- Restored normal vertical mouse wheel scrolling when no zoom modifier is held.
- Removed horizontal scrollbar chrome at every zoom level while preserving drag, keyboard, and overview navigation.

### 1.1.0

- Added progressive image loading with an immediate cached preview and background original-image decoding.
- Added low-priority preloading for adjacent images in multi-image posts.
- Added left and right edge navigation controls for wide windows.
- Added a persistent toolbar position setting for switching between the top and bottom of the viewer.

### 1.0.3

- Added navigation for multi-image posts.
- Improved the toolbar layout in narrow windows while keeping Open and Close visible.
- Images now fit the available viewport and center both vertically and horizontally when opened or reset.
- Removed the enlarged-image flash during loading.
- Added localized extension metadata and an optional local rating prompt.
