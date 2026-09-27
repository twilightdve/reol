// /about/data/(集計ルール)ページ専用の辞書(plan/28 第2弾)。中国語・韓国語は機械翻訳。
// 段落中の `...` は <code> で表示する(ページ側で分割して描画)。
import type { SiteLang } from "../langs";

type Section = { id: string; title: string; paragraphs: string[] };

const ja = {
  title: "集計ルールについて",
  metaDescription:
    "TOPページや楽曲統計・開催地マップに表示される楽曲数・公演数・演奏回数の定義と算出方法を説明します。",
  intro:
    "TOPページや各種統計ページに出てくる数字(楽曲数・公演数・演奏回数など)は、見る場所によって定義が異なるため単純比較できません。このページでは、それぞれの数字が「何を・どう数えているか」を説明します。",
  sections: [
    {
      id: "about-data-songs",
      title: "楽曲数(SONGS)",
      paragraphs: [
        "TOPの「SONGS」および `/songs/stats/` の行数は、楽曲マスタを名寄せした後の代表曲の件数です。",
        "「煽げや尊し(Agitate)」と「煽げや尊し」のように、同じ曲がシングル・アルバム収録・ライブ映像等の複数リリースにまたがって別レコードで登録されている場合、副題(括弧書き)を除いた曲名でグルーピングし、最も古いリリースを代表として1件にまとめています。「mede:mede」と「mede:mede -JJJ Remix-」のように括弧書きでない別バージョンは、別曲として区別したままです。",
        "演奏回数(後述)も、この代表曲単位で合算しています。同じ曲の別リリース表記でセットリストに登場した演奏は、すべて代表曲の演奏回数としてカウントされます。",
      ],
    },
    {
      id: "about-data-lives",
      title: "公演数(LIVES)",
      paragraphs: [
        "TOPの「LIVES」は、ツアーやイベントに含まれる個別の公演日(会場×開催日)の件数です。`/live/` の一覧件数はツアー・イベント単位のため、公演数より少なくなります(1つのツアーに複数公演が含まれるため)。",
        "開催地マップ(ヒートマップ)の「国内」「海外」「不明/未確定」の内訳は、この公演数を会場所在地の判定状況で分類したものです。「不明/未確定」は、会場や開催地が特定できていない、または日程・会場が未発表の公演を指します。",
      ],
    },
    {
      id: "about-data-performances",
      title: "演奏回数(PERFORMANCES)",
      paragraphs: [
        "TOPの「PERFORMANCES」は、全公演のセットリストに登場した楽曲の延べ演奏回数です。MC・オープニングSE・幕間映像などの非楽曲項目(「-MC-」「-Opening-」等)は演奏回数に含まれません。",
        "公演詳細ページの「SETLIST — N曲」も同様に、非楽曲項目を除いた実際の楽曲数を表示しています(非楽曲項目がある場合は「MC ◯」のように内訳を併記します)。",
      ],
    },
  ] as Section[],
  caveatsTitle: "その他の注意点",
  caveats: [
    "開催中止となった公演も、日程・会場情報がある限り公演数に含めています。",
    "セットリストの楽曲名がサイト内の楽曲マスタと自動的に一致しない場合、その演奏は集計上「未マッチ」として扱われ、楽曲別の演奏回数には反映されません。表記ゆれの解消は継続的に行っています。",
    "当サイトの集計はあくまで非公式ファンサイトが把握できた範囲の情報に基づくものであり、公式発表の数値と一致しない場合があります。",
  ],
};

type AboutDataDict = typeof ja;

