/**
 * プロジェクトデータ — 各項目を実際の作品に合わせて編集してください。
 *
 * image: カード用のサムネイル（images/ フォルダ内、推奨: 16:9, 約 800×450px）
 * images: 詳しく見るモーダル内のカルーセル [{ src, description }, ...]
 * github: リポジトリの URL
 * sections: 詳しく見るモーダル内の見出しと説明文（3つ）
 */
const DEFAULT_IMAGE_DESCRIPTION =
  "ここに画像の説明文を記載してください。スクリーンショットの内容、画面の見どころ、デモで確認できる機能などを簡潔に書くと効果的です。";

function createProjectImages(primaryImage) {
  return [
    { src: primaryImage, description: DEFAULT_IMAGE_DESCRIPTION },
    {
      src: "images/placeholder.svg",
      description:
        "2枚目のスクリーンショットの説明をここに記載してください。",
    },
    {
      src: "images/placeholder.svg",
      description:
        "3枚目のスクリーンショットの説明をここに記載してください。",
    },
  ];
}

function getProjectImages(project) {
  if (project.images && project.images.length > 0) {
    return project.images;
  }

  return [
    {
      src: project.image,
      description: project.imageDescription || DEFAULT_IMAGE_DESCRIPTION,
    },
  ];
}

const DEFAULT_SECTIONS = [
  {
    heading: "ヘッダー 1",
    text:
      "このセクションには、プロジェクトの背景や取り組んだきっかけを記載します。就職活動では「なぜそのテーマに取り組んだのか」が伝わると、作品の意図が採用担当の方に理解されやすくなります。課題意識、学習の動機、解決したい問題などを具体的に書いてください。例えば、授業や個人的な興味から発展したのか、実務やアルバイトで感じた課題が起点なのかを明確にすると説得力が増します。\n\n開発を始める前にどのような調査や比較を行ったかも補足すると、計画的に取り組んだ印象を与えられます。既存の類似サービスやオープンソースの実装をどのように検討したか、採用しなかった選択肢とその理由があれば併記してください。ターゲットユーザーを誰に想定していたか、利用シーンをどのように描いたかも有効です。\n\nまた、プロジェクトの期間やマイルストーン、最初に立てた目標と実際の進め方の違いなども書くと、振り返りの深さが伝わります。チーム開発であればキックオフの経緯や役割分担の決め方、個人開発であれば学習計画と並行した進め方など、状況に応じた背景を書いてください。読み手が開発の全体像を把握しやすくなるよう、時系列で簡潔にまとめると読みやすくなります。",
  },
  {
    heading: "ヘッダー 2",
    text:
      "このセクションには、自分の役割や使用した技術、実装のポイントを記載します。チーム開発の場合は担当範囲を、個人開発の場合は設計から実装、テストまでの流れを書くと良いでしょう。使用した言語やフレームワーク、ライブラリ、開発環境、バージョン管理の方法なども併記してください。\n\n単に技術名を並べるだけでなく、「なぜその技術を選んだか」「どの部分でどう活用したか」を説明すると、技術選定の判断力が伝わります。工夫したアルゴリズム、UI、パフォーマンス改善、エラーハンドリング、セキュリティ対策など、読み手が興味を持ちそうな具体例を交えると効果的です。データの流れやモジュール構成を文章で説明し、必要であれば設計上のトレードオフにも触れてください。\n\n実装の過程で直面した技術的な課題と、その解決方法も記載すると説得力が高まります。デバッグに要した時間、参考にしたドキュメントや記事、試行錯誤の結果どの方針を採用したかなど、具体的なエピソードがあると印象に残りやすくなります。テスト方針やコードレビューの運用、CI の有無など開発プロセスについても触れると、工程全体の理解が伝わります。",
  },
  {
    heading: "ヘッダー 3",
    text:
      "このセクションには、成果や学び、今後の展望を記載します。完成した機能のデモ内容、定量できる結果（処理時間の短縮、ユーザー数、テスト通過率など）、開発を通じて得たスキルや反省点を書いてください。うまくいかなかった点と、その原因・対策も正直に書くと信頼感につながります。\n\n採用担当の方は完璧な作品より、課題を認識し改善できる姿勢を評価する場合も多いです。機能の完成度だけでなく、品質・保守性・拡張性の観点で何を優先し、何を後回しにしたかも書くと、エンジニアとしての考え方が伝わります。ユーザーフィードバックや自己評価、今後追加したい機能のメモがあれば併記してください。\n\n最後に、このプロジェクトで培った経験を今後どう活かしたいか、関連する分野への関心などを添えると、意欲が伝わりやすくなります。必要に応じてスクリーンショットやデモ動画への言及もここに含めてください。就職後や次の作品で挑戦したい技術、深めたい領域があれば、前向きな締めくくりとして記載すると効果的です。振り返りを通じて成長した点を一言でまとめ、読み手に鮮明な印象を残すように意識してください。",
  },
];

function copySections() {
  return DEFAULT_SECTIONS.map((section) => ({ ...section }));
}

