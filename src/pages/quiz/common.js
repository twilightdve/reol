import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBmT8tZjkFqJvBn0gYSuuyOYNfoL06NuZ8",
  authDomain: "reolbbq2025.firebaseapp.com",
  projectId: "reolbbq2025",
  storageBucket: "reolbbq2025.firebasestorage.app",
  messagingSenderId: "209413807165",
  appId: "1:209413807165:web:04fe5db9481c3d1af11e54",
  measurementId: "G-NLCZ4ZVSSG",
};

const app = initializeApp(firebaseConfig);
export default getFirestore(app);

export const quizData = [
  {
    id: "q1",
    question: "Reolの1stワンマンライブは？",
    options: ["極彩色", "刮目相待", "テンカイ ノ コウシキ", "No title"],
    answer: "刮目相待",
  },
  {
    id: "q2",
    question: "あにょすぺにょすゃゃがNo title-を販売したコミケはどれ？",
    options: ["C84", "C85", "C86", "C87"],
    answer: "C86",
  },
  {
    id: "q3",
    question: "REOLが初めてリリースしたアルバムは？",
    options: ["Σ", "事実上", "極彩色", "No title-"],
    answer: "Σ",
  },
  {
    id: "q4",
    question: "YouTubeで最も再生回数の多いMVは？",
    options: ["第六感", "LUVORATORRRRRY!", "No title", "煽げや尊し"],
    answer: "LUVORATORRRRRY!",
  },
  {
    id: "q5",
    question: "Reolの全楽曲の中で最も多く作曲を担当しているのは？(共作含む)",
    options: ["Reol", "Giga", "ツミキ", "Geekboy"],
    answer: "Reol",
  },
  {
    id: "q6",
    question: "れをるが『歌ってみた』を出していない曲は？",
    options: [
      "ロストワンの号哭",
      "脳漿炸裂ガール",
      "聖槍爆裂ボーイ",
      "脳内革命ガール",
    ],
    answer: "脳漿炸裂ガール",
  },
  {
    id: "q7",
    question: "Reol単独で作詞作曲した曲は？",
    options: ["ミラージュ", "十中八九", "煩悩遊戯", "SCORPION"],
    answer: "煩悩遊戯",
  },
  {
    id: "q8",
    question: "『第六感ラジオ』に出演していない人は？",
    options: ["MIKEY", "Ayase", "石田 スイ", "草野 華余子"],
    answer: "Ayase",
  },
  {
    id: "q9",
    question: "ケンモチヒデフミがReolのことを知った曲は？",
    options: [
      "ギガンティックO.T.N",
      "綺羅綺羅",
      "第六感",
      "ギミアブレスタッナウ",
    ],
    answer: "ギミアブレスタッナウ",
  },
  {
    id: "q10",
    question: "2025.11.9に横浜アリーナで行われるライブは？",
    options: ["No title", "無題", "無名", "「　」"],
    answer: "無題",
  },
];
