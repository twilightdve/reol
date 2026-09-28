// Reolファン16タイプ診断 — 質問文の翻訳(plan/28 第3弾・機械翻訳)。診断ページからだけ import する
// 並びは questions.ts の id 1〜20 と同じ。[質問, 選択肢A, 選択肢B]
import type { SiteLang } from "../../../i18n/site/langs";
import { zhHansQuestions } from "./questions-zh-hans";

type QuestionText = [text: string, optionA: string, optionB: string];

const en: QuestionText[] = [
  ["You've arrived at the venue! Where do you head first?", "As far forward as I can! I want to feel Reol's every breath", "Somewhere with a full view. I want to enjoy the whole light show"],
  ["A teaser for Reol's new song just dropped! What gets you hyped?", "An all-out aggressive sound with heavy bass and shouts", "A delicate sound with a spreading melody that sinks into your heart"],
  ["You're talking music with a friend who doesn't know Reol. You…", "\"You'll totally love this!\" and share recommended songs on the spot", "Say \"she's great,\" but don't actively push her"],
  ["Reol just released a new MV! What do you do first?", "Check every detail. Analyze the colors, props and editing", "Just soak in the overall mood. \"So emotional…\" is my first reaction"],
  ["During a show, you realize you're…", "Leaning forward, pumping your fist with everything you've got", "A little further back, savoring the atmosphere of the whole room"],
  ["What part of a setlist gets you most hyped?", "When intense songs keep coming and the floor shakes", "When a quiet song makes the whole venue fall silent as one"],
  ["Right after the show ends, you…", "Post immediately! I want to shout this feeling to the world", "Keep my phone away. I want to stay in the afterglow a little longer"],
  ["You've found a Reol lyric that pierces your heart. You…", "Look up its meaning and think about connections to other songs and background", "Don't overthink it, and treasure the feeling as it is"],
  ["If you could go to that show one more time?", "Front row, no question. Some things you only get from that close", "The back this time. I want to see the whole picture I missed before"],
  ["When you're feeling down, what do you want from Reol's music?", "Hype me up. I want intense songs to overwrite my mood", "Stay with me. I want to sink into a quiet song"],
  ["How do you keep the feeling from a show?", "Record it in a report or post and share it with everyone", "Keep it in my heart. It's my own treasure"],
  ["What's the biggest reason you love Reol's songs?", "I discover something new every time I listen. The depth of structure and lyrics", "I can't explain it, but I just feel \"this is it\" by instinct"],
  ["Doors open and you enter the floor. What do you do first?", "Head straight to the front. I want a spot as close to the stage as possible", "Look around first and find a spot with a good balance of sound and view"],
  ["Which song do you repeat most on a Reol album?", "A high-BPM upbeat tune that makes my body move on its own", "A gentle song that brings me close to tears no matter how many times I hear it"],
  ["When do you feel like talking about Reol?", "Anytime. If it comes up, I naturally start talking about Reol", "Listening alone is bliss. No need to talk about it with others"],
  ["Reol does an MC between songs at a show. How do you listen?", "Memorize every word and think about what she meant later", "Rather than the content, I want to feel the atmosphere and the tone of her voice"],
  ["Your ideal spot in a live house?", "The front area, close enough to reach the stage", "Around the sound desk. The spot with the best sound balance"],
  ["What gets you most hyped at a Reol show when \"this song!\" starts?", "A killer tune that makes the whole floor jump", "A breathtaking ballad that begins with just the piano"],
  ["A post from a follower who went to the same show appears. You…", "Reply or repost right away. I want to talk about it!", "Quietly like it. I want to keep my own feelings to myself"],
  ["Reol talked about how a song was made in an old interview. You…", "Read the whole thing and build a new interpretation of the song", "Think \"huh, interesting\" but keep my impression of the song as it is"],
];