const PROJECTS = [
  {
    id: 1,
    title: "プロジェクト 1",
    summary: "一行で伝わる短い説明文をここに書きます。",
    sections: copySections(),
    tags: ["独自開発", "AI開発", "Python"],
    image: "images/project-01.jpg",
    images: createProjectImages("images/project-01.jpg"),
    github: "https://github.com/YOUR_USERNAME/project-1",
  },
  {
    id: 2,
    title: "プロジェクト 2",
    summary: "一行で伝わる短い説明文をここに書きます。",
    sections: copySections(),
    tags: ["独自開発", "C++"],
    image: "images/project-02.jpg",
    images: createProjectImages("images/project-02.jpg"),
    github: "https://github.com/YOUR_USERNAME/project-2",
  },
  {
    id: 3,
    title: "プロジェクト 3",
    summary: "一行で伝わる短い説明文をここに書きます。",
    sections: copySections(),
    tags: ["チーム開発", "C", "UNIX"],
    image: "images/project-03.jpg",
    images: createProjectImages("images/project-03.jpg"),
    github: "https://github.com/YOUR_USERNAME/project-3",
  },
  {
    id: 4,
    title: "プロジェクト 4",
    summary: "一行で伝わる短い説明文をここに書きます。",
    sections: copySections(),
    tags: ["独自開発", "Assembly"],
    image: "images/project-04.jpg",
    images: createProjectImages("images/project-04.jpg"),
    github: "https://github.com/YOUR_USERNAME/project-4",
  },
  {
    id: 5,
    title: "プロジェクト 5",
    summary: "一行で伝わる短い説明文をここに書きます。",
    sections: copySections(),
    tags: ["チーム開発", "プロジェクト管理"],
    image: "images/project-05.jpg",
    images: createProjectImages("images/project-05.jpg"),
    github: "https://github.com/YOUR_USERNAME/project-5",
  },
  {
    id: 6,
    title: "プロジェクト 6",
    summary: "一行で伝わる短い説明文をここに書きます。",
    sections: copySections(),
    tags: ["独自開発", "AI開発", "Python"],
    image: "images/project-06.jpg",
    images: createProjectImages("images/project-06.jpg"),
    github: "https://github.com/YOUR_USERNAME/project-6",
  },
  {
    id: 7,
    title: "プロジェクト 7",
    summary: "一行で伝わる短い説明文をここに書きます。",
    sections: copySections(),
    tags: ["独自開発", "C", "UNIX"],
    image: "images/project-07.jpg",
    images: createProjectImages("images/project-07.jpg"),
    github: "https://github.com/YOUR_USERNAME/project-7",
  },
  {
    id: 8,
    title: "プロジェクト 8",
    summary: "一行で伝わる短い説明文をここに書きます。",
    sections: copySections(),
    tags: ["独自開発", "Java"],
    image: "images/project-08.jpg",
    images: createProjectImages("images/project-08.jpg"),
    github: "https://github.com/YOUR_USERNAME/project-8",
  },
  {
    id: 9,
    title: "プロジェクト 9",
    summary: "一行で伝わる短い説明文をここに書きます。",
    sections: copySections(),
    tags: ["独自開発", "HTML", "CSS", "JavaScript"],
    image: "images/project-09.jpg",
    images: createProjectImages("images/project-09.jpg"),
    github: "https://github.com/YOUR_USERNAME/project-9",
  },
];

/** カード表示時に先頭へ（独自開発を最優先） */
const CARD_TAG_PRIORITY = ["独自開発", "チーム開発"];

/** その他タグの表示順 */
const TAG_ORDER = [
  "AI開発",
  "プロジェクト管理",
  "UNIX",
  "C++",
  "C",
  "Assembly",
  "Java",
  "Python",
  "HTML",
  "CSS",
  "JavaScript",
];

/** タグ → CSS クラス用スラッグ */
const TAG_SLUGS = {
  独自開発: "dokuji-kaihatsu",
  チーム開発: "team-kaihatsu",
  "AI開発": "ai-kaihatsu",
  プロジェクト管理: "project-kanri",
  UNIX: "unix",
  "C++": "cpp",
  C: "c",
  Assembly: "assembly",
  Java: "java",
  Python: "python",
  HTML: "html",
  CSS: "css",
  JavaScript: "javascript",
};

/** 絞り込みエリアの3列グループ */
const TAG_FILTER_GROUPS = [
  {
    title: "開発環境",
    tags: ["独自開発", "チーム開発"],
  },
  {
    title: "分野",
    tags: ["AI開発", "UNIX", "プロジェクト管理"],
  },
  {
    title: "言語",
    tags: [
      "C++",
      "C",
      "Assembly",
      "Java",
      "Python",
      "HTML",
      "CSS",
      "JavaScript",
    ],
  },
];

/** 指定順でタグを並べ替える（カード・モーダル用） */
function sortTags(tags) {
  const order = new Map();
  CARD_TAG_PRIORITY.forEach((tag, index) => order.set(tag, index));
  TAG_ORDER.forEach((tag, index) => {
    if (!order.has(tag)) order.set(tag, CARD_TAG_PRIORITY.length + index);
  });

  return [...tags].sort(
    (a, b) => (order.get(a) ?? Number.MAX_SAFE_INTEGER) - (order.get(b) ?? Number.MAX_SAFE_INTEGER)
  );
}

function getTagSlug(tag) {
  if (TAG_SLUGS[tag]) return TAG_SLUGS[tag];
  return tag
    .toLowerCase()
    .replace(/\+\+/g, "pp")
    .replace(/#/g, "sharp")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** フッターの GitHub プロフィール URL */
const PROFILE_GITHUB = "https://github.com/YOUR_USERNAME";