const en: AboutDataDict = {
  title: "How we count",
  metaDescription:
    "How the song, show and performance counts on the top page, Song Stats and the venue map are defined and calculated.",
  intro:
    "The numbers on the top page and the stats pages (songs, shows, performances and so on) are defined differently depending on where you see them, so they can't be compared directly. This page explains what each number counts and how.",
  sections: [
    {
      id: "about-data-songs",
      title: "Songs (SONGS)",
      paragraphs: [
        "“SONGS” on the top page and the number of rows in `/songs/stats/` are the number of representative songs after merging duplicate entries in the song database.",
        "When the same song is registered as separate records across several releases (single, album, live video, etc.), such as “煽げや尊し(Agitate)” and “煽げや尊し”, we group them by the title without the parenthesized subtitle and keep the oldest release as the representative. Different versions without parentheses, such as “mede:mede” and “mede:mede -JJJ Remix-”, stay separate songs.",
        "Performance counts (see below) are also totaled per representative song. Performances that appear in setlists under another release's title are all counted toward the representative song.",
      ],
    },
    {
      id: "about-data-lives",
      title: "Shows (LIVES)",
      paragraphs: [
        "“LIVES” on the top page is the number of individual show dates (venue × date) included in tours and events. The list at `/live/` is grouped by tour or event, so it shows fewer entries than the number of shows (one tour includes several shows).",
        "The “Japan”, “Overseas” and “Unknown / TBA” breakdown on the venue map classifies these shows by whether the venue location could be determined. “Unknown / TBA” means the venue or location hasn't been identified, or the date or venue hasn't been announced.",
      ],
    },
    {
      id: "about-data-performances",
      title: "Performances (PERFORMANCES)",
      paragraphs: [
        "“PERFORMANCES” on the top page is the total number of times songs appear in the setlists of all shows. Non-song items such as MCs, opening SE and interlude videos (“-MC-”, “-Opening-”, etc.) are not counted.",
        "Likewise, “SETLIST — N songs” on show pages shows the actual number of songs excluding non-song items (if there are any, the breakdown is shown as “MC N”).",
      ],
    },
  ],
  caveatsTitle: "Other notes",
  caveats: [
    "Canceled shows are still counted as long as their date and venue are known.",
    "If a song title in a setlist doesn't automatically match the song database, that performance is treated as “unmatched” and isn't reflected in per-song counts. We keep fixing spelling variations.",
    "These numbers are based only on what this unofficial fan site has been able to collect, and may differ from official figures.",
  ],
};

const zhHant: AboutDataDict = {
  title: "關於統計規則",
  metaDescription: "說明首頁、歌曲統計、演出地點地圖上顯示的歌曲數、演出場數、演出次數的定義與計算方式。",
  intro:
    "首頁與各統計頁面上的數字(歌曲數、演出場數、演出次數等)依顯示位置而有不同定義，無法直接比較。本頁說明各個數字「計算的是什麼、如何計算」。",
  sections: [
    {
      id: "about-data-songs",
      title: "歌曲數(SONGS)",
      paragraphs: [
        "首頁的「SONGS」與 `/songs/stats/` 的列數，是將歌曲資料庫合併重複項目後的代表曲數量。",
        "像「煽げや尊し(Agitate)」與「煽げや尊し」這樣，同一首歌在單曲、專輯、現場影像等多個作品中被登錄為不同紀錄時，會以去掉副標題(括號內文字)的歌名分組，並以最早的作品作為代表合併為一筆。像「mede:mede」與「mede:mede -JJJ Remix-」這類非括號標示的不同版本，則仍視為不同歌曲。",
        "演出次數(後述)也以代表曲為單位合計。以同一首歌其他作品的標題出現在歌單中的演出，全部計入代表曲的演出次數。",
      ],
    },
    {
      id: "about-data-lives",
      title: "演出場數(LIVES)",
      paragraphs: [
        "首頁的「LIVES」是巡演與活動中各個演出日(會場 × 舉辦日)的數量。`/live/` 列表以巡演、活動為單位，因此筆數會比演出場數少(一次巡演包含多場演出)。",
        "演出地點地圖(熱度地圖)中「國內」「海外」「不明/未確定」的分類，是依會場所在地的判定狀況將演出場數分類。「不明/未確定」指會場或舉辦地尚未確定，或日程、會場尚未公布的演出。",
      ],
    },
    {
      id: "about-data-performances",
      title: "演出次數(PERFORMANCES)",
      paragraphs: [
        "首頁的「PERFORMANCES」是所有演出歌單中出現的歌曲累計演出次數。MC、開場 SE、幕間影像等非歌曲項目(「-MC-」「-Opening-」等)不計入演出次數。",
        "演出頁面的「SETLIST — N 首」同樣顯示扣除非歌曲項目後的實際歌曲數(有非歌曲項目時會以「MC ◯」併列內容)。",
      ],
    },
  ],
  caveatsTitle: "其他注意事項",
  caveats: [
    "已取消的演出，只要有日程與會場資訊，仍計入演出場數。",
    "若歌單中的歌名無法自動對應到本站的歌曲資料庫，該演出在統計上視為「未對應」，不會反映在各歌曲的演出次數中。我們會持續修正標記差異。",
    "本站統計僅基於非官方粉絲網站所能掌握的資訊，可能與官方公布的數字不一致。",
  ],
};