const zhHant: QuestionText[] = [
  ["抵達演唱會會場了！你首先會去哪裡？", "盡量往前！想感受到 Reol 的呼吸", "去視野好的地方。想完整享受燈光演出"],
  ["Reol 新歌的預告公開了！讓你興奮的是？", "重低音與嘶吼迴盪、火力全開的聲音", "細膩旋律擴散開來、沁入心底的聲音"],
  ["和不認識 Reol 的朋友聊到音樂。你會…", "「你一定會愛上！」當場分享推薦歌曲", "會說「很讚喔」，但不會主動推薦"],
  ["Reol 的 MV 公開了！你首先會做什麼？", "檢查影像細節。分析色彩、道具、剪輯", "先沉浸在整體氛圍裡。第一句話是「好有感覺…」"],
  ["演唱會中的自己，回過神來…", "身體前傾，全力把拳頭舉向空中", "站在稍微後退的位置，品味全場的氣氛"],
  ["演唱會的歌單中，最讓你興奮的是？", "激烈的歌一首接一首、整個場地都在搖晃的瞬間", "安靜的歌讓全場屏息、合而為一的瞬間"],
  ["演唱會剛結束，你會…", "立刻發文！想馬上向全世界吶喊這份感動", "先不拿出手機。想再多沉浸在餘韻裡一下"],
  ["遇到了刺進心裡的 Reol 歌詞。你會…", "查歌詞的意思，考察與其他歌曲和背景的關聯", "不深入思考，珍惜那份打動內心的感覺"],
  ["如果能再去一次那場演唱會？", "毫不猶豫站最前面。有些東西只有那個距離才能得到", "這次站後方。想看上次沒看到的全貌"],
  ["心情低落時，你想從 Reol 的歌中得到什麼？", "讓我嗨起來。想用激烈的歌覆蓋心情", "陪伴我。想用安靜的歌慢慢沉浸"],
  ["演唱會的感動，你會怎麼留下？", "用心得或貼文記錄下來，和大家分享", "留在心裡。只屬於自己的寶物就好"],
  ["你覺得「喜歡」Reol 歌曲的最大理由是？", "每次聽都有新發現。結構和歌詞的深度", "說不出道理，但直覺就是「就是這個」"],
  ["開場後進入場內。你首先會做什麼？", "馬上往前。想盡量搶到靠近舞台的位置", "先環顧全場，找音響與視野平衡好的位置"],
  ["Reol 的專輯中你最常重複聽的是？", "BPM 偏高、身體會自己動起來的快歌", "不管聽幾次都快哭出來的抒情歌"],
  ["什麼時候會想聊 Reol？", "隨時。一有話題就自然聊起 Reol", "一個人聽的時候最幸福。沒必要特地跟別人說"],
  ["Reol 在演唱會的歌曲之間插入了 MC。你會怎麼聽？", "記住每一句話，之後再思考其用意", "比起內容，更想感受當下的氣氛和聲音的語調"],
  ["理想的 Live House 站位是？", "彷彿伸手就能碰到舞台的最前區", "PA 控台旁邊一帶。聲音平衡最好的位置"],
  ["在 Reol 的演唱會，「這首來了！」最讓你興奮的是？", "讓整個場地一起跳到搖晃的殺手級歌曲", "只從一架鋼琴開始、令人屏息的抒情歌"],
  ["去了同一場演唱會的追蹤者發文出現了。你會…", "馬上回覆或轉發。想一起聊感想！", "悄悄按讚。自己的感動想留在自己心裡"],
  ["Reol 在過去的訪談中聊到創作秘辛。你會…", "全文讀透，建立對歌曲的新詮釋", "覺得「喔～有趣」，但仍珍惜對歌曲原本的印象"],
];

