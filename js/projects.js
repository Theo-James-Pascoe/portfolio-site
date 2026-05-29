/**
 * プロジェクトデータ — 各項目を実際の作品に合わせて編集してください。
 *
 * image: images/ フォルダ内のファイル名（推奨: 16:9, 約 800×450px）
 * github: リポジトリの URL
 */
const PROJECTS = [
  {
    id: 1,
    title: "プロジェクト 1",
    summary: "一行で伝わる短い説明文をここに書きます。",
    description:
      "ここに作品の背景、自分の役割、使用技術、工夫した点、成果などを 2〜4 文で書きます。採用担当の方が読みやすいよう、具体的な数値や課題解決の流れがあると良いです。",
    tags: ["独自開発", "AI開発", "Python"],
    image: "images/project-01.jpg",
    github: "https://github.com/YOUR_USERNAME/project-1",
  },
  {
    id: 2,
    title: "プロジェクト 2",
    summary: "一行で伝わる短い説明文をここに書きます。",
    description: "詳細説明を記載してください。",
    tags: ["独自開発", "C++"],
    image: "images/project-02.jpg",
    github: "https://github.com/YOUR_USERNAME/project-2",
  },
  {
    id: 3,
    title: "プロジェクト 3",
    summary: "一行で伝わる短い説明文をここに書きます。",
    description: "詳細説明を記載してください。",
    tags: ["チーム開発", "C", "UNIX"],
    image: "images/project-03.jpg",
    github: "https://github.com/YOUR_USERNAME/project-3",
  },
  {
    id: 4,
    title: "プロジェクト 4",
    summary: "一行で伝わる短い説明文をここに書きます。",
    description: "詳細説明を記載してください。",
    tags: ["独自開発", "Assembly"],
    image: "images/project-04.jpg",
    github: "https://github.com/YOUR_USERNAME/project-4",
  },
  {
    id: 5,
    title: "プロジェクト 5",
    summary: "一行で伝わる短い説明文をここに書きます。",
    description: "詳細説明を記載してください。",
    tags: ["チーム開発", "プロジェクト管理"],
    image: "images/project-05.jpg",
    github: "https://github.com/YOUR_USERNAME/project-5",
  },
  {
    id: 6,
    title: "プロジェクト 6",
    summary: "一行で伝わる短い説明文をここに書きます。",
    description: "詳細説明を記載してください。",
    tags: ["独自開発", "AI開発", "Python"],
    image: "images/project-06.jpg",
    github: "https://github.com/YOUR_USERNAME/project-6",
  },
  {
    id: 7,
    title: "プロジェクト 7",
    summary: "一行で伝わる短い説明文をここに書きます。",
    description: "詳細説明を記載してください。",
    tags: ["独自開発", "C", "UNIX"],
    image: "images/project-07.jpg",
    github: "https://github.com/YOUR_USERNAME/project-7",
  },
  {
    id: 8,
    title: "プロジェクト 8",
    summary: "一行で伝わる短い説明文をここに書きます。",
    description: "詳細説明を記載してください。",
    tags: ["独自開発", "Java"],
    image: "images/project-08.jpg",
    github: "https://github.com/YOUR_USERNAME/project-8",
  },
  {
    id: 9,
    title: "プロジェクト 9",
    summary: "一行で伝わる短い説明文をここに書きます。",
    description: "詳細説明を記載してください。",
    tags: ["独自開発", "HTML", "CSS", "JavaScript"],
    image: "images/project-09.jpg",
    github: "https://github.com/YOUR_USERNAME/project-9",
  },
  {
    id: 10,
    title: "プロジェクト 10",
    summary: "一行で伝わる短い説明文をここに書きます。",
    description: "詳細説明を記載してください。",
    tags: ["独自開発", "C#"],
    image: "images/project-10.jpg",
    github: "https://github.com/YOUR_USERNAME/project-10",
  },
];

/** カード表示時に先頭へ（独自開発を最優先） */
const CARD_TAG_PRIORITY = ["独自開発", "チーム開発"];

/** その他タグの表示順 */
const TAG_ORDER = [
  "AI開発",
  "UNIX",
  "プロジェクト管理",
  "C++",
  "C#",
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
  "C#": "csharp",
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
    tags: ["AI開発", "プロジェクト管理", "UNIX"],
  },
  {
    title: "言語",
    tags: [
      "C++",
      "C#",
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