const zhHans: AboutDataDict = {
  title: "关于统计规则",
  metaDescription: "说明首页、歌曲统计、演出地点地图上显示的歌曲数、演出场数、演出次数的定义与计算方式。",
  intro:
    "首页与各统计页面上的数字(歌曲数、演出场数、演出次数等)因显示位置不同而定义不同，无法直接比较。本页说明各个数字「统计的是什么、如何统计」。",
  sections: [
    {
      id: "about-data-songs",
      title: "歌曲数(SONGS)",
      paragraphs: [
        "首页的「SONGS」与 `/songs/stats/` 的行数，是将歌曲数据库合并重复项后的代表曲数量。",
        "像「煽げや尊し(Agitate)」与「煽げや尊し」这样，同一首歌在单曲、专辑、现场影像等多个作品中被登记为不同记录时，会以去掉副标题(括号内文字)的歌名分组，并以最早的作品作为代表合并为一条。像「mede:mede」与「mede:mede -JJJ Remix-」这类非括号标注的不同版本，则仍视为不同歌曲。",
        "演出次数(后述)也以代表曲为单位合计。以同一首歌其他作品的标题出现在歌单中的演出，全部计入代表曲的演出次数。",
      ],
    },
    {
      id: "about-data-lives",
      title: "演出场数(LIVES)",
      paragraphs: [
        "首页的「LIVES」是巡演与活动中各个演出日(会场 × 举办日)的数量。`/live/` 列表以巡演、活动为单位，因此条数会比演出场数少(一次巡演包含多场演出)。",
        "演出地点地图(热力图)中「国内」「海外」「未知/未确定」的分类，是按会场所在地的判定情况对演出场数进行的分类。「未知/未确定」指会场或举办地尚未确定，或日程、会场尚未公布的演出。",
      ],
    },
    {
      id: "about-data-performances",
      title: "演出次数(PERFORMANCES)",
      paragraphs: [
        "首页的「PERFORMANCES」是所有演出歌单中出现的歌曲累计演出次数。MC、开场 SE、幕间影像等非歌曲项目(「-MC-」「-Opening-」等)不计入演出次数。",
        "演出页面的「SETLIST — N 首」同样显示扣除非歌曲项目后的实际歌曲数(有非歌曲项目时会以「MC ◯」并列内容)。",
      ],
    },
  ],
  caveatsTitle: "其他注意事项",
  caveats: [
    "已取消的演出，只要有日程与会场信息，仍计入演出场数。",
    "若歌单中的歌名无法自动对应到本站的歌曲数据库，该演出在统计上视为「未匹配」，不会反映在各歌曲的演出次数中。我们会持续修正标注差异。",
    "本站统计仅基于非官方粉丝网站所能掌握的信息，可能与官方公布的数字不一致。",
  ],
};