const ko: QuestionText[] = [
  ["라이브 공연장에 도착! 당신이 먼저 향하는 곳은?", "조금이라도 앞으로! Reol의 숨결까지 느끼고 싶다", "전체가 보이는 곳으로. 조명 연출까지 통째로 즐기고 싶다"],
  ["Reol의 신곡 티저가 공개! 텐션이 오르는 건?", "중저음과 샤우트가 울리는, 공격적인 사운드", "섬세한 멜로디가 퍼지는, 마음에 스며드는 사운드"],
  ["Reol을 모르는 친구와 음악 이야기 중. 당신은…", "\"무조건 빠질 거야!\" 하고 그 자리에서 추천곡을 공유", "\"좋아\"라고는 하지만 먼저 적극적으로 권하진 않는다"],
  ["Reol의 MV가 공개됐다! 먼저 하는 일은?", "영상의 디테일을 체크. 색채, 소품, 컷 구성을 분석", "일단 전체 분위기에 잠긴다. 첫마디는 \"감성 미쳤다…\""],
  ["라이브 중의 나, 정신을 차려 보면…", "앞으로 몸을 기울여 온 힘을 다해 주먹을 치켜들고 있다", "조금 물러난 위치에서 전체 분위기를 음미하고 있다"],
  ["라이브 세트리스트에서 가장 텐션이 오르는 건?", "격렬한 곡이 이어지며 플로어가 흔들리는 순간", "조용한 곡에 공연장이 숨죽이며 하나가 되는 순간"],
  ["라이브가 끝난 직후, 당신은…", "바로 포스팅! 이 감동을 지금 당장 세상에 외치고 싶다", "아직 스마트폰은 꺼내지 않는다. 조금만 더 여운에 잠기고 싶다"],
  ["마음에 꽂히는 Reol의 가사를 만났다. 당신은…", "가사의 의미를 찾아보고 다른 곡이나 배경과의 연결을 고찰한다", "깊이 생각하지 않고, 마음에 울린 감각을 그대로 소중히 한다"],
  ["그 라이브에 한 번 더 갈 수 있다면?", "망설임 없이 맨 앞. 그 거리에서만 얻을 수 있는 게 있다", "이번엔 뒤쪽에서. 지난번에 못 본 전체 모습을 보고 싶다"],
  ["우울할 때 Reol의 곡에 바라는 건?", "텐션을 올려 줬으면. 격렬한 곡으로 기분을 덮어쓰고 싶다", "곁에 있어 줬으면. 조용한 곡에 천천히 잠기고 싶다"],
  ["라이브의 감동, 당신은 어떻게 남기나요?", "후기나 포스트로 기록해서 모두와 공유한다", "마음속에 담아 둔다. 나만의 보물이면 된다"],
  ["Reol의 곡을 '좋아한다'고 느끼는 가장 큰 이유는?", "들을 때마다 새로운 발견이 있다. 구성과 가사의 깊이", "이유는 설명 못 하지만 직감적으로 '바로 이거다'라고 느낀다"],
  ["개장해서 플로어에 들어왔다. 당신이 먼저 하는 일은?", "바로 앞쪽으로. 조금이라도 무대에 가까운 자리를 확보하고 싶다", "먼저 전체를 둘러보고 소리와 시야의 균형이 좋은 곳을 찾는다"],
  ["Reol의 앨범에서 가장 많이 반복해 듣는 곡은?", "BPM이 높고 몸이 저절로 움직이는 업템포 곡", "몇 번을 들어도 울 것 같은 차분한 곡"],
  ["Reol 이야기를 하고 싶어지는 건 언제?", "언제든. 화제만 나오면 자연스럽게 Reol 이야기를 하게 된다", "혼자 들을 때가 가장 행복. 굳이 남에게 말할 필요는 없다"],
  ["라이브에서 Reol이 곡 사이에 MC를 했다. 당신의 듣는 방식은…", "한마디 한마디를 기억해 두고, 나중에 의도를 생각하고 싶다", "내용보다 그 자리의 분위기와 목소리 톤을 느끼고 싶다"],
  ["이상적인 라이브 하우스의 위치는?", "무대에 손이 닿을 것 같은 맨 앞 구역", "PA석 옆쯤. 소리의 균형이 가장 좋은 곳"],
  ["Reol의 라이브에서 \"이 곡 나왔다!\" 하고 가장 신나는 건?", "플로어 전체가 점프로 흔들리는 킬러 튠", "피아노 하나로 시작하는, 숨 막히는 발라드"],
  ["같은 라이브에 간 팔로워의 포스트가 올라왔다. 당신은…", "바로 답글이나 리포스트. 감상을 나누고 싶다!", "살며시 좋아요. 내 감동은 내 안에 간직하고 싶다"],
  ["Reol이 예전 인터뷰에서 제작 비화를 이야기했다. 당신은…", "전문을 읽고 곡의 새로운 해석을 세운다", "\"오, 재밌네\" 하면서도 곡의 인상은 그대로 소중히 한다"],
];

export const questionTranslations: Partial<Record<SiteLang, QuestionText[]>> = {
  en,
  "zh-hant": zhHant,
  "zh-hans": zhHansQuestions,
  ko,
};

export type { QuestionText };
