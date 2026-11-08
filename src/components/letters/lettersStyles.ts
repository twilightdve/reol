/**
 * 手紙企画(plan/64)のページだけの CSS。ページの Head に <style> で置く(全ページ共通の CSS に入れない)。
 * 見本(handoff v4 の index.html、A「紙とインク」の誕生日版)を元に、クラスは lp- で始める。
 * カードは 100×148mm の実寸で組み、画面では縮めて見せる(印刷と同じ組版で、本文が入るかを確かめるため)。
 */
export const LETTERS_CSS = String.raw`
.lp{--paper:#fff7eb;--ink:#2d304c;--muted:#6b6966;--line:#ded2c2;--accent:#aa3149;--soft:#f5e7d9;--card:#fffcf3;--gold:#b99c52;
--serif:'Noto Serif JP','Yu Mincho','Hiragino Mincho ProN',serif;--sans:'Noto Sans JP','Hiragino Sans','Yu Gothic',sans-serif;
background:var(--paper);color:var(--ink);font:14px/1.85 var(--sans);min-height:100vh;-webkit-text-size-adjust:100%;overflow-x:clip}
.lp *,.lp *:before,.lp *:after{box-sizing:border-box}
.lp button,.lp input,.lp select,.lp textarea{font:inherit;color:inherit}
.lp button{cursor:pointer}
.lp a{color:inherit;text-underline-offset:5px}
.lp button,.lp a,.lp input,.lp select{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.lp :focus-visible{outline:3px solid var(--accent);outline-offset:3px}
.lp ::selection{background:#efb7a7;color:#27383b}
.lp-wrap{max-width:1180px;margin:0 auto;padding:0 56px}
.lp-header{display:flex;align-items:center;justify-content:space-between;padding:22px 0 20px;border-bottom:1px solid var(--line);gap:16px}
.lp-brand{font:bold 25px/1 Arial,sans-serif;letter-spacing:-1px;text-decoration:none}
.lp-brand b{color:var(--accent);margin-right:2px}
.lp-brand span{font-size:10px;letter-spacing:.09em;margin-left:14px;vertical-align:middle;font-weight:400}
.lp-header-nav{display:flex;align-items:center;gap:18px;font-size:12px}
.lp-header-nav a{text-decoration:none;border-bottom:1px solid transparent;padding:4px 0}
.lp-header-nav a[aria-current=page]{border-color:var(--accent);color:var(--accent)}
.lp-header-date{font-size:11px;letter-spacing:.14em;color:var(--accent)}
.lp-eyebrow{font:10px/1.5 Arial,sans-serif;letter-spacing:.15em;color:var(--accent);margin-bottom:12px}
.lp h2{font:500 28px/1.6 var(--serif);letter-spacing:.04em;margin:0}
.lp h3{margin:0}
.lp-intro{font-size:13px;line-height:2;color:var(--muted);margin:0;max-width:34em}
.lp-primary{display:inline-flex;justify-content:space-between;gap:30px;align-items:center;background:var(--accent);color:#fffaf0;padding:12px 23px;text-decoration:none;border:1px solid var(--accent);font-size:13px;min-height:48px}
.lp .lp-primary{color:#fffaf0}
.lp-primary[disabled]{opacity:.45;cursor:not-allowed}
.lp-secondary{display:inline-flex;align-items:center;justify-content:center;gap:10px;background:transparent;border:1px solid var(--ink);padding:10px 18px;min-height:44px;font-size:13px;text-decoration:none}
.lp-text-link{font-size:12px;text-decoration:none;border-bottom:1px solid var(--line);padding:6px 0;background:none;border-top:0;border-left:0;border-right:0}
.lp-section{padding:72px 0;scroll-margin-top:12px}
.lp-section-head{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-bottom:32px}
.lp-note{font-size:12px;line-height:1.9;color:var(--muted);margin:0}
.lp-badge{display:inline-block;font-size:11px;border:1px solid var(--line);padding:2px 9px;color:var(--muted);white-space:nowrap;line-height:1.7}
.lp-badge.is-accent{border-color:var(--accent);color:var(--accent)}
.lp-badge.is-ink{border-color:var(--ink);color:var(--ink)}
.lp-alert{border:1px solid var(--accent);background:#fff;padding:14px 16px;font-size:13px;line-height:1.9;margin:16px 0}
.lp-panel{border:1px solid var(--line);background:#fffdf8;padding:18px}

/* ---- 入口(誕生日) ---- */
.lp-hero{position:relative;display:grid;grid-template-columns:1fr 1fr;grid-template-areas:'greeting art' 'project art' 'action art' 'intro art';padding:45px 0 60px;column-gap:25px;overflow:hidden;isolation:isolate}
.lp-greeting{grid-area:greeting;position:relative;z-index:2}
.lp-kicker{font:11px/1.7 var(--sans);letter-spacing:.13em;color:var(--muted);margin:0 0 18px}
.lp-kicker b{color:var(--accent);font-weight:500}
.lp-birthday{margin:0;color:var(--ink);font-family:Georgia,'Times New Roman',serif;font-weight:400;line-height:1;letter-spacing:-.04em}
.lp-birthday .wish{display:block;color:var(--accent);font-size:43px;font-style:italic;letter-spacing:-.035em}
.lp-birthday .artist{display:block;font-size:120px;letter-spacing:-.075em;margin:6px 0 0;text-transform:none}
.lp-birthday .artist:after{content:'✦';font-size:34px;color:var(--gold);vertical-align:top;display:inline-block;margin:14px 0 0 14px}
.lp-project{grid-area:project;margin:26px 0 0;z-index:2}
.lp-project h2{font-size:23px;line-height:1.75;letter-spacing:.02em}
.lp-project h2 span{display:block}
.lp-project h2 .small{font:12px/1.7 var(--sans);letter-spacing:.04em;margin-bottom:4px}
.lp-tagline{font-size:14px;line-height:1.9;margin:13px 0 0;color:var(--accent)}
.lp-actions{grid-area:action;margin-top:27px;display:flex;flex-wrap:wrap;align-items:center;gap:14px 22px;z-index:2}
.lp-deadline{flex:0 0 100%;margin:0;font-size:12px;line-height:1.7}
.lp-deadline>span{display:block;font-size:10px;letter-spacing:.08em;color:var(--muted);margin-bottom:3px}
.lp-deadline strong{font-size:17px;font-weight:500}
.lp-deadline small{font-size:10px;margin-left:9px;color:var(--muted)}
.lp-hero-intro{grid-area:intro;font-size:12px;line-height:2;color:var(--muted);margin:17px 0 0;z-index:2}
.lp-hero-intro span{display:block}
.lp-art{grid-area:art;position:relative;align-self:center;height:500px;width:100%;isolation:isolate}
.lp-art:before{content:'';position:absolute;width:370px;height:370px;left:14%;top:60px;border:1px solid #c2a66a66;border-radius:50%;box-shadow:0 0 0 24px #c2a66a08,0 0 0 25px #c2a66a33}
.lp-gift{position:absolute;width:240px;aspect-ratio:100/148;border:1px solid #decdb8;background:#fffbef;box-shadow:0 14px 30px #46312b14;padding:26px 22px;color:#36334d;overflow:hidden}
.lp-gift .gl{font:8px/1.6 var(--sans);letter-spacing:.12em}
.lp-gift .ga{font:500 23px/1.8 var(--serif);position:absolute;left:25px;right:18px;top:108px;z-index:2}
.lp-gift .ga small{display:block;font:8px/1.7 var(--sans);letter-spacing:.07em;margin-bottom:14px}
.lp-gift .gf{font:8px/1.6 var(--sans);position:absolute;bottom:23px;left:25px;letter-spacing:.06em}
.lp-gift .gd{position:absolute;inset:auto -40px -75px auto;width:190px;height:190px;border:1px solid currentColor;border-radius:50%;opacity:.35;box-shadow:0 0 0 15px #ffffff50,0 0 0 16px currentColor}
.lp-gift.left{background:#b5d2d0;transform:rotate(-16deg);left:0;top:80px;z-index:1}
.lp-gift.right{background:#e9beae;transform:rotate(15deg);right:0;top:88px;z-index:2}
.lp-gift.center{transform:rotate(-3deg);top:35px;left:calc(50% - 120px);z-index:3;border-top:6px solid #a93149}
.lp-gift.center:after{content:'';position:absolute;bottom:38px;right:-30px;width:115px;height:115px;background:#e65e49;border-radius:50%;opacity:.88}
.lp-gift.center:before{content:'';position:absolute;bottom:-38px;right:12px;width:70px;height:150px;background:#367b95;transform:rotate(35deg);z-index:1;opacity:.83}
.lp-stamp{position:absolute;right:20px;top:20px;width:58px;height:76px;color:#8d3045;border:1px solid currentColor;outline:1px solid #8d304555;outline-offset:3px;padding:5px;text-align:center;display:flex;flex-direction:column;justify-content:space-between;background:#fffaf0}
.lp-stamp svg{width:100%;height:31px}
.lp-stamp span{font:6px/1.4 Arial,sans-serif;letter-spacing:.03em}
.lp-stamp strong{font:13px/1 Arial,sans-serif;font-weight:400}
.lp-ribbon{position:absolute;left:8%;right:5%;top:362px;background:#a52f48;color:#fff5e4;z-index:4;transform:rotate(-5deg);font:12px/1.7 Georgia,serif;letter-spacing:.14em;text-align:center;padding:14px 12px;box-shadow:0 4px 0 #772d3e;clip-path:polygon(0 0,100% 0,96% 50%,100% 100%,0 100%,4% 50%)}
.lp-art-caption{position:absolute;bottom:12px;left:0;right:0;text-align:center;color:var(--muted);font:10px/1.5 var(--sans);letter-spacing:.07em}
.lp-confetti{position:absolute;inset:0;pointer-events:none;z-index:5}
.lp-confetti i{position:absolute;display:block;width:5px;height:15px;background:#c49a42;transform:rotate(25deg)}
.lp-confetti i:nth-child(1){left:8%;top:7%;background:#b4334e;transform:rotate(-30deg)}
.lp-confetti i:nth-child(2){right:9%;top:12%;transform:rotate(62deg)}
.lp-confetti i:nth-child(3){left:0;top:50%;background:#287f92;width:8px;height:8px}
.lp-confetti i:nth-child(4){right:1%;top:67%;background:#b4334e;transform:rotate(-35deg)}
.lp-confetti i:nth-child(5){left:24%;bottom:4%;transform:rotate(65deg)}
.lp-confetti i:nth-child(6){right:28%;top:1%;width:6px;height:6px;border-radius:50%;background:#367b95}
.lp-confetti i:nth-child(7){left:2%;top:24%;width:5px;height:5px;border-radius:50%}
.lp-bridge{display:grid;grid-template-columns:190px 1fr 225px;gap:26px;align-items:center;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:27px 0}
.lp-bridge-label{font:16px/1.8 var(--serif);letter-spacing:.1em}
.lp-bridge p{margin:0;font-size:12px;line-height:2;color:var(--muted)}
.lp-route{display:flex;align-items:center;gap:14px;font-size:11px}
.lp-route i{width:37px;border-top:1px solid var(--line)}

/* ---- 年表 ---- */
.lp-tl-tools{display:flex;flex-wrap:wrap;gap:12px 18px;align-items:center;margin-bottom:18px}
.lp-search{flex:1 1 260px;display:flex;align-items:center;border-bottom:1px solid var(--ink);min-height:48px}
.lp-search input{flex:1;border:0;background:transparent;font-size:16px;padding:8px 0;min-width:0}
.lp-search input:focus{outline:none}
.lp-chips{display:flex;flex-wrap:wrap;gap:8px}
.lp-chip{border:1px solid var(--line);background:transparent;padding:6px 12px;font-size:12px;min-height:40px;border-radius:999px}
.lp-chip[aria-pressed=true]{border-color:var(--ink);background:var(--ink);color:var(--paper)}
.lp-eras{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 26px}
.lp-era{border:1px solid var(--line);background:#fffdf8;text-align:left;padding:14px 16px;min-height:76px}
.lp-era b{display:block;font:500 17px/1.5 var(--serif)}
.lp-era small{font-size:11px;color:var(--muted)}
.lp-era[aria-pressed=true]{border-color:var(--accent);background:var(--soft)}
.lp-tl-layout{display:grid;grid-template-columns:120px 1fr;gap:40px}
.lp-years{position:sticky;top:16px;align-self:start;display:flex;flex-direction:column;gap:6px;border-top:1px solid var(--line);padding-top:18px;max-height:calc(100vh - 32px);overflow:auto}
.lp-years a{text-decoration:none;font:18px/1.5 Georgia,serif;color:var(--muted);padding:2px 0}
.lp-years a:hover{color:var(--accent)}
.lp-tl{border-top:1px solid var(--line)}
.lp-tl-year{font:28px/1 Georgia,serif;padding:26px 0 10px 25px;border-left:1px solid var(--line);scroll-margin-top:12px;color:var(--ink)}
.lp-row{position:relative;display:grid;grid-template-columns:70px 1fr auto;gap:22px;padding:18px 18px 18px 25px;border-bottom:1px solid var(--line);align-items:center;border-left:1px solid var(--line)}
.lp-row:before{content:'';position:absolute;left:-4px;top:28px;width:7px;height:7px;background:var(--paper);border:1px solid var(--muted);border-radius:50%}
.lp-row.is-selected:before{background:var(--accent);border-color:var(--accent)}
.lp-row.is-selected{background:var(--soft)}
.lp-row-date{font:12px/1.6 Arial,sans-serif;letter-spacing:.06em;color:var(--muted)}
.lp-row h3{font:500 18px/1.6 var(--serif);overflow-wrap:anywhere}
.lp-row p{margin:2px 0 0;font-size:11px;color:var(--muted);line-height:1.7}
.lp-row p a{color:var(--muted)}
.lp-row-act{display:flex;flex-direction:column;align-items:flex-end;gap:2px}
.lp-row button{border:0;background:transparent;border-bottom:1px solid var(--line);padding:9px 2px;font-size:12px;white-space:nowrap;min-height:44px}
.lp-row.is-selected button{color:var(--accent);border-color:var(--accent)}
.lp-row-count{font-size:11px;color:var(--accent);text-decoration:none}
.lp-more{display:flex;justify-content:center;padding:22px 0}

/* ---- 手紙をつくる ---- */
.lp-chosen{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;border:1px solid var(--line);background:#fffdf8;padding:12px 16px;margin-bottom:26px;font-size:13px}
.lp-chosen b{font:500 16px/1.6 var(--serif)}
.lp-atelier{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:40px;align-items:start}
.lp-fields{display:flex;flex-direction:column;gap:22px;border-top:1px solid var(--line);padding-top:22px}
.lp-label{display:flex;justify-content:space-between;gap:10px;font-size:13px;margin-bottom:6px}
.lp-label small{color:var(--muted);font-size:11px}
.lp-input,.lp-select{display:block;width:100%;background:transparent;padding:9px 0;border:0;border-bottom:1px solid var(--line);border-radius:0;font-size:16px;min-height:48px}
.lp-input:focus,.lp-select:focus{outline:none;border-bottom-color:var(--ink)}
.lp-name-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.lp-sns{display:grid;grid-template-columns:130px 1fr;gap:12px}
.lp-motifs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.lp-motifs button{display:flex;flex-direction:column;align-items:center;gap:8px;border:1px solid var(--line);background:transparent;padding:12px 5px;font-size:12px;min-height:88px;justify-content:center}
.lp-motifs button[aria-pressed=true]{border-color:var(--ink);background:var(--soft)}
.lp-swatch{width:28px;height:37px;background:#f9f4df;border:1px solid #bfc3b3;flex-shrink:0}
.lp-swatch.color{background:linear-gradient(115deg,#faf5e8 40%,#c2694d 40% 68%,#658f99 68%);border-top:3px solid #cf6045}
.lp-swatch.water{background:radial-gradient(circle at 100% 90%,#b9d3d0 40%,#eef4e8 42% 54%,#93bfbe 56% 57%,#f6f6ec 59%);border-top:3px solid #62949c}
.lp-swatch.stars{background:radial-gradient(circle at 70% 60%,#c6b67b 0 6%,#f4f2e2 8% 40%,#aab899 43% 45%,#f4f2e2 47%);border-top:3px solid #a69b62}
.lp-editor{border:1px solid var(--line);background:#fff}
.lp-toolbar{display:flex;flex-wrap:wrap;gap:4px;padding:6px;border-bottom:1px solid var(--line);background:#fffaf2;position:sticky;top:0;z-index:2}
.lp-toolbar button{min-width:40px;min-height:40px;border:1px solid transparent;background:transparent;font-size:13px;padding:0 8px;display:inline-flex;align-items:center;justify-content:center;gap:4px}
.lp-toolbar button[aria-pressed=true]{border-color:var(--ink);background:var(--soft)}
.lp-toolbar .sep{width:1px;background:var(--line);margin:4px 2px}
.lp-toolbar .dot{width:14px;height:14px;border-radius:50%;display:inline-block}
.lp-editor-area .ProseMirror{min-height:220px;padding:14px 14px 18px;font-size:16px;line-height:1.9;outline:none;white-space:pre-wrap;overflow-wrap:anywhere}
.lp-editor-area .ProseMirror p{margin:0;min-height:1.9em}
.lp-editor-area .ProseMirror .lp-s{font-size:.82em}
.lp-editor-area .ProseMirror .lp-l{font-size:1.3em}
.lp-editor-area .ProseMirror p.is-editor-empty:first-child:before{content:attr(data-placeholder);color:#aaa49b;float:left;height:0;pointer-events:none}
.lp-meter{display:flex;justify-content:space-between;gap:12px;font-size:12px;color:var(--muted);padding:8px 12px;border-top:1px solid var(--line);background:#fffaf2}
.lp-meter>span:first-child{white-space:nowrap}
.lp-meter .over{color:var(--accent);font-weight:600}
.lp-preview{position:sticky;top:12px}
.lp-sides{display:none;justify-content:center;margin:0 auto 14px;max-width:340px;border-bottom:1px solid var(--line)}
.lp-sides button{border:0;background:transparent;flex:1;min-height:48px;font-size:13px;border-bottom:2px solid transparent}
.lp-sides button[aria-pressed=true]{border-bottom-color:var(--ink);font-weight:600}
.lp-pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.lp-pair.single{grid-template-columns:1fr;max-width:340px;margin:0 auto}
.lp-caption{font-size:11px;color:var(--muted);display:flex;justify-content:space-between;margin:10px 0 0}
.lp-caption span{font-family:Arial,sans-serif;letter-spacing:.13em}
.lp-privacy{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.lp-privacy button{text-align:left;background:transparent;border:1px solid var(--line);padding:16px;font-size:14px;min-height:82px}
.lp-privacy button:before{content:'○';margin-right:8px}
.lp-privacy button[aria-pressed=true]{border-color:var(--ink);background:var(--soft)}
.lp-privacy button[aria-pressed=true]:before{content:'●'}
.lp-privacy small{display:block;color:var(--muted);font-size:12px;line-height:1.8;margin-top:5px;margin-left:21px}
.lp-consent{display:flex;gap:12px;align-items:flex-start;font-size:13px;line-height:1.9;cursor:pointer}
.lp-consent input{width:22px;height:22px;margin-top:4px;flex-shrink:0;accent-color:var(--accent)}
.lp-submit{display:flex;flex-direction:column;gap:14px;margin-top:28px;border-top:1px solid var(--line);padding-top:24px}
.lp-errors{margin:0;padding-left:1.2em;color:var(--accent);font-size:13px;line-height:1.9}
.lp-steps{display:grid;gap:4px;list-style:none;margin:0 0 26px;padding:0}
.lp-steps button{display:flex;flex-direction:column;align-items:center;gap:2px;width:100%;min-height:52px;padding:6px 0 8px;background:transparent;border:0;border-bottom:2px solid var(--line);font-size:12px;color:var(--muted)}
.lp-steps button span{font:11px/1.4 Arial,sans-serif;letter-spacing:.08em}
.lp-steps button.is-done{border-bottom-color:var(--gold);color:var(--ink)}
.lp-steps button[aria-current=step]{border-bottom-color:var(--ink);color:var(--ink);font-weight:600}
.lp-steps button[disabled]{cursor:default;opacity:.55}
.lp-step-head .lp-eyebrow{display:block;margin-bottom:4px}
.lp-step-head h3{margin:0;font:500 20px/1.6 var(--serif);outline:none}
.lp-step-nav{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:28px;border-top:1px solid var(--line);padding-top:20px}
.lp-step-nav .lp-primary{gap:18px}
.lp-privacy.single{grid-template-columns:1fr}
.lp-atelier.is-picking{display:block}
.lp-atelier.is-picking .lp-preview{display:none}
.lp-eras.is-steps{grid-template-columns:repeat(3,1fr);margin:0}
.lp-eras.is-steps .lp-era{min-height:96px}
.lp-song-skip{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px 20px}
.lp-song-skip .lp-note{flex:1 1 280px}
.lp-song-skip .lp-secondary[aria-pressed=true]{border-color:var(--accent);background:var(--soft)}
.lp-summary{margin:0;border-top:1px solid var(--line)}
.lp-summary>div{display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:10px;align-items:baseline;padding:10px 0;border-bottom:1px solid var(--line)}
.lp-summary dt{font-size:12px;color:var(--muted)}
.lp-summary dd{margin:0;font-size:14px;overflow-wrap:anywhere}
.lp-summary dd small{display:block;color:var(--muted);font-size:12px}
.lp-done{border:1px solid var(--accent);background:#fff;padding:22px}
.lp-done h3{font:500 22px/1.6 var(--serif);color:var(--accent)}
.lp-copy{display:flex;gap:8px;align-items:stretch;margin:10px 0}
.lp-copy input{flex:1;min-width:0;font-size:13px;border:1px solid var(--line);padding:8px;background:#fffdf8}

/* ---- カード(実寸 100×148mm) ---- */
.lp-scale{position:relative;width:100%;overflow:hidden}
.lp-scale>div{position:absolute;left:0;top:0;transform-origin:0 0}
.lp-card{width:100mm;height:148mm;background:var(--card);color:#293b3e;position:relative;overflow:hidden;border:1px solid #d9d6ca;isolation:isolate;font-family:var(--sans)}
.lp-shadow .lp-card{box-shadow:0 16px 30px #273b3b14,0 2px 4px #273b3b0d}
.lp-card:after{content:'';position:absolute;inset:0;pointer-events:none;opacity:.12;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' opacity='.25' filter='url(%23n)'/%3E%3C/svg%3E")}
.lp-card .motif{position:absolute;inset:0;z-index:-1;pointer-events:none}
.lp-card .motif:before,.lp-card .motif:after{content:'';position:absolute}
.lp-card.color{border-top:2mm solid #cf6045}
.lp-card.color .motif:before{width:77mm;height:77mm;background:#e67451;border-radius:50%;right:-27mm;bottom:-17mm;mix-blend-mode:multiply;opacity:.75}
.lp-card.color .motif:after{width:50mm;height:110mm;background:#559ca7;transform:rotate(38deg);right:-17mm;bottom:-60mm;mix-blend-mode:multiply;opacity:.9}
.lp-card.color .line{position:absolute;left:4.3mm;top:8.7mm;bottom:8.7mm;width:.7mm;background:linear-gradient(#cf6045 0 33%,#88afb0 33% 66%,#d5ac51 66%)}
.lp-card.water{border-top:2mm solid #62949c}
.lp-card.water .motif{background:radial-gradient(ellipse at 100% 100%,#87b9b98c,transparent 62%),linear-gradient(160deg,#f5f9ed00 60%,#c8dddd55)}
.lp-card.water .motif:before{width:77mm;height:77mm;border:.3mm solid #559ba6;border-radius:50%;right:-36mm;bottom:-15mm;box-shadow:0 0 0 5.7mm #77aeb01a,0 0 0 6mm #77aeb04d,0 0 0 12.7mm #77aeb018,0 0 0 13mm #77aeb03b}
.lp-card.water .motif:after{width:2.7mm;height:2.7mm;border:.3mm solid #78a9ad;border-radius:50%;right:13.7mm;top:40.7mm;box-shadow:-7mm -11.7mm 0 -.7mm #a2c3bc}
.lp-card.stars{border-top:2mm solid #a69b62}
.lp-card.stars .motif{background:radial-gradient(ellipse at 100% 100%,#d8dccaad,transparent 62%)}
.lp-card.stars .motif:before{width:87mm;height:53mm;border:.3mm solid #b5ad7f;border-radius:50%;bottom:-5mm;right:-28mm;transform:rotate(-35deg);box-shadow:0 0 0 8mm #aab39c12,0 0 0 8.3mm #aab39c77}
.lp-card.stars .motif:after{content:'✧';font:30mm/1 Georgia,serif;bottom:13mm;right:6.7mm;color:#ac9d63}
.lp-card.is-back .motif{opacity:.22}
.lp-card .top{position:absolute;top:8.3mm;left:8.7mm;right:8.7mm;display:flex;justify-content:space-between;align-items:flex-start}
.lp-card .tiny{font:3mm/1.5 var(--sans);letter-spacing:.14em}
.lp-card .mark{height:21mm;width:21mm;border:.3mm solid #aa513d;border-radius:50%;color:#aa513d;transform:rotate(-13deg);display:flex;flex-direction:column;justify-content:center;text-align:center;font:2.3mm/1.6 Arial,sans-serif;outline:.3mm solid #aa513d;outline-offset:-1.7mm;letter-spacing:.05em}
.lp-card .mark strong{font-size:5.3mm;font-weight:500;letter-spacing:.03em;line-height:1.3}
.lp-card .to{position:absolute;left:10mm;top:46mm;right:7mm;font:500 9mm/1.75 var(--serif);letter-spacing:.03em;z-index:1;overflow-wrap:anywhere}
.lp-card .to.is-long{font-size:7mm}
.lp-card .to.is-longer{font-size:5.6mm}
.lp-card .to small{display:block;font:3mm/1 var(--sans);letter-spacing:.15em;margin-bottom:4.7mm;color:#64716c}
.lp-card .to span{display:block}
.lp-card .from{position:absolute;left:10mm;right:10mm;bottom:9.3mm;z-index:1;font:3.7mm/1.7 var(--sans);overflow-wrap:anywhere}
.lp-card .from small{display:block;font-size:2.7mm;letter-spacing:.11em;color:#566865}
.lp-card .back-label{position:absolute;top:9mm;left:9.3mm;right:9.3mm;border-bottom:.3mm solid #ced2c4;padding-bottom:4mm;display:flex;justify-content:space-between;font:2.7mm/1.5 var(--sans);letter-spacing:.13em}
.lp-card .msg{position:absolute;top:24mm;left:9.7mm;right:9.7mm;bottom:21mm;font:3.6mm/1.95 var(--sans);z-index:1;overflow:hidden;overflow-wrap:anywhere;white-space:pre-wrap}
.lp-card .msg p{margin:0;min-height:1.95em}
.lp-card .msg .c{text-align:center}
.lp-card .msg .rs{font-size:3mm}
.lp-card .msg .rl{font-size:4.8mm;line-height:1.7}
.lp-card .msg b{font-weight:700}
.lp-card .msg.is-over{box-shadow:inset 0 -1.2mm 0 -.4mm #aa3149}
.lp-card .msg-hidden{position:absolute;top:24mm;left:9.7mm;right:9.7mm;bottom:21mm;display:flex;align-items:center;justify-content:center;text-align:center;font:3.4mm/2 var(--serif);color:#4b5754}
.lp-card .msg-hidden span{white-space:pre-line}
.lp-card .sign{position:absolute;right:9.7mm;bottom:9.5mm;font-size:3.7mm;max-width:60mm;text-align:right;overflow-wrap:anywhere;line-height:1.5}
.lp-measure{position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none}

/* ---- 届いた手紙 ---- */
.lp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:28px 22px}
.lp-grid a{text-decoration:none;display:block}
.lp-grid .meta{font-size:11px;color:var(--muted);margin-top:8px;line-height:1.7}
.lp-filter{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;margin-bottom:26px}

/* ---- 3 / 本に ---- */
.lp-book{border-top:1px solid var(--line);display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center;padding:60px 0}
.lp-book-pic{height:230px;position:relative;max-width:390px}
.lp-leaf{width:165px;height:220px;background:var(--card);position:absolute;top:5px;left:20%;border:1px solid #d6d5c6;transform:rotate(-7deg);box-shadow:4px 5px 0 #d8d7cb,8px 10px 0 #e6e2d5,0 18px 24px #14282614}
.lp-leaf:before{content:'';position:absolute;left:12px;top:0;bottom:0;border-left:1px solid #d6d5c6}
.lp-leaf.second{left:50%;transform:rotate(9deg);background:#e3e7db}
.lp-leaf div{font:15px/1.9 var(--serif);position:absolute;top:46px;left:32px}
.lp-leaf small{font:8px/1.9 var(--sans);display:block;margin-top:22px;color:#6d766b;letter-spacing:.12em}
.lp-book p{font-size:13px;color:var(--muted);line-height:2.1;max-width:34em}
.lp-book .ship{border-top:1px solid var(--line);padding-top:16px;margin-top:18px}
.lp-book .ship strong{font-weight:500;color:var(--accent)}
.lp-book-actions{display:flex;flex-wrap:wrap;align-items:center;gap:14px 22px;margin-top:24px}
.lp-footer{border-top:1px solid var(--line);padding:29px 0 40px;display:flex;justify-content:space-between;align-items:center;gap:30px}
.lp-footer p{font-size:11px;color:var(--muted);line-height:2;margin:0;max-width:60em}
.lp-dock{display:none}

/* ---- 運営 ---- */
.lp-admin-row{display:grid;grid-template-columns:150px 150px 1fr;gap:18px;border-top:1px solid var(--line);padding:18px 0}
.lp-admin-row .acts{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.lp-admin-row .acts button{font-size:12px;min-height:36px;padding:4px 10px;border:1px solid var(--line);background:#fff}
.lp-admin-row .acts button.is-primary{border-color:var(--accent);background:var(--accent);color:#fff}
.lp-admin-row dl{display:grid;grid-template-columns:auto 1fr;gap:2px 12px;font-size:12px;margin:8px 0 0}
.lp-admin-row dt{color:var(--muted)}
.lp-admin-row dd{margin:0;overflow-wrap:anywhere}
.lp-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 18px}
.lp-table{width:100%;border-collapse:collapse;font-size:12px}
.lp-table th,.lp-table td{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}
.lp-print-pages{display:flex;flex-wrap:wrap;gap:12px}

@media(max-width:1100px){.lp-wrap{padding:0 32px}.lp-art{transform:scale(.82);transform-origin:center right;margin-left:-35px}.lp-birthday .wish{font-size:36px}.lp-birthday .artist{font-size:105px}.lp-bridge{grid-template-columns:170px 1fr}.lp-route{display:none}.lp-atelier{grid-template-columns:1fr 1fr;gap:26px}}
@media(max-width:860px){.lp-atelier{display:flex;flex-direction:column;gap:30px}.lp-preview{position:static;width:100%}.lp-fields{width:100%}}
/* スマホでは「次へ」を入力のすぐ下に(カードの見本はその下)。確認の画面だけ、カードを見てから送る */
@media(max-width:860px){.lp-composer{display:flex;flex-direction:column}.lp-composer>.lp-atelier{display:contents}.lp-composer .lp-preview{order:2;margin-top:34px}.lp-composer .lp-step-nav{order:1}.lp-composer .lp-step-after{order:3}.lp-composer.is-confirm .lp-preview{order:1}}
@media(max-width:780px){
.lp{padding-bottom:calc(76px + env(safe-area-inset-bottom))}
.lp-wrap{padding:0 20px}
.lp-header{padding:14px 0 12px}
.lp-brand{font-size:22px}.lp-brand span{display:none}
.lp-header-nav{gap:12px;font-size:12px}.lp-header-date{display:none}
.lp-hero{display:flex;flex-direction:column;text-align:center;padding:25px 0 32px}
.lp-kicker{font-size:10px;letter-spacing:.04em;margin:0 0 16px}
.lp-birthday .wish{font-size:35px}
.lp-birthday .artist{font-size:86px;line-height:.96;letter-spacing:-.07em;margin-top:9px}
.lp-birthday .artist:after{font-size:21px;margin:10px 0 0 10px}
.lp-art{order:1;margin:12px auto 0;height:231px;max-width:350px;transform:none}
.lp-art:before{width:185px;height:185px;top:14px;left:calc(50% - 92px);box-shadow:0 0 0 12px #c2a66a08,0 0 0 13px #c2a66a33}
.lp-gift{width:133px;padding:15px 12px}
.lp-gift.left{left:16px;top:24px;transform:rotate(-15deg)}
.lp-gift.right{right:15px;top:27px;transform:rotate(15deg)}
.lp-gift.center{left:calc(50% - 69px);width:138px;top:7px;border-top-width:4px}
.lp-gift .gl{font-size:5px;text-align:left}
.lp-gift .ga{font-size:14px;line-height:1.8;top:67px;left:14px;right:10px;text-align:left}
.lp-gift.left .ga,.lp-gift.right .ga{font-size:12px;top:56px}
.lp-gift .ga small{font-size:5px;line-height:1.4;margin-bottom:8px}
.lp-gift .gf{font-size:5px;bottom:12px;left:14px}
.lp-gift .gd{width:105px;height:105px;right:-23px;bottom:-40px;box-shadow:0 0 0 9px #ffffff50,0 0 0 10px currentColor}
.lp-gift.center:after{width:65px;height:65px;bottom:21px;right:-16px}
.lp-gift.center:before{width:40px;height:85px;bottom:-20px;right:8px}
.lp-stamp{width:32px;height:44px;right:11px;top:11px;padding:3px;outline-offset:2px}
.lp-stamp svg{height:18px}.lp-stamp span{font-size:4px}.lp-stamp strong{font-size:8px}
.lp-ribbon{top:174px;left:3%;right:3%;padding:8px;font-size:9px;letter-spacing:.1em;box-shadow:0 3px 0 #772d3e}
.lp-confetti i{width:4px;height:10px}
.lp-art-caption{font-size:8px;bottom:0}
.lp-project{order:2;margin:13px 0 0}
.lp-project h2{font-size:20px;line-height:1.6}
.lp-tagline{font-size:13px;margin-top:10px;font-weight:500}
.lp-actions{order:3;justify-content:center;flex-direction:column;gap:0;margin-top:16px}
.lp-deadline{width:100%;margin:0 0 11px}
.lp-deadline strong{font-size:15px}
.lp-actions .lp-primary{width:100%;max-width:330px;font-size:14px;min-height:50px;justify-content:center;gap:24px}
.lp-actions .lp-text-link{font-size:13px;min-height:44px;border-bottom:0;display:inline-flex;align-items:center}
.lp-hero-intro{order:4;margin:2px 0 0}
.lp-bridge{display:block;padding:24px 0}
.lp-bridge-label{font-size:19px;margin-bottom:10px}
.lp-bridge p br{display:none}
.lp-section{padding:46px 0}
.lp-section-head{display:block;margin-bottom:22px}
.lp-section-head h2{font-size:24px;line-height:1.75}
.lp-section-head .lp-intro{margin-top:12px}
.lp-eras{grid-template-columns:1fr;gap:8px}
.lp-eras.is-steps{grid-template-columns:1fr}
.lp-eras.is-steps .lp-era{min-height:72px}
.lp-era{min-height:60px;padding:10px 14px}
.lp-tl-layout{display:block}
.lp-years{position:sticky;top:0;z-index:3;flex-direction:row;overflow-x:auto;max-height:none;background:var(--paper);border-top:0;border-bottom:1px solid var(--line);padding:6px 0;margin:0 -20px 0;padding-left:20px;gap:14px;scrollbar-width:none}
.lp-years::-webkit-scrollbar{display:none}
.lp-years a{font-size:15px;white-space:nowrap;min-height:36px;display:inline-flex;align-items:center}
.lp-tl-year{padding:20px 0 6px 15px;font-size:24px;scroll-margin-top:52px}
.lp-row{grid-template-columns:52px 1fr;gap:10px;padding:16px 10px 14px 15px}
.lp-row:before{top:24px}
.lp-row h3{font-size:17px}
.lp-row-act{grid-column:2;align-items:flex-start;flex-direction:row;flex-wrap:wrap;gap:4px 14px}
.lp-row button{font-size:13px;padding:6px 0}
.lp-sns{grid-template-columns:110px 1fr}
.lp-sides{display:flex}
.lp-pair{display:block;max-width:330px;margin:0 auto}
.lp-pair>[data-side=back]{display:none}
.lp-pair.show-back>[data-side=front]{display:none}
.lp-pair.show-back>[data-side=back]{display:block}
.lp-privacy{grid-template-columns:1fr}
.lp-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 12px}
.lp-book{display:flex;flex-direction:column;gap:20px;padding:40px 0}
.lp-book-pic{width:100%;height:205px;max-width:340px}
.lp-leaf{width:145px;height:190px;left:12%}.lp-leaf.second{left:48%}
.lp-footer{align-items:flex-start;flex-direction:column;gap:14px}
.lp-dock{display:flex;gap:10px;position:fixed;z-index:10;bottom:0;left:0;right:0;padding:11px 20px max(11px,env(safe-area-inset-bottom));background:var(--paper);border-top:1px solid var(--line);box-shadow:0 -6px 25px #293b3b08}
.lp.is-typing .lp-dock{display:none}
.lp-dock a{flex:1;display:flex;justify-content:center;align-items:center;gap:10px;text-decoration:none;border:1px solid var(--line);font-size:13px;min-height:48px}
.lp-dock a:last-child{background:var(--accent);border-color:var(--accent);color:#fffaf0}
.lp-dock small{font:10px/1 Arial,sans-serif;letter-spacing:.1em}
.lp-admin-row{grid-template-columns:1fr 1fr}
.lp-admin-row>div:last-child{grid-column:1/-1}
}
@media(max-width:360px){.lp-birthday .wish{font-size:32px}.lp-birthday .artist{font-size:79px}.lp-project h2{font-size:18px}.lp-gift.left{left:8px}.lp-gift.right{right:8px}.lp-wrap{padding:0 16px}.lp-years{margin:0 -16px;padding-left:16px}}
@media(prefers-reduced-motion:reduce){.lp *{transition:none!important;scroll-behavior:auto!important}}

/* ---- 印刷(運営の印刷画面) ---- */
@media print{
  @page{size:100mm 148mm;margin:0}
  html,body{background:#fff!important;margin:0!important;padding:0!important}
  .lp{background:#fff;padding:0!important;min-height:0}
  .lp-noprint{display:none!important}
  .lp-wrap,.lp main,.lp-section{padding:0!important;margin:0!important;max-width:none!important;border:0!important}
  .lp-print-pages{display:block}
  .lp-print-page:last-child{page-break-after:auto;break-after:auto}
  .lp-print-page{width:100mm;height:148mm;page-break-after:always;break-after:page;overflow:hidden}
  .lp-print-page .lp-card{border-left:0;border-right:0;border-bottom:0;box-shadow:none}
  .lp-print-page .lp-card:after{display:none}
  .lp-card .msg.is-over{box-shadow:none}
  .lp-card,.lp-card *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
`;