const ko: AboutDataDict = {
  title: "집계 규칙에 대해",
  metaDescription: "홈과 곡 통계, 공연 지역 지도에 표시되는 곡 수·공연 수·연주 횟수의 정의와 산출 방법을 설명합니다.",
  intro:
    "홈과 각종 통계 페이지에 나오는 숫자(곡 수·공연 수·연주 횟수 등)는 보는 곳에 따라 정의가 달라 단순 비교할 수 없습니다. 이 페이지에서는 각 숫자가 「무엇을·어떻게 세는지」를 설명합니다.",
  sections: [
    {
      id: "about-data-songs",
      title: "곡 수(SONGS)",
      paragraphs: [
        "홈의 「SONGS」와 `/songs/stats/`의 행 수는 곡 데이터베이스의 중복 항목을 합친 뒤의 대표곡 수입니다.",
        "「煽げや尊し(Agitate)」와 「煽げや尊し」처럼 같은 곡이 싱글·앨범 수록·라이브 영상 등 여러 릴리스에 걸쳐 별도 레코드로 등록된 경우, 부제(괄호 안)를 뺀 곡명으로 묶고 가장 오래된 릴리스를 대표로 하여 1건으로 합칩니다. 「mede:mede」와 「mede:mede -JJJ Remix-」처럼 괄호 표기가 아닌 다른 버전은 별개의 곡으로 구분합니다.",
        "연주 횟수(후술)도 이 대표곡 단위로 합산합니다. 같은 곡의 다른 릴리스 표기로 세트리스트에 등장한 연주는 모두 대표곡의 연주 횟수로 셉니다.",
      ],
    },
    {
      id: "about-data-lives",
      title: "공연 수(LIVES)",
      paragraphs: [
        "홈의 「LIVES」는 투어나 이벤트에 포함된 개별 공연일(공연장 × 개최일)의 수입니다. `/live/` 목록은 투어·이벤트 단위이므로 공연 수보다 적습니다(하나의 투어에 여러 공연이 포함되기 때문).",
        "공연 지역 지도(히트맵)의 「국내」「해외」「불명/미정」 구분은 이 공연 수를 공연장 소재지의 판정 상황에 따라 분류한 것입니다. 「불명/미정」은 공연장이나 개최지가 특정되지 않았거나 일정·공연장이 미발표인 공연을 가리킵니다.",
      ],
    },
    {
      id: "about-data-performances",
      title: "연주 횟수(PERFORMANCES)",
      paragraphs: [
        "홈의 「PERFORMANCES」는 모든 공연의 세트리스트에 등장한 곡의 누적 연주 횟수입니다. MC·오프닝 SE·막간 영상 등 곡이 아닌 항목(「-MC-」「-Opening-」 등)은 연주 횟수에 포함되지 않습니다.",
        "공연 상세 페이지의 「SETLIST — N곡」도 마찬가지로 곡이 아닌 항목을 제외한 실제 곡 수를 표시합니다(곡이 아닌 항목이 있으면 「MC ◯」처럼 내역을 함께 적습니다).",
      ],
    },
  ],
  caveatsTitle: "기타 주의 사항",
  caveats: [
    "개최가 중지된 공연도 일정·공연장 정보가 있는 한 공연 수에 포함합니다.",
    "세트리스트의 곡명이 사이트의 곡 데이터베이스와 자동으로 일치하지 않으면, 그 연주는 집계상 「미매칭」으로 처리되어 곡별 연주 횟수에 반영되지 않습니다. 표기 차이는 계속 정리하고 있습니다.",
    "이 사이트의 집계는 비공식 팬사이트가 파악할 수 있었던 범위의 정보를 바탕으로 하므로, 공식 발표 수치와 다를 수 있습니다.",
  ],
};

export const aboutDataDict: Record<SiteLang, AboutDataDict> = {
  ja,
  en,
  "zh-hant": zhHant,
  "zh-hans": zhHans,
  ko,
};
