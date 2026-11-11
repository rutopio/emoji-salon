import type { Locale } from "./locale";

interface AboutCopy {
  heading: string;
  intro: string;
  how: string;
  howIntro: string;
  steps: string[];
  accessibility: string;
  accessIntro: string;
  challenges: string;
  challengesIntro: string;
  challengesList: string[];
  examples: string;
  flagsIntro: string;
  flags: string[];
  heartsIntro: string;
  hearts: string[];
  help: string;
  helpIntro: string;
  helpList: string[];
  helpOutro: string;
  seeMore: string;
  copyright: string;
  graphics: string;
  badgeAlt: string;
  graphicPrefix: string;
  graphicMiddle: string;
  graphicSuffix: string;
  graphicsTerms: string;
  graphicsNoCopyright: string;
  code: string;
  codePrefix: string;
  codeSuffix: string;
  openSource: string;
}

export const aboutCopy: Record<Locale, AboutCopy> = {
  en: {
    heading: "About",
    intro:
      "EmojiSalon lets you change the colors of any emoji — like giving it a makeover or a fresh coat of paint.",
    how: "How it works",
    howIntro:
      "EmojiSalon uses Twemoji artwork. Pick an emoji and change its colors in 3 steps:",
    steps: [
      "Pick an emoji from the picker, or choose Random Emoji.",
      "Use the color swatches to change its palette. Choose Reset Palette to go back to the original colors.",
      "Save or share what you made. On desktop, Save Image lets you choose SVG, PNG, JPG, or Copy. On smaller screens it copies the image directly. Share Link creates a URL that includes your emoji and color choices.",
    ],
    accessibility: "Accessibility",
    accessIntro:
      "People see and tell colors apart in different ways. Recoloring can make an emoji easier to recognize, but the effect depends on the person, the emoji, and the display size.",
    challenges: "What makes emoji hard to tell apart",
    challengesIntro:
      "Color vision differences or low vision can make some emoji harder to tell apart:",
    challengesList: [
      "similar colors can make parts of an emoji blend together",
      "emoji that differ only by color can look the same",
      "fine details disappear when an emoji is shown at a small size",
    ],
    examples: "Examples of similar emoji",
    flagsIntro: "Some flag emoji have similar color schemes:",
    flags: [
      "🇮🇹 Italy / 🇮🇪 Ireland",
      "🇷🇴 Romania / 🇹🇩 Chad",
      "🇱🇻 Latvia / 🇦🇹 Austria",
      "🇲🇨 Monaco / 🇮🇩 Indonesia",
    ],
    heartsIntro: "Heart emoji also rely on color alone to show a difference:",
    hearts: [
      "❤️ Red / 💜 Purple",
      "💙 Blue / 💜 Purple",
      "💚 Green / 🧡 Orange",
    ],
    help: "How recoloring may help",
    helpIntro:
      "EmojiSalon lets you try colors that work better for you or your audience. You can:",
    helpList: [
      "raise the contrast between parts of an emoji",
      "use more distinct colors so similar emoji are easier to tell apart",
    ],
    helpOutro:
      "These changes only apply to the images you save or share. They do not change the emoji on your device’s keyboard. If an emoji carries meaning, pair it with a text label or alt text.",
    seeMore: "See more",
    copyright: "Copyright and license",
    graphics: "Graphics",
    badgeAlt: "Creative Commons Attribution 4.0 International License badge",
    graphicPrefix: "Your creation is based on ",
    graphicMiddle: ", whose artwork is licensed under ",
    graphicSuffix: ".",
    graphicsTerms:
      "You can share, remix, and build on the artwork in any medium or format, as long as you credit the original creator. Commercial use is allowed.",
    graphicsNoCopyright:
      "The creator of EmojiSalon holds no copyright over what you make.",
    code: "Code",
    codePrefix: "Code licensed under the ",
    codeSuffix: ".",
    openSource: "Open source",
  },
  "zh-TW": {
    heading: "關於",
    intro:
      "EmojiSalon 讓你自由改變表情符號的顏色，就像替它換個造型、重新上色。",
    how: "使用方式",
    howIntro:
      "EmojiSalon 使用 Twemoji 圖像。選好表情符號後，只要三個步驟就能改色：",
    steps: [
      "從選擇器挑選表情符號，或使用「隨機表情符號」。",
      "用色票調整配色。想恢復原本顏色，選擇「重設配色」。",
      "儲存或分享作品。在桌面裝置上，「儲存圖片」可選擇 SVG、PNG、JPG 或複製；在較小的螢幕上則會直接複製圖片。「分享連結」會產生包含表情符號與配色的網址。",
    ],
    accessibility: "無障礙",
    accessIntro:
      "每個人看見與分辨顏色的方式不同。改色有時能讓表情符號更容易辨識，但效果仍取決於使用者、表情符號，以及顯示尺寸。",
    challenges: "表情符號為什麼難以區分",
    challengesIntro: "色覺差異或低視能可能讓某些表情符號更難分辨：",
    challengesList: [
      "相近的顏色可能讓表情符號的各個部分混在一起",
      "僅有顏色不同的表情符號可能看起來一樣",
      "表情符號縮小顯示時，細節可能消失",
    ],
    examples: "相似表情符號的例子",
    flagsIntro: "有些國旗表情符號的配色很相近：",
    flags: [
      "🇮🇹 義大利／🇮🇪 愛爾蘭",
      "🇷🇴 羅馬尼亞／🇹🇩 查德",
      "🇱🇻 拉脫維亞／🇦🇹 奧地利",
      "🇲🇨 摩納哥／🇮🇩 印尼",
    ],
    heartsIntro: "愛心表情符號也只靠顏色表達差異：",
    hearts: ["❤️ 紅色／💜 紫色", "💙 藍色／💜 紫色", "💚 綠色／🧡 橘色"],
    help: "改色可能帶來的幫助",
    helpIntro: "EmojiSalon 讓你試試更適合自己或讀者的顏色，例如：",
    helpList: [
      "提高表情符號不同部分之間的對比",
      "使用差異更明顯的顏色，讓相似的表情符號更容易區分",
    ],
    helpOutro:
      "改色只會套用到你儲存或分享的圖片，不會改變裝置鍵盤上的表情符號。如果表情符號承載重要資訊，請搭配文字標籤或替代文字。",
    seeMore: "延伸閱讀",
    copyright: "著作權與授權",
    graphics: "圖像",
    badgeAlt: "創用 CC 姓名標示 4.0 國際授權標章",
    graphicPrefix: "你的作品以 ",
    graphicMiddle: " 圖像為基礎，其圖像採用 ",
    graphicSuffix: " 授權。",
    graphicsTerms:
      "只要標示原始作者，就能在任何媒介或格式分享、改作與使用這些圖像，包含商業用途。",
    graphicsNoCopyright: "EmojiSalon 的製作者不主張你所創作作品的著作權。",
    code: "程式碼",
    codePrefix: "程式碼採用 ",
    codeSuffix: " 授權。",
    openSource: "開放原始碼",
  },
  ja: {
    heading: "概要",
    intro:
      "EmojiSalon では、絵文字の色を自由に変えられます。絵文字を着せ替えたり、塗り直したりするような感覚です。",
    how: "使い方",
    howIntro:
      "EmojiSalon は Twemoji の画像を使用しています。絵文字を選び、次の 3 ステップで色を変えられます。",
    steps: [
      "ピッカーから絵文字を選ぶか、「絵文字をランダムに選ぶ」を使います。",
      "色見本で配色を変更します。元の色に戻すには「配色をリセット」を選びます。",
      "作品を保存または共有します。デスクトップでは「画像を保存」から SVG、PNG、JPG、コピーを選べます。小さい画面では画像を直接コピーします。「リンクを共有」を使うと、絵文字と配色を含む URL が作られます。",
    ],
    accessibility: "アクセシビリティ",
    accessIntro:
      "色の見え方や見分け方は人によって異なります。色を変えると絵文字を認識しやすくなる場合がありますが、効果は人や絵文字、表示サイズによって変わります。",
    challenges: "絵文字を見分けにくい理由",
    challengesIntro:
      "色覚の違いやロービジョンによって、次のような絵文字は見分けにくくなる場合があります。",
    challengesList: [
      "似た色が使われていると、絵文字の各部分が一体に見える",
      "色だけが異なる絵文字は、同じように見える",
      "小さく表示すると細部が見えなくなる",
    ],
    examples: "似ている絵文字の例",
    flagsIntro: "配色が似ている国旗の絵文字があります。",
    flags: [
      "🇮🇹 イタリア／🇮🇪 アイルランド",
      "🇷🇴 ルーマニア／🇹🇩 チャド",
      "🇱🇻 ラトビア／🇦🇹 オーストリア",
      "🇲🇨 モナコ／🇮🇩 インドネシア",
    ],
    heartsIntro: "ハートの絵文字も、色だけで違いを表しています。",
    hearts: ["❤️ 赤／💜 紫", "💙 青／💜 紫", "💚 緑／🧡 オレンジ"],
    help: "色の変更でできること",
    helpIntro:
      "EmojiSalon では、自分や見る人にとって分かりやすい色を試せます。例えば、",
    helpList: [
      "絵文字の各部分のコントラストを高める",
      "はっきり異なる色を使い、似た絵文字を見分けやすくする",
    ],
    helpOutro:
      "変更した色は保存または共有する画像にのみ反映され、端末のキーボードにある絵文字は変わりません。絵文字で意味を伝える場合は、文字のラベルや代替テキストも添えてください。",
    seeMore: "参考資料",
    copyright: "著作権とライセンス",
    graphics: "画像",
    badgeAlt: "クリエイティブ・コモンズ 表示 4.0 国際ライセンスのバッジ",
    graphicPrefix: "作品は ",
    graphicMiddle: " の画像を基にしています。この画像は ",
    graphicSuffix: " でライセンスされています。",
    graphicsTerms:
      "元の作者を表示すれば、どの媒体や形式でも共有、改変、利用できます。商用利用も可能です。",
    graphicsNoCopyright:
      "EmojiSalon の制作者は、あなたが作った作品の著作権を主張しません。",
    code: "コード",
    codePrefix: "コードは ",
    codeSuffix: " でライセンスされています。",
    openSource: "オープンソース",
  },
};
