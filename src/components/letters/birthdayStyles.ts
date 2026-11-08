/**
 * 誕生日企画の入口(/letters/。plan/64)の見た目。2026-11-08 に承認された birthday-h.html(handoff)の CSS を、
 * このページの中(.bd)だけに効くように移したもの。html / body はこのページの Head でだけ読むので、そのまま。
 */
export const BIRTHDAY_CSS = `
.bd{--paper:#f4f4ed;--ink:#2d3932;--sage:#919b89;--olive:#68715c;--rust:#95753e;--lilac:#d8d0dd;--muted:#74756b;--rule:#c9ccbd}
.bd,.bd *{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:#dde0d6;color:#2d3932;font-family:'Noto Serif JP','Hiragino Mincho ProN','Yu Mincho',serif;-webkit-font-smoothing:antialiased}
.bd a{color:inherit}
.bd a:focus-visible{outline:3px solid var(--rust);outline-offset:5px}
.bd .page{max-width:1440px;margin:auto;background:var(--paper);overflow:hidden}
.bd .header{height:70px;padding:0 clamp(22px,5.5vw,76px);display:flex;align-items:center;justify-content:space-between;gap:14px}
.bd .brand{font:500 25px/1 'Cormorant Garamond',Georgia,serif;letter-spacing:.01em}
.bd .brand b{font-weight:400;color:var(--rust)}
.bd .header-label{text-align:right;font:400 9px/1.6 'Noto Sans JP',sans-serif;letter-spacing:.04em;color:#6c7467}
.bd .hero{position:relative;isolation:isolate;padding:25px clamp(22px,5.5vw,76px) 0;min-height:825px;background:#e7eadd;overflow:hidden}
.bd .hero-mineral{position:absolute;inset:0;z-index:-3;overflow:hidden;background:#e2e7d9;pointer-events:none}
.bd .hero-stone{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 52%;filter:saturate(.38) contrast(.86) brightness(1.12);opacity:.9}
.bd .hero:before{content:'';position:absolute;inset:0;z-index:-2;background:linear-gradient(100deg,rgba(244,245,235,.94),rgba(244,245,235,.69) 40%,rgba(237,240,225,.18) 77%,rgba(231,233,216,.07)),linear-gradient(0deg,rgba(236,239,226,.77),transparent 44%)}
.bd .hero-top{display:flex;justify-content:space-between;align-items:start;gap:12px;font:500 9px/1.6 'Noto Sans JP',sans-serif;letter-spacing:.16em}
.bd .hero-top .date{font:600 12px/1.6 'Cormorant Garamond',Georgia,serif;letter-spacing:.13em;color:var(--rust)}
.bd .hero-title{margin-top:42px;position:relative;max-width:750px}
.bd .hero-title .eyebrow{font:500 10px/1.5 'Noto Sans JP',sans-serif;letter-spacing:.14em;color:#6b745c;display:flex;align-items:center;gap:9px}
.bd .hero-title .eyebrow:before{content:'';height:1px;width:24px;background:var(--rust)}
.bd h1{color:#326b45;font:400 clamp(48px,13.3vw,112px)/.91 'Cormorant Garamond',Georgia,serif;letter-spacing:-.025em;margin:22px 0 0}
.bd h1 span{display:block}
.bd h1 em{font-weight:400;font-style:italic}
.bd h1 .name{font-size:1.63em;margin-top:8px;line-height:.82;letter-spacing:-.04em}
.bd .year-mark{position:absolute;right:0;top:31px;font:400 13px/1 'Cormorant Garamond',Georgia,serif;letter-spacing:.23em;writing-mode:vertical-rl;color:#6e7968}
.bd .hero-message{font:500 13px/2 'Noto Serif JP',serif;letter-spacing:.035em;margin:26px 0 0}
.bd .memories{margin:36px 0 0;position:relative;height:264px;max-width:760px}
.bd .memory-album{position:absolute;width:54%;height:184px;left:0;top:12px;transform:rotate(-3.5deg);background:linear-gradient(135deg,#eff0e5ec,#d9dfcddf);box-shadow:2px 15px 29px #3c493d16,0 1px 0 #fffaf080 inset;border:1px solid #b4bda3;padding:17px 15px;color:#354b3e;text-decoration:none}
.bd .memory-album:before{content:'';position:absolute;inset:8px;border:1px solid #8c9c7a4d;pointer-events:none}
.bd .memory-meta{position:relative;font:500 8px/1.4 'Noto Sans JP',sans-serif;letter-spacing:.14em;display:flex;justify-content:space-between;gap:8px}
.bd .memory-album .jp{position:relative;font:500 clamp(28px,8vw,45px)/1.2 'Noto Serif JP',serif;letter-spacing:.1em;margin:23px 0 9px}
.bd .memory-album .en{position:relative;font:italic 400 15px/1 'Cormorant Garamond',Georgia,serif;letter-spacing:.03em}
.bd .memory-cocoon{position:absolute;right:0;top:35px;width:49%;height:173px;background:linear-gradient(135deg,#f1edf0f2,#e3dfe7ed);border:1px solid #cbc1c9;transform:rotate(4.5deg);box-shadow:2px 14px 28px #38303f16,0 1px 0 #fffaf080 inset;text-decoration:none;padding:17px 14px;overflow:hidden}
.bd .memory-cocoon .curve{position:absolute;width:118px;height:175px;right:-13px;top:30px;transform:rotate(32deg);border:1px solid #8b718a72;border-radius:50%;box-shadow:0 0 0 9px #9a7f9510,0 0 0 18px #9a7f950d}
.bd .memory-cocoon .curve:after{content:'';position:absolute;width:5px;height:5px;background:#fbfaf8;border:1px solid #c7b8c9;border-radius:50%;left:20px;bottom:13px;box-shadow:37px -7px 0 -1px #f9f8f1}
.bd .memory-cocoon .title{position:relative;font:400 clamp(21px,6vw,35px)/1 'Cormorant Garamond',Georgia,serif;letter-spacing:.035em;margin:44px 0 0;color:#57465c}
.bd .memory-cocoon .date{position:relative;font:500 8px/1.4 'Noto Sans JP',sans-serif;letter-spacing:.12em;margin-top:13px;color:#7a6a7f}
.bd .hero-bottom{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:28px 0 25px;margin-top:14px;border-top:1px solid #8e936d55;font:500 9px/1.6 'Noto Sans JP',sans-serif;letter-spacing:.1em;color:#66725e}
.bd .hero-bottom a{min-height:44px;display:flex;gap:10px;align-items:center;text-decoration:none;font-size:11px;color:#3f5138}
.bd .hero-bottom a span{font-size:17px}
.bd .year-strip{background:#535e49;color:#f2f0e9;padding:15px clamp(22px,5.5vw,76px);display:flex;align-items:center;justify-content:space-between;gap:15px;font:400 9px/1.5 'Noto Sans JP',sans-serif;letter-spacing:.08em}
.bd .year-strip .latest{text-align:right;color:#dce2d6}
.bd .year-strip .latest b{font-family:'Noto Serif JP',serif;font-size:12px;font-weight:400;color:#fff;letter-spacing:.08em}
.bd .intro{text-align:center;padding:44px 24px 58px;background:linear-gradient(180deg,#f3f3ea,#f2eff0)}
.bd .intro .eyebrow,.bd .project-label{font:500 10px/1.5 'Noto Sans JP',sans-serif;letter-spacing:.17em;color:var(--rust)}
.bd .intro h2{font:500 clamp(19px,5vw,28px)/1.9 'Noto Serif JP',serif;letter-spacing:.06em;margin:20px 0 18px}
.bd .intro p{font:400 13px/2.25 'Noto Serif JP',serif;letter-spacing:.04em;max-width:540px;margin:0 auto;color:#62645d}
.bd .intro .listener{margin-top:20px;color:#3e4f39}
.bd .project{padding:54px clamp(24px,6vw,90px) 65px;position:relative;background:#f4f4ed}
.bd .project:before{content:'';position:absolute;left:clamp(24px,6vw,90px);right:clamp(24px,6vw,90px);top:0;height:1px;background:#c9ccbd}
.bd .project h2{margin:21px 0 16px;font:500 clamp(26px,6.8vw,40px)/1.6 'Noto Serif JP',serif;letter-spacing:.08em}
.bd .project .copy{font:500 14px/2 'Noto Serif JP',serif;letter-spacing:.05em;color:#807154;margin:0 0 23px}
.bd .project .detail{font:400 14px/2.2 'Noto Serif JP',serif;letter-spacing:.04em;color:#5f6259;max-width:520px;margin:0}
.bd .deadline{border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);padding:18px 0;margin-top:26px;display:flex;justify-content:space-between;align-items:center;gap:12px}
.bd .deadline-label{font:500 10px/1.5 'Noto Sans JP',sans-serif;letter-spacing:.07em;color:var(--muted)}
.bd .deadline-value{text-align:right;font:500 24px/1 'Cormorant Garamond',Georgia,serif}
.bd .deadline-value small{display:block;margin-top:5px;font:500 11px/1.5 'Noto Sans JP',sans-serif}
.bd .actions{display:grid;gap:10px;margin-top:28px}
.bd .action{display:flex;align-items:center;justify-content:space-between;min-height:58px;padding:0 17px;text-decoration:none;font:500 14px/1.4 'Noto Sans JP',sans-serif;letter-spacing:.03em;border:1px solid #576047}
.bd .action.primary{background:#576047;color:#fff}
.bd .action span:last-child{font:400 22px/1 'Cormorant Garamond',Georgia,serif}
.bd .foot{padding:30px 24px 45px;text-align:center;background:#e7e9dd;color:#707568}
.bd .foot p{font:400 10px/1.9 'Noto Sans JP',sans-serif;margin:12px auto 0;max-width:710px}
.bd .foot a{text-underline-offset:3px}
.bd .foot .credits{font-size:10px;color:#79806f}
.bd .foot .sources{font-size:9px;line-height:2}
.bd .foot .sources a{display:inline-block;margin:0 5px}
.bd a.memory-album:focus-visible,.bd a.memory-cocoon:focus-visible{outline-offset:6px}
@media(min-width:700px){.bd .header{height:80px}
.bd .hero{min-height:820px;padding-top:35px}
.bd .hero-stone{object-position:50% 45%}
.bd .hero:before{background:linear-gradient(95deg,rgba(244,245,235,.96) 1%,rgba(244,245,235,.82) 32%,rgba(237,240,225,.26) 64%,rgba(231,233,216,.03) 100%),linear-gradient(0deg,rgba(236,239,226,.72),transparent 43%)}
.bd .hero-title{margin-top:66px;max-width:65%}
.bd h1{font-size:clamp(68px,7.7vw,112px)}
.bd .hero-message{font-size:15px;margin-top:32px}
.bd .year-mark{right:-4%;top:22px;font-size:16px}
.bd .memories{position:absolute;right:6%;top:200px;width:35%;max-width:470px;height:355px;margin:0}
.bd .memory-album{width:70%;height:225px;left:0;top:0;padding:22px}
.bd .memory-album .jp{font-size:clamp(30px,3.7vw,45px);margin-top:35px}
.bd .memory-album .en{font-size:19px}
.bd .memory-cocoon{width:65%;height:210px;right:0;top:105px;padding:22px}
.bd .memory-cocoon .title{font-size:clamp(23px,2.8vw,31px);margin-top:51px}
.bd .hero-bottom{margin-top:95px;max-width:100%;padding-top:25px}
.bd .intro{padding:72px 30px 90px}
.bd .intro p{font-size:14px}
.bd .project{padding:80px 9% 95px;display:grid;grid-template-columns:1fr 1fr;gap:0 10%}
.bd .project-label{grid-column:1/-1}
.bd .project h2{grid-column:1;grid-row:2;margin-top:26px}
.bd .project-body{grid-column:2;grid-row:2/span 2;padding-top:30px}
.bd .deadline,.bd .actions{grid-column:1/-1}
.bd .actions{grid-template-columns:1fr 1fr;gap:14px}
.bd .year-strip{padding-top:18px;padding-bottom:18px;font-size:10px}
.bd .year-strip .latest b{font-size:14px}}
@media(min-width:1100px){.bd .memories{top:175px;right:8%;width:34%}
.bd .hero-title{max-width:62%}
.bd .hero-bottom{margin-top:125px}}
@media(max-width:359px){.bd .memory-album .jp{font-size:26px}
.bd .memory-cocoon .title{font-size:21px}
.bd .hero-message{font-size:12px}
.bd .year-strip{font-size:8px;padding-left:20px;padding-right:20px}
.bd .year-strip .latest b{font-size:11px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
.bd .icon-defs{position:absolute;width:0;height:0;overflow:hidden;pointer-events:none}
.bd .birthday-ornaments{display:flex;justify-content:center;align-items:center;gap:19px;margin:0 auto 22px}
.bd .birthday-icon{display:block;width:34px;height:34px;flex:0 0 34px}
.bd .memories-link{position:absolute;left:8%;right:3%;bottom:0;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:44px;border-top:1px solid #87917288;color:#5d6b52;text-decoration:none;font:500 9px/1.6 "Noto Sans JP",sans-serif;letter-spacing:.04em}
.bd .memories-link span:first-child{font-size:8px;letter-spacing:.08em;flex:0 0 auto}
.bd .memories-link b{font-size:14px;font-weight:400;padding-left:5px}
@media(min-width:700px){.bd .memories-link{left:-10%;right:0;bottom:-20px}}
.bd .year-lives{--live-side:clamp(24px,6vw,86px);padding:58px var(--live-side) 70px;background:#f4f4ed;scroll-margin-top:20px}
.bd .live-section-header{max-width:720px}
.bd .live-section-eyebrow{margin:0;color:#8b7248;font:500 10px/1.6 'Noto Sans JP',sans-serif;letter-spacing:.14em}
.bd .year-lives h2{margin:22px 0 20px;font:500 clamp(23px,5.9vw,38px)/1.7 'Noto Serif JP',serif;letter-spacing:.055em}
.bd .live-section-copy{margin:0;color:#64675b;font:400 13px/2.1 'Noto Serif JP',serif;letter-spacing:.035em}
.bd .live-section-meta{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:27px 0 0;font:500 10px/1.8 'Noto Sans JP',sans-serif;color:#74796a;letter-spacing:.04em}
.bd .live-section-meta a,.bd .live-section-end a{display:inline-flex;align-items:center;gap:12px;min-height:42px;text-decoration:none;color:#4d5b43;border-bottom:1px solid #8c957d}
.bd .live-section-meta a span,.bd .live-section-end a span{font-size:15px;color:#8b7248}
.bd .live-month-nav{display:flex;align-items:center;gap:23px;overflow-x:auto;margin:26px calc(-1*var(--live-side)) 0 0;padding:15px var(--live-side) 15px 0;border-top:1px solid #c9ccbd;border-bottom:1px solid #c9ccbd;scrollbar-width:thin;scrollbar-color:#aeb5a0 transparent;font:500 10px/1.5 'Noto Sans JP',sans-serif;letter-spacing:.06em}
.bd .live-month-nav a{flex:0 0 auto;display:flex;align-items:center;min-height:30px;text-decoration:none;color:#57644c}
.bd .live-month-nav a:hover{text-decoration:underline;text-underline-offset:6px}
.bd .live-month{padding-top:42px;scroll-margin-top:18px}
.bd .live-month h3{display:flex;align-items:baseline;gap:16px;margin:0 0 22px;color:#657057;font:500 12px/1.5 'Noto Sans JP',sans-serif;letter-spacing:.17em}
.bd .live-month h3 span{font:500 26px/1.2 'Cormorant Garamond',Georgia,serif;letter-spacing:.03em;color:#947e54}
.bd .live-event-list{list-style:none;padding:0;margin:0}
.bd .live-entry{position:relative;min-width:0;padding:24px 0 31px;border-top:1px solid #c9ccbd;scroll-margin-top:18px}
.bd .live-entry-heading{min-width:0}
.bd .live-entry-number{font:500 8px/1.5 'Noto Sans JP',sans-serif;letter-spacing:.12em;color:#8a8d7f}
.bd .live-entry-number span{padding:0 4px;color:#b6b8aa}
.bd .live-entry-date{display:block;margin:6px 0 5px;color:#536347;font:500 38px/1.1 'Cormorant Garamond',Georgia,serif;letter-spacing:-.015em}
.bd .live-entry h4{margin:7px 0 11px;font:500 21px/1.4 'Noto Serif JP',serif;letter-spacing:.05em;color:#354b3e;overflow-wrap:anywhere}
.bd .live-entry-title{margin:0;color:#5b6252;font:500 11px/1.85 'Noto Sans JP',sans-serif;letter-spacing:.025em;overflow-wrap:anywhere}
.bd .live-entry-venue{margin:5px 0 0;color:#74796a;font:400 11px/1.8 'Noto Sans JP',sans-serif;overflow-wrap:anywhere}
.bd .live-entry-source{display:inline-flex;align-items:center;gap:9px;min-height:36px;margin-top:3px;color:#8a7955;font:400 9px/1.5 'Noto Sans JP',sans-serif;text-decoration:none;text-underline-offset:4px}
.bd .live-entry-source:hover{text-decoration:underline}
.bd .live-posts-block{min-width:0;margin-top:18px}
.bd .live-posts-count{margin:0 0 10px;color:#7d8274;font:500 9px/1.5 'Noto Sans JP',sans-serif;letter-spacing:.06em}
.bd .live-posts-count span{margin-left:8px;font:500 13px/1 'Cormorant Garamond',Georgia,serif;color:#8b7248}
.bd .live-posts{display:flex;align-items:flex-start;gap:14px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x proximity;scrollbar-width:thin;scrollbar-color:#aeb5a0 transparent;margin:0 calc(-1*var(--live-side)) 0 0;padding:2px var(--live-side) 12px 0}
.bd .live-post-card{flex:0 0 min(82vw,330px);width:min(82vw,330px);max-width:330px;min-width:0;scroll-snap-align:start;background:transparent}
.bd .live-tweet-frame{display:block;width:100%;max-width:100%;height:560px;border:0;background:transparent;overflow:auto}
.bd .live-post-link{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:40px;margin-top:7px;padding:0 2px;color:#727e64;font:500 10px/1.5 'Noto Sans JP',sans-serif;text-decoration:none}
.bd .live-post-link span{color:#a17e4d;font-size:16px}
.bd .live-post-link:hover{text-decoration:underline;text-underline-offset:4px}
.bd .live-no-post{padding:20px;border:1px solid #d8d9cb;color:#7c826f;font:400 12px/1.9 'Noto Serif JP',serif}
.bd .live-no-post p{margin:0 0 10px}
.bd .live-no-post a{text-underline-offset:4px;font-family:'Noto Sans JP',sans-serif;font-size:10px}
.bd .live-section-end{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-top:25px;padding-top:20px;border-top:1px solid #c9ccbd;font:500 10px/1.5 'Noto Sans JP',sans-serif}
@media(min-width:900px){.bd .year-lives{padding-top:78px;padding-bottom:90px}
.bd .live-section-meta{max-width:540px}
.bd .live-month-nav{gap:32px;margin-right:0;padding-right:0}
.bd .live-month{padding-top:54px}
.bd .live-entry{display:grid;grid-template-columns:minmax(180px,25%) minmax(0,1fr);gap:0 38px;padding:30px 0 36px}
.bd .live-entry-heading{padding-right:8px}
.bd .live-entry-date{font-size:45px}
.bd .live-entry h4{font-size:23px}
.bd .live-posts-block{margin-top:0}
.bd .live-posts{margin-right:0;padding-right:2px}
.bd .live-posts-count{margin-bottom:12px}
.bd .live-entry-title{font-size:11px}
.bd .live-entry-venue{font-size:10px}
.bd .live-section-end{justify-content:flex-end;gap:35px}
.bd .live-month h3{font-size:13px}
.bd .live-month h3 span{font-size:30px}}
@media(prefers-reduced-motion:reduce){.bd .live-posts{scroll-behavior:auto}}
.bd .letter-period{display:flex;align-items:baseline;flex-wrap:wrap;gap:4px 12px;margin:0 0 19px;padding-bottom:14px;border-bottom:1px solid #d5d6c9}
.bd .letter-period span{font:500 9px/1.6 "Noto Sans JP",sans-serif;letter-spacing:.05em;color:#7b806f}
.bd .letter-period b{font:500 17px/1.5 "Cormorant Garamond",Georgia,serif;letter-spacing:.03em;color:#69735a;white-space:nowrap}
.bd .live-entry.is-release .live-entry-number,.bd .live-entry.is-mv .live-entry-number{color:#95753e;letter-spacing:.18em;font-weight:600}
.bd .live-entry.is-release h4,.bd .live-entry.is-mv h4{color:#326b45}
.bd .live-entry.is-release .live-entry-date,.bd .live-entry.is-mv .live-entry-date{color:#95753e}
.bd .bd-mv{width:min(100%,560px);aspect-ratio:16/9;background:#2d3932;position:relative;overflow:hidden}
.bd .bd-mv button{all:unset;display:block;width:100%;height:100%;cursor:pointer;position:relative}
.bd .bd-mv button:focus-visible{outline:3px solid var(--rust);outline-offset:4px}
.bd .bd-mv img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.9)}
.bd .bd-mv-play{position:absolute;left:50%;top:50%;width:62px;height:62px;margin:-31px 0 0 -31px;border-radius:50%;background:#f4f4edde;box-shadow:0 6px 18px #0004}
.bd .bd-mv-play:after{content:'';position:absolute;left:25px;top:20px;border-style:solid;border-width:11px 0 11px 18px;border-color:transparent transparent transparent #326b45}
.bd .bd-mv iframe{width:100%;height:100%;border:0;display:block}
.bd .bd-totop{position:fixed;z-index:20;right:max(16px,env(safe-area-inset-right));bottom:max(18px,env(safe-area-inset-bottom));width:54px;height:54px;border-radius:50%;border:1px solid #576047;background:#f4f4edf2;color:#326b45;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;cursor:pointer;box-shadow:0 8px 22px #2d39322e;opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .25s ease,transform .25s ease;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
.bd .bd-totop.is-shown{opacity:1;transform:none;pointer-events:auto}
.bd .bd-totop span{font:400 20px/1 'Cormorant Garamond',Georgia,serif}
.bd .bd-totop small{font:600 8px/1 'Noto Sans JP',sans-serif;letter-spacing:.14em;color:#95753e}
.bd .bd-totop:focus-visible{outline:3px solid var(--rust);outline-offset:4px}
@media(prefers-reduced-motion:reduce){.bd .bd-totop{transition:none}}
`;
