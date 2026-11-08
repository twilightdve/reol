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
.lp-address-parts{display:grid;grid-template-columns:1.3fr 1.3fr 1fr;gap:14px}
.lp-address-other{grid-column:1/-1}
.lp-address-result{display:flex;align-items:baseline;gap:14px;margin:18px 0 0;padding:14px 16px;background:#fffdf8;border:1px solid var(--line)}
.lp-address-result span{font-size:11px;color:var(--muted);flex-shrink:0}
.lp-address-result b{font:500 18px/1.6 var(--serif);word-break:break-all}
.lp-sns{display:grid;grid-template-columns:130px 1fr;gap:12px}
.lp-motifs{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px}
.lp-motifs button{display:flex;flex-direction:column;align-items:center;gap:6px;border:1px solid var(--line);background:transparent;padding:12px 6px 10px;font-size:12px;justify-content:flex-start;text-align:center}
.lp-motifs button b{font-weight:500;line-height:1.4}
.lp-motifs button small{font-size:10px;line-height:1.5;color:var(--muted)}
.lp-motifs button[aria-pressed=true]{border-color:var(--ink);background:var(--soft)}
.lp-swatch{display:block;width:54px;height:80px;position:relative;overflow:hidden;flex-shrink:0;box-shadow:0 2px 6px #273b3b1f}
.lp-swatch .lp-card{display:block;position:absolute;left:0;top:0;transform:scale(.1429);transform-origin:0 0}
.lp-swatch .motif{display:block}
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
.lp-sides[hidden],.lp-pair>[hidden]{display:none!important}
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
.lp-consent+.lp-consent{margin-top:12px}
.lp-rules{border:1px solid var(--accent);background:#fff;padding:16px 18px 14px;margin:20px 0 16px}
.lp-rules h4{font:500 15px/1.6 var(--serif);color:var(--accent);margin:0 0 8px}
.lp-rules ul{margin:0;padding-left:1.2em;font-size:13px;line-height:1.9}
.lp-rules li+li{margin-top:4px}
.lp-rules b{font-weight:600}
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
.lp-card.mirror{border-top:2mm solid #7f8b98}
.lp-card.mirror .motif{background:linear-gradient(135deg,transparent 58%,#c9d0d833 58% 72%,transparent 72%)}
.lp-card.mirror .motif:before{width:74mm;height:74mm;right:-14mm;bottom:-12mm;background:conic-gradient(from 20deg at 42% 46%,#e3e7ec 0 40deg,#b7c0ca 40deg 95deg,#eef1f4 95deg 160deg,#a7b1bd 160deg 230deg,#d2d8df 230deg 300deg,#c1c9d2 300deg);clip-path:polygon(12% 30%,46% 4%,88% 14%,100% 52%,84% 92%,40% 100%,4% 74%);opacity:.6}
.lp-card.mirror .motif:after{width:74mm;height:74mm;right:-14mm;bottom:-12mm;clip-path:polygon(12% 30%,46% 4%,88% 14%,100% 52%,84% 92%,40% 100%,4% 74%);background:linear-gradient(28deg,transparent 49.5%,#6f7b88 49.5% 50.5%,transparent 50.5%),linear-gradient(-62deg,transparent 49.6%,#6f7b88 49.6% 50.4%,transparent 50.4%),linear-gradient(98deg,transparent 49.6%,#6f7b88aa 49.6% 50.4%,transparent 50.4%),linear-gradient(155deg,transparent 49.6%,#6f7b8899 49.6% 50.4%,transparent 50.4%);opacity:.7}
.lp-card.moon{border-top:2mm solid #4f6a9a}
.lp-card.moon .motif{background:radial-gradient(ellipse at 100% 100%,#c9d6ec88,transparent 60%)}
.lp-card.moon .motif:before{width:44mm;height:44mm;border-radius:50%;right:-6mm;bottom:16mm;box-shadow:inset -8mm 5mm 0 0 #d8c37f;opacity:.85}
.lp-card.moon .motif:after{width:13mm;height:15mm;right:44mm;bottom:12mm;background:#9fb4d8;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);opacity:.55;box-shadow:none}
.lp-card.candy{border-top:2mm solid #d7739a}
.lp-card.candy .motif{background:radial-gradient(circle at 82% 82%,#f2a7c4 0 4.4mm,transparent 4.6mm),radial-gradient(circle at 66% 90%,#9fd3e0 0 3.2mm,transparent 3.4mm),radial-gradient(circle at 92% 66%,#f6cf72 0 2.8mm,transparent 3mm),radial-gradient(circle at 56% 78%,#b7e0b0 0 2.2mm,transparent 2.4mm),radial-gradient(circle at 76% 70%,#c7b3ea 0 1.8mm,transparent 2mm)}
.lp-card.candy .motif:before{width:56mm;height:90mm;right:-4mm;top:22mm;background:repeating-linear-gradient(104deg,transparent 0 5.5mm,#86bfd466 5.5mm 5.8mm);-webkit-mask-image:linear-gradient(transparent,#000 35%,#000 60%,transparent);mask-image:linear-gradient(transparent,#000 35%,#000 60%,transparent)}
.lp-card.candy .motif:after{width:6mm;height:6mm;right:30mm;bottom:40mm;border-radius:0 50% 50% 50%;transform:rotate(45deg);background:#86bfd4;opacity:.7;box-shadow:-14mm 10mm 0 -1mm #86bfd4aa,10mm -18mm 0 -1.5mm #86bfd499}
.lp-card.petals{border-top:2mm solid #c9768a}
.lp-card.petals .motif{background:radial-gradient(ellipse at 100% 100%,#f3d3d977,transparent 60%)}
.lp-card.petals .motif:before{width:11mm;height:16mm;right:14mm;bottom:16mm;border-radius:100% 0;background:#eeb3c0;transform:rotate(28deg);box-shadow:-22mm 8mm 0 -2mm #f3c8d1,-8mm -26mm 0 -3mm #eaa9b8,8mm -48mm 0 -4mm #f5d2d9,-34mm -16mm 0 -4mm #efbfca,-2mm -70mm 0 -5mm #f3cdd5;opacity:.85}
.lp-card.petals .motif:after{width:52mm;height:52mm;border-radius:50%;right:-20mm;bottom:-20mm;border:.3mm solid #d595a4;box-shadow:0 0 0 4mm #f3d3d933,0 0 0 4.3mm #d595a466}
.lp-card.glitter{border-top:2mm solid #c9a23f}
.lp-card.glitter .motif{background:radial-gradient(circle at 84% 84%,#f3dd9a99,transparent 34%),radial-gradient(circle at 18% 86%,#d9b55a 0 .5mm,transparent .6mm),radial-gradient(circle at 70% 60%,#d9b55a 0 .45mm,transparent .55mm),radial-gradient(circle at 90% 40%,#d9b55a 0 .5mm,transparent .6mm),radial-gradient(circle at 40% 92%,#d9b55a 0 .4mm,transparent .5mm),radial-gradient(circle at 60% 76%,#d9b55a 0 .35mm,transparent .45mm)}
.lp-card.glitter .motif:before{content:'✦';font:16mm/1 Georgia,serif;color:#c9a23f;right:9mm;bottom:14mm;text-shadow:-15mm -10mm 0 #d8b968,-4mm -26mm 0 #e3c983}
.lp-card.glitter .motif:after{content:'✧';font:9mm/1 Georgia,serif;color:#c9a23f;right:28mm;bottom:28mm;opacity:.8}
.lp-card.film{border-top:2mm solid #8e7cc3}
.lp-card.film .motif:before,.lp-card.film .motif:after{width:30mm;height:190mm;right:6mm;top:-20mm;transform:rotate(16deg)}
.lp-card.film .motif:before{background:linear-gradient(180deg,#f7b5c6,#f9d99a,#bfe3c0,#a9d3ea,#c7b3ea,#f7b5c6,#f9d99a);opacity:.45}
.lp-card.film .motif:after{background:repeating-linear-gradient(180deg,#faf8ef 0 2mm,transparent 2mm 4.5mm) left/2.6mm 100% no-repeat,repeating-linear-gradient(180deg,#faf8ef 0 2mm,transparent 2mm 4.5mm) right/2.6mm 100% no-repeat}
.lp-card.edge{border-top:2mm solid #b8343f}
.lp-card.edge .motif{background:linear-gradient(200deg,transparent 60%,#f1d5d566)}
.lp-card.edge .motif:before{width:3.2mm;height:130mm;right:34mm;bottom:-34mm;transform:rotate(34deg);background:linear-gradient(90deg,#b3bac2,#f4f6f8 50%,#8e98a3);clip-path:polygon(0 7%,50% 0,100% 7%,100% 100%,0 100%);opacity:.85}
.lp-card.edge .motif:after{width:6.4mm;height:6.4mm;border-radius:50%;right:12mm;bottom:18mm;background:#efc65c;box-shadow:0 -4.2mm 0 .4mm #c94450,4mm -1.3mm 0 .4mm #c94450,2.5mm 3.5mm 0 .4mm #c94450,-2.5mm 3.5mm 0 .4mm #c94450,-4mm -1.3mm 0 .4mm #c94450,-16mm 12mm 0 -1.2mm #d7656f,-12mm 8.6mm 0 -1.6mm #d7656f}
.lp-card.brush{border-top:2mm solid #c8323a}
.lp-card.brush .motif{background:radial-gradient(ellipse at 100% 100%,#e0474d33,transparent 55%)}
.lp-card.brush .motif:before{width:13mm;height:132mm;left:-6.5mm;top:8mm;background:#1d1d1f;border-radius:40% 60% 50% 40%/8% 6% 10% 6%;transform:rotate(2deg);-webkit-mask-image:linear-gradient(transparent,#000 12%,#000 78%,transparent);mask-image:linear-gradient(transparent,#000 12%,#000 78%,transparent);opacity:.85}
.lp-card.brush .motif:after{width:46mm;height:16mm;right:-6mm;bottom:22mm;border-top:.9mm solid #d03a41;border-radius:50%;transform:rotate(-12deg);box-shadow:0 -4mm 0 -3mm #d03a41;opacity:.75}
.lp-card.monitor{border-top:2mm solid #2f6f73}
.lp-card.monitor .motif{background:repeating-linear-gradient(0deg,transparent 0 1.2mm,#2f6f730d 1.2mm 1.5mm)}
.lp-card.monitor .motif:before{width:52mm;height:40mm;right:-8mm;bottom:12mm;border:2.4mm solid #2f6f7399;border-radius:6mm/8mm;background:radial-gradient(ellipse,#c6ebe6aa,#7fb9b855);opacity:.75}
.lp-card.monitor .motif:after{width:3mm;height:3mm;right:28mm;bottom:58mm;background:#e2574c;box-shadow:4mm 0 #f2b33d,8mm 0 #57a773;opacity:.75}
.lp-card.lantern{border-top:2mm solid #b5452f}
.lp-card.lantern .motif{background:radial-gradient(circle at 18% 14%,#d8553f 0 1.5mm,transparent 1.6mm),radial-gradient(circle at 42% 18%,#e6a24a 0 1.5mm,transparent 1.6mm),radial-gradient(circle at 66% 19%,#d8553f 0 1.5mm,transparent 1.6mm),radial-gradient(circle at 90% 15%,#e6a24a 0 1.5mm,transparent 1.6mm),radial-gradient(ellipse at 90% 92%,#f2b56b55,transparent 45%)}
.lp-card.lantern .motif:before{width:22mm;height:30mm;right:11mm;bottom:12mm;border-radius:45%/40%;background:repeating-linear-gradient(0deg,transparent 0 4mm,#b5452f44 4mm 4.4mm),radial-gradient(ellipse,#f8dd94,#e98a5b 72%);box-shadow:0 0 12mm #f2b56b88;opacity:.85}
.lp-card.lantern .motif:after{width:96mm;height:16mm;left:2mm;top:9mm;border-bottom:.3mm solid #b5452f66;border-radius:0 0 50% 50%}
.lp-card.rings{border-top:2mm solid #6d4d8a}
.lp-card.rings .motif:before{width:76mm;height:76mm;right:-26mm;bottom:-22mm;border-radius:50%;background:repeating-radial-gradient(circle,transparent 0 3mm,#8b6fb055 3mm 3.3mm);opacity:.85}
.lp-card.rings .motif:after{width:76mm;height:76mm;right:-26mm;bottom:-22mm;border-radius:50%;background:repeating-conic-gradient(from 0deg,#8b6fb02e 0 3deg,transparent 3deg 15deg);-webkit-mask-image:radial-gradient(circle,transparent 30%,#000 32%);mask-image:radial-gradient(circle,transparent 30%,#000 32%)}
.lp-card.pulse{border-top:2mm solid #a8323e}
.lp-card.pulse .motif{background:radial-gradient(ellipse at 100% 100%,#f0cfd255,transparent 55%)}
.lp-card.pulse .motif:before{left:0;right:0;height:16mm;bottom:22mm;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 40'%3E%3Cpath d='M0 22H58L66 8L74 36L82 4L90 30L96 22H200' fill='none' stroke='%23b0404d' stroke-width='1.3' stroke-linejoin='round'/%3E%3C/svg%3E") center/100% 100% no-repeat;opacity:.7}
.lp-card.pulse .motif:after{width:8mm;height:7mm;right:12mm;bottom:40mm;background:#c94a57;clip-path:path('M4 7 C1 4.6 0 3.4 0 2 C0 .8 .9 0 2 0 C2.9 0 3.6 .6 4 1.3 C4.4 .6 5.1 0 6 0 C7.1 0 8 .8 8 2 C8 3.4 7 4.6 4 7Z');transform:scale(2.2);transform-origin:100% 100%;opacity:.55}
.lp-card.sky{border-top:2mm solid #6aa6c8}
.lp-card.sky .motif{background:linear-gradient(185deg,#bfdcee 0,#e2eff5 34%,transparent 62%)}
.lp-card.sky .motif:before{width:34mm;height:11mm;border-radius:11mm;right:8mm;bottom:20mm;background:#f4f9fc;box-shadow:7mm -5mm 0 1.4mm #f4f9fc,-9mm -2.6mm 0 -.6mm #f4f9fc,7mm -5mm 0 1.8mm #8fbad4aa,-9mm -2.6mm 0 -.2mm #8fbad4aa,0 0 0 .4mm #8fbad4aa}
.lp-card.sky .motif:after{width:20mm;height:7mm;border-radius:7mm;right:46mm;bottom:46mm;background:#f4f9fc;box-shadow:5mm -3.4mm 0 1mm #f4f9fc,5mm -3.4mm 0 1.4mm #8fbad499,0 0 0 .4mm #8fbad499}
.lp-card.moss{border-top:2mm solid #5d7a4a}
.lp-card.moss .motif{background:radial-gradient(ellipse at 100% 100%,#7d9a5e55,transparent 55%)}
.lp-card.moss .motif:before{width:64mm;height:40mm;right:-12mm;bottom:-8mm;border-radius:60% 45% 0 0/75% 65% 0 0;background:radial-gradient(circle at 18% 30%,#9db785 0 2mm,transparent 2.2mm),radial-gradient(circle at 46% 20%,#8aa671 0 1.6mm,transparent 1.8mm),radial-gradient(circle at 70% 36%,#9db785 0 2.2mm,transparent 2.4mm),radial-gradient(circle at 30% 30%,#7f9a68,#566f45 72%);opacity:.6}
.lp-card.moss .motif:after{width:24mm;height:24mm;border-radius:50%;right:14mm;bottom:30mm;border:.6mm solid #b49c62;background:radial-gradient(circle at 35% 30%,#ffffffdd,#dfe4d6 62%);box-shadow:0 0 0 1.4mm #faf6ea,0 0 0 1.7mm #b49c6288}
.lp-card.key{border-top:2mm solid #9a7b3c}
.lp-card.key .motif:before{width:54mm;height:70mm;right:-10mm;bottom:-12mm;border:2.6mm double #b89a5a;outline:.3mm solid #b89a5a66;outline-offset:2mm;background:radial-gradient(ellipse at 60% 40%,#efe3c455,transparent 70%);opacity:.75}
.lp-card.key .motif:after{width:36mm;height:13mm;right:10mm;bottom:28mm;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 44'%3E%3Cg fill='none' stroke='%23a07f3c' stroke-width='2.2'%3E%3Ccircle cx='20' cy='22' r='14'/%3E%3Ccircle cx='20' cy='22' r='6'/%3E%3Cpath d='M34 22H112M96 22v12M106 22v9M84 22v7'/%3E%3C/g%3E%3C/svg%3E") center/contain no-repeat;transform:rotate(-28deg);opacity:.8}
.lp-card.butterfly{border-top:2mm solid #d5ac51}
.lp-card.butterfly .motif{background:radial-gradient(ellipse at 100% 100%,#f6e2c488,transparent 55%)}
.lp-card.butterfly .motif:before{width:42mm;height:34mm;right:8mm;bottom:22mm;transform:rotate(-10deg);background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 80'%3E%3Cpath d='M50 40C35 10 5 4 8 30C10 45 30 48 50 40Z' fill='%23e67451' opacity='.85'/%3E%3Cpath d='M50 40C65 10 95 4 92 30C90 45 70 48 50 40Z' fill='%23d5ac51' opacity='.85'/%3E%3Cpath d='M50 42C38 50 22 70 34 74C44 76 48 60 50 42Z' fill='%23559ca7' opacity='.8'/%3E%3Cpath d='M50 42C62 50 78 70 66 74C56 76 52 60 50 42Z' fill='%23cf6045' opacity='.75'/%3E%3Cpath d='M50 30V60M50 30L44 20M50 30L56 20' stroke='%235a4a3a' stroke-width='1.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") center/contain no-repeat;opacity:.85}
.lp-card.butterfly .motif:after{width:18mm;height:15mm;right:50mm;bottom:40mm;transform:rotate(14deg);background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 80'%3E%3Cpath d='M50 40C35 10 5 4 8 30C10 45 30 48 50 40Z' fill='%23e67451' opacity='.85'/%3E%3Cpath d='M50 40C65 10 95 4 92 30C90 45 70 48 50 40Z' fill='%23d5ac51' opacity='.85'/%3E%3Cpath d='M50 42C38 50 22 70 34 74C44 76 48 60 50 42Z' fill='%23559ca7' opacity='.8'/%3E%3Cpath d='M50 42C62 50 78 70 66 74C56 76 52 60 50 42Z' fill='%23cf6045' opacity='.75'/%3E%3Cpath d='M50 30V60M50 30L44 20M50 30L56 20' stroke='%235a4a3a' stroke-width='1.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") center/contain no-repeat;opacity:.5}
.lp-card.fan{border-top:2mm solid #c9434e}
.lp-card.fan .motif{background:radial-gradient(ellipse at 100% 100%,#f4d6cf88,transparent 55%)}
.lp-card.fan .motif:before{width:64mm;height:41mm;right:-8mm;bottom:8mm;transform:rotate(-14deg);background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 64'%3E%3Cpath d='M36.8 55.2L3.0 42.9A50 50 0 0 1 10.3 29.6L38.9 51.5Z' fill='%23c9434e'/%3E%3Cpath d='M38.9 51.5L10.3 29.6A50 50 0 0 1 21.3 19.0L42.0 48.5Z' fill='%23e0656c'/%3E%3Cpath d='M42.0 48.5L21.3 19.0A50 50 0 0 1 35.0 12.3L45.8 46.6Z' fill='%23c9434e'/%3E%3Cpath d='M45.8 46.6L35.0 12.3A50 50 0 0 1 50.0 10.0L50.0 46.0Z' fill='%23e0656c'/%3E%3Cpath d='M50.0 46.0L50.0 10.0A50 50 0 0 1 65.0 12.3L54.2 46.6Z' fill='%23c9434e'/%3E%3Cpath d='M54.2 46.6L65.0 12.3A50 50 0 0 1 78.7 19.0L58.0 48.5Z' fill='%23e0656c'/%3E%3Cpath d='M58.0 48.5L78.7 19.0A50 50 0 0 1 89.7 29.6L61.1 51.5Z' fill='%23c9434e'/%3E%3Cpath d='M61.1 51.5L89.7 29.6A50 50 0 0 1 97.0 42.9L63.2 55.2Z' fill='%23e0656c'/%3E%3Cpath d='M50 60L3.0 42.9' stroke='%237a3a2a' stroke-width='.9'/%3E%3Cpath d='M50 60L10.3 29.6' stroke='%237a3a2a' stroke-width='.9'/%3E%3Cpath d='M50 60L21.3 19.0' stroke='%237a3a2a' stroke-width='.9'/%3E%3Cpath d='M50 60L35.0 12.3' stroke='%237a3a2a' stroke-width='.9'/%3E%3Cpath d='M50 60L50.0 10.0' stroke='%237a3a2a' stroke-width='.9'/%3E%3Cpath d='M50 60L65.0 12.3' stroke='%237a3a2a' stroke-width='.9'/%3E%3Cpath d='M50 60L78.7 19.0' stroke='%237a3a2a' stroke-width='.9'/%3E%3Cpath d='M50 60L89.7 29.6' stroke='%237a3a2a' stroke-width='.9'/%3E%3Cpath d='M50 60L97.0 42.9' stroke='%237a3a2a' stroke-width='.9'/%3E%3Cpath d='M6.8 44.3A46 46 0 0 1 93.2 44.3' stroke='%23f2c46b' stroke-width='1.6' fill='none'/%3E%3Ccircle cx='50' cy='60' r='2.6' fill='%237a3a2a'/%3E%3C/svg%3E") center/contain no-repeat;opacity:.8}
.lp-card.clock{border-top:2mm solid #8a6a3f}
.lp-card.clock .motif{background:radial-gradient(ellipse at 100% 100%,#efe3c488,transparent 55%)}
.lp-card.clock .motif:before{width:46mm;height:46mm;right:-8mm;bottom:14mm;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='44' fill='%23fbf6ea' stroke='%238a6a3f' stroke-width='1.6'/%3E%3Ccircle cx='50' cy='50' r='39' fill='none' stroke='%238a6a3f' stroke-width='.5'/%3E%3Cpath d='M89.0 50.0L83.0 50.0' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M88.8 54.1L86.3 53.8' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M88.1 58.1L85.7 57.6' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M87.1 62.1L84.7 61.3' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M85.6 65.9L83.3 64.8' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M83.8 69.5L78.6 66.5' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M81.6 72.9L79.5 71.5' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M79.0 76.1L77.1 74.4' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M76.1 79.0L74.4 77.1' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M72.9 81.6L71.5 79.5' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M69.5 83.8L66.5 78.6' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M65.9 85.6L64.8 83.3' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M62.1 87.1L61.3 84.7' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M58.1 88.1L57.6 85.7' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M54.1 88.8L53.8 86.3' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M50.0 89.0L50.0 83.0' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M45.9 88.8L46.2 86.3' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M41.9 88.1L42.4 85.7' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M37.9 87.1L38.7 84.7' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M34.1 85.6L35.2 83.3' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M30.5 83.8L33.5 78.6' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M27.1 81.6L28.5 79.5' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M23.9 79.0L25.6 77.1' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M21.0 76.1L22.9 74.4' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M18.4 72.9L20.5 71.5' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M16.2 69.5L21.4 66.5' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M14.4 65.9L16.7 64.8' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M12.9 62.1L15.3 61.3' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M11.9 58.1L14.3 57.6' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M11.2 54.1L13.7 53.8' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M11.0 50.0L17.0 50.0' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M11.2 45.9L13.7 46.2' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M11.9 41.9L14.3 42.4' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M12.9 37.9L15.3 38.7' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M14.4 34.1L16.7 35.2' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M16.2 30.5L21.4 33.5' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M18.4 27.1L20.5 28.5' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M21.0 23.9L22.9 25.6' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M23.9 21.0L25.6 22.9' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M27.1 18.4L28.5 20.5' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M30.5 16.2L33.5 21.4' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M34.1 14.4L35.2 16.7' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M37.9 12.9L38.7 15.3' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M41.9 11.9L42.4 14.3' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M45.9 11.2L46.2 13.7' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M50.0 11.0L50.0 17.0' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M54.1 11.2L53.8 13.7' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M58.1 11.9L57.6 14.3' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M62.1 12.9L61.3 15.3' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M65.9 14.4L64.8 16.7' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M69.5 16.2L66.5 21.4' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M72.9 18.4L71.5 20.5' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M76.1 21.0L74.4 22.9' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M79.0 23.9L77.1 25.6' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M81.6 27.1L79.5 28.5' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M83.8 30.5L78.6 33.5' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M85.6 34.1L83.3 35.2' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M87.1 37.9L84.7 38.7' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M88.1 41.9L85.7 42.4' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M88.8 45.9L86.3 46.2' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M50 50L40.0 32.7' stroke='%235a4026' stroke-width='2.4' stroke-linecap='round'/%3E%3Cpath d='M50 50L76.0 35.0' stroke='%235a4026' stroke-width='1.4' stroke-linecap='round'/%3E%3Ccircle cx='50' cy='50' r='2.2' fill='%23b8343f'/%3E%3C/svg%3E") center/contain no-repeat;opacity:.75}
.lp-card.clock .motif:after{width:18mm;height:18mm;right:46mm;bottom:40mm;transform:rotate(15deg);background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='44' fill='%23fbf6ea' stroke='%238a6a3f' stroke-width='1.6'/%3E%3Ccircle cx='50' cy='50' r='39' fill='none' stroke='%238a6a3f' stroke-width='.5'/%3E%3Cpath d='M89.0 50.0L83.0 50.0' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M88.8 54.1L86.3 53.8' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M88.1 58.1L85.7 57.6' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M87.1 62.1L84.7 61.3' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M85.6 65.9L83.3 64.8' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M83.8 69.5L78.6 66.5' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M81.6 72.9L79.5 71.5' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M79.0 76.1L77.1 74.4' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M76.1 79.0L74.4 77.1' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M72.9 81.6L71.5 79.5' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M69.5 83.8L66.5 78.6' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M65.9 85.6L64.8 83.3' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M62.1 87.1L61.3 84.7' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M58.1 88.1L57.6 85.7' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M54.1 88.8L53.8 86.3' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M50.0 89.0L50.0 83.0' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M45.9 88.8L46.2 86.3' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M41.9 88.1L42.4 85.7' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M37.9 87.1L38.7 84.7' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M34.1 85.6L35.2 83.3' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M30.5 83.8L33.5 78.6' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M27.1 81.6L28.5 79.5' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M23.9 79.0L25.6 77.1' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M21.0 76.1L22.9 74.4' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M18.4 72.9L20.5 71.5' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M16.2 69.5L21.4 66.5' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M14.4 65.9L16.7 64.8' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M12.9 62.1L15.3 61.3' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M11.9 58.1L14.3 57.6' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M11.2 54.1L13.7 53.8' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M11.0 50.0L17.0 50.0' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M11.2 45.9L13.7 46.2' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M11.9 41.9L14.3 42.4' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M12.9 37.9L15.3 38.7' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M14.4 34.1L16.7 35.2' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M16.2 30.5L21.4 33.5' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M18.4 27.1L20.5 28.5' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M21.0 23.9L22.9 25.6' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M23.9 21.0L25.6 22.9' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M27.1 18.4L28.5 20.5' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M30.5 16.2L33.5 21.4' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M34.1 14.4L35.2 16.7' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M37.9 12.9L38.7 15.3' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M41.9 11.9L42.4 14.3' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M45.9 11.2L46.2 13.7' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M50.0 11.0L50.0 17.0' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M54.1 11.2L53.8 13.7' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M58.1 11.9L57.6 14.3' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M62.1 12.9L61.3 15.3' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M65.9 14.4L64.8 16.7' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M69.5 16.2L66.5 21.4' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M72.9 18.4L71.5 20.5' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M76.1 21.0L74.4 22.9' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M79.0 23.9L77.1 25.6' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M81.6 27.1L79.5 28.5' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M83.8 30.5L78.6 33.5' stroke='%238a6a3f' stroke-width='1.4'/%3E%3Cpath d='M85.6 34.1L83.3 35.2' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M87.1 37.9L84.7 38.7' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M88.1 41.9L85.7 42.4' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M88.8 45.9L86.3 46.2' stroke='%238a6a3f' stroke-width='0.6'/%3E%3Cpath d='M50 50L40.0 32.7' stroke='%235a4026' stroke-width='2.4' stroke-linecap='round'/%3E%3Cpath d='M50 50L76.0 35.0' stroke='%235a4026' stroke-width='1.4' stroke-linecap='round'/%3E%3Ccircle cx='50' cy='50' r='2.2' fill='%23b8343f'/%3E%3C/svg%3E") center/contain no-repeat;opacity:.45}
.lp-card.cubes{border-top:2mm solid #7fb4c8}
.lp-card.cubes .motif{background:linear-gradient(180deg,transparent 55%,#e3f1f6 100%)}
.lp-card.cubes .motif:before{width:50mm;height:55mm;right:-4mm;bottom:6mm;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 110'%3E%3Cg opacity='0.9' stroke='%237fb4c8' stroke-width='.6'%3E%3Cpath d='M62 52L80 61.0L62 70.0L44 61.0Z' fill='%23eaf6fb'/%3E%3Cpath d='M44 61.0L62 70.0L62 90.7L44 81.7Z' fill='%23bfe0ec'/%3E%3Cpath d='M80 61.0L62 70.0L62 90.7L80 81.7Z' fill='%239ccbdc'/%3E%3C/g%3E%3Cg opacity='0.85' stroke='%237fb4c8' stroke-width='.6'%3E%3Cpath d='M30 64L46 72.0L30 80.0L14 72.0Z' fill='%23eaf6fb'/%3E%3Cpath d='M14 72.0L30 80.0L30 98.4L14 90.4Z' fill='%23bfe0ec'/%3E%3Cpath d='M46 72.0L30 80.0L30 98.4L46 90.4Z' fill='%239ccbdc'/%3E%3C/g%3E%3Cg opacity='0.8' stroke='%237fb4c8' stroke-width='.6'%3E%3Cpath d='M48 22L62 29.0L48 36.0L34 29.0Z' fill='%23eaf6fb'/%3E%3Cpath d='M34 29.0L48 36.0L48 52.099999999999994L34 45.099999999999994Z' fill='%23bfe0ec'/%3E%3Cpath d='M62 29.0L48 36.0L48 52.099999999999994L62 45.099999999999994Z' fill='%239ccbdc'/%3E%3C/g%3E%3Cg opacity='0.6' stroke='%237fb4c8' stroke-width='.6'%3E%3Cpath d='M80 14L89 18.5L80 23.0L71 18.5Z' fill='%23eaf6fb'/%3E%3Cpath d='M71 18.5L80 23.0L80 33.35L71 28.85Z' fill='%23bfe0ec'/%3E%3Cpath d='M89 18.5L80 23.0L80 33.35L89 28.85Z' fill='%239ccbdc'/%3E%3C/g%3E%3C/svg%3E") center/contain no-repeat;opacity:.85}
.lp-card.door{border-top:2mm solid #c9a978}
.lp-card.door .motif{background:linear-gradient(180deg,transparent 55%,#f3e3c0 100%)}
.lp-card.door .motif:before{width:50mm;height:60mm;right:4mm;bottom:0;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120'%3E%3Cpath d='M0 100Q50 92 100 100V120H0Z' fill='%23ead3a6'/%3E%3Cpath d='M30 100V40A20 20 0 0 1 70 40V100Z' fill='%23fff5d6' stroke='%238a6a4f' stroke-width='2.4'/%3E%3Cpath d='M36 100V42A14 14 0 0 1 64 42V100Z' fill='%23f7e2a6'/%3E%3Cpath d='M70 100L96 106L74 108Z' fill='%23c9a978' opacity='.6'/%3E%3Ccircle cx='59' cy='72' r='1.6' fill='%238a6a4f'/%3E%3C/svg%3E") center/contain no-repeat;opacity:.9}
.lp-card.goldfish{border-top:2mm solid #d8453a}
.lp-card.goldfish .motif{background:radial-gradient(ellipse at 100% 100%,#d9eef299,transparent 58%)}
.lp-card.goldfish .motif:before{width:54mm;height:54mm;right:0;bottom:14mm;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cg transform='translate(48 62) scale(1.2 1.2)'%3E%3Cpath d='M0 0C8-8 22-8 28 0C22 8 8 8 0 0Z' fill='%23d8453a'/%3E%3Cpath d='M0 0C-6-10-16-12-20-6C-14-4-10-2-8 0C-10 2-14 4-20 6C-16 12-6 10 0 0Z' fill='%23d8453a' opacity='.7'/%3E%3Cpath d='M12-5C14-10 18-11 20-9' stroke='%23d8453a' stroke-width='1.6' fill='none' opacity='.8'/%3E%3Ccircle cx='22' cy='-1.5' r='1.2' fill='%233a1a10'/%3E%3C/g%3E%3Cg transform='translate(30 30) scale(-0.8 0.8)'%3E%3Cpath d='M0 0C8-8 22-8 28 0C22 8 8 8 0 0Z' fill='%23e8834a'/%3E%3Cpath d='M0 0C-6-10-16-12-20-6C-14-4-10-2-8 0C-10 2-14 4-20 6C-16 12-6 10 0 0Z' fill='%23e8834a' opacity='.7'/%3E%3Cpath d='M12-5C14-10 18-11 20-9' stroke='%23e8834a' stroke-width='1.6' fill='none' opacity='.8'/%3E%3Ccircle cx='22' cy='-1.5' r='1.2' fill='%233a1a10'/%3E%3C/g%3E%3Ccircle cx='82' cy='40' r='2.6' fill='none' stroke='%238fbfd0' stroke-width='.8'/%3E%3Ccircle cx='88' cy='28' r='1.8' fill='none' stroke='%238fbfd0' stroke-width='.8'/%3E%3Ccircle cx='84' cy='17' r='1.2' fill='none' stroke='%238fbfd0' stroke-width='.7'/%3E%3C/svg%3E") center/contain no-repeat;opacity:.85}
.lp-card.fireworks{border-top:2mm solid #d9a441}
.lp-card.fireworks .motif{background:linear-gradient(180deg,transparent 50%,#e7e3f2 100%)}
.lp-card.fireworks .motif:before{width:66mm;height:66mm;right:-8mm;bottom:8mm;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M70.5 42.0L90.0 42.0' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='90.0' cy='42.0' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M70.1 44.7L89.0 49.8' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='89.0' cy='49.8' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M69.1 47.2L86.0 57.0' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='86.0' cy='57.0' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M67.4 49.4L81.2 63.2' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='81.2' cy='63.2' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M65.2 51.1L75.0 68.0' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='75.0' cy='68.0' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M62.7 52.1L67.8 71.0' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='67.8' cy='71.0' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M60.0 52.5L60.0 72.0' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='60.0' cy='72.0' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M57.3 52.1L52.2 71.0' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='52.2' cy='71.0' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M54.8 51.1L45.0 68.0' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='45.0' cy='68.0' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M52.6 49.4L38.8 63.2' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='38.8' cy='63.2' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M50.9 47.2L34.0 57.0' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='34.0' cy='57.0' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M49.9 44.7L31.0 49.8' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='31.0' cy='49.8' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M49.5 42.0L30.0 42.0' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='30.0' cy='42.0' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M49.9 39.3L31.0 34.2' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='31.0' cy='34.2' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M50.9 36.8L34.0 27.0' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='34.0' cy='27.0' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M52.6 34.6L38.8 20.8' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='38.8' cy='20.8' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M54.7 32.9L45.0 16.0' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='45.0' cy='16.0' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M57.3 31.9L52.2 13.0' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='52.2' cy='13.0' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M60.0 31.5L60.0 12.0' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='60.0' cy='12.0' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M62.7 31.9L67.8 13.0' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='67.8' cy='13.0' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M65.2 32.9L75.0 16.0' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='75.0' cy='16.0' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M67.4 34.6L81.2 20.8' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='81.2' cy='20.8' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M69.1 36.7L86.0 27.0' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='86.0' cy='27.0' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M70.1 39.3L89.0 34.2' stroke='%23d9a441' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='89.0' cy='34.2' r='1.2' fill='%23d9a441'/%3E%3Cpath d='M34.3 70.0L46.0 70.0' stroke='%23d8556b' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='46.0' cy='70.0' r='1' fill='%23d8556b'/%3E%3Cpath d='M33.8 72.4L44.6 76.9' stroke='%23d8556b' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='44.6' cy='76.9' r='1' fill='%23d8556b'/%3E%3Cpath d='M32.5 74.5L40.7 82.7' stroke='%23d8556b' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='40.7' cy='82.7' r='1' fill='%23d8556b'/%3E%3Cpath d='M30.4 75.8L34.9 86.6' stroke='%23d8556b' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='34.9' cy='86.6' r='1' fill='%23d8556b'/%3E%3Cpath d='M28.0 76.3L28.0 88.0' stroke='%23d8556b' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='28.0' cy='88.0' r='1' fill='%23d8556b'/%3E%3Cpath d='M25.6 75.8L21.1 86.6' stroke='%23d8556b' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='21.1' cy='86.6' r='1' fill='%23d8556b'/%3E%3Cpath d='M23.5 74.5L15.3 82.7' stroke='%23d8556b' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='15.3' cy='82.7' r='1' fill='%23d8556b'/%3E%3Cpath d='M22.2 72.4L11.4 76.9' stroke='%23d8556b' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='11.4' cy='76.9' r='1' fill='%23d8556b'/%3E%3Cpath d='M21.7 70.0L10.0 70.0' stroke='%23d8556b' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='10.0' cy='70.0' r='1' fill='%23d8556b'/%3E%3Cpath d='M22.2 67.6L11.4 63.1' stroke='%23d8556b' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='11.4' cy='63.1' r='1' fill='%23d8556b'/%3E%3Cpath d='M23.5 65.5L15.3 57.3' stroke='%23d8556b' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='15.3' cy='57.3' r='1' fill='%23d8556b'/%3E%3Cpath d='M25.6 64.2L21.1 53.4' stroke='%23d8556b' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='21.1' cy='53.4' r='1' fill='%23d8556b'/%3E%3Cpath d='M28.0 63.7L28.0 52.0' stroke='%23d8556b' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='28.0' cy='52.0' r='1' fill='%23d8556b'/%3E%3Cpath d='M30.4 64.2L34.9 53.4' stroke='%23d8556b' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='34.9' cy='53.4' r='1' fill='%23d8556b'/%3E%3Cpath d='M32.5 65.5L40.7 57.3' stroke='%23d8556b' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='40.7' cy='57.3' r='1' fill='%23d8556b'/%3E%3Cpath d='M33.8 67.6L44.6 63.1' stroke='%23d8556b' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='44.6' cy='63.1' r='1' fill='%23d8556b'/%3E%3Cpath d='M86.2 80.0L94.0 80.0' stroke='%236f8fd0' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='94.0' cy='80.0' r='0.9' fill='%236f8fd0'/%3E%3Cpath d='M85.6 82.1L92.4 86.0' stroke='%236f8fd0' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='92.4' cy='86.0' r='0.9' fill='%236f8fd0'/%3E%3Cpath d='M84.1 83.6L88.0 90.4' stroke='%236f8fd0' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='88.0' cy='90.4' r='0.9' fill='%236f8fd0'/%3E%3Cpath d='M82.0 84.2L82.0 92.0' stroke='%236f8fd0' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='82.0' cy='92.0' r='0.9' fill='%236f8fd0'/%3E%3Cpath d='M79.9 83.6L76.0 90.4' stroke='%236f8fd0' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='76.0' cy='90.4' r='0.9' fill='%236f8fd0'/%3E%3Cpath d='M78.4 82.1L71.6 86.0' stroke='%236f8fd0' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='71.6' cy='86.0' r='0.9' fill='%236f8fd0'/%3E%3Cpath d='M77.8 80.0L70.0 80.0' stroke='%236f8fd0' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='70.0' cy='80.0' r='0.9' fill='%236f8fd0'/%3E%3Cpath d='M78.4 77.9L71.6 74.0' stroke='%236f8fd0' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='71.6' cy='74.0' r='0.9' fill='%236f8fd0'/%3E%3Cpath d='M79.9 76.4L76.0 69.6' stroke='%236f8fd0' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='76.0' cy='69.6' r='0.9' fill='%236f8fd0'/%3E%3Cpath d='M82.0 75.8L82.0 68.0' stroke='%236f8fd0' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='82.0' cy='68.0' r='0.9' fill='%236f8fd0'/%3E%3Cpath d='M84.1 76.4L88.0 69.6' stroke='%236f8fd0' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='88.0' cy='69.6' r='0.9' fill='%236f8fd0'/%3E%3Cpath d='M85.6 77.9L92.4 74.0' stroke='%236f8fd0' stroke-width='1' stroke-linecap='round'/%3E%3Ccircle cx='92.4' cy='74.0' r='0.9' fill='%236f8fd0'/%3E%3C/svg%3E") center/contain no-repeat;opacity:.8}
.lp-card.envelope{border-top:2mm solid #a07f3c}
.lp-card.envelope .motif:before{width:46mm;height:32mm;right:8mm;bottom:18mm;transform:rotate(-8deg);background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 70'%3E%3Crect x='4' y='6' width='92' height='60' rx='2' fill='%23fbf3df' stroke='%23a07f3c' stroke-width='1.4'/%3E%3Cpath d='M4 8L50 40L96 8' fill='none' stroke='%23a07f3c' stroke-width='1.4'/%3E%3Cpath d='M4 64L38 32M96 64L62 32' stroke='%23a07f3c' stroke-width='.8' opacity='.6'/%3E%3Ccircle cx='50' cy='40' r='8' fill='%23b8343f'/%3E%3Ccircle cx='50' cy='40' r='5' fill='none' stroke='%23e88a8f' stroke-width='.8'/%3E%3C/svg%3E") center/contain no-repeat;opacity:.85}
.lp-card.envelope .motif:after{width:34mm;height:24mm;right:24mm;bottom:38mm;transform:rotate(10deg);background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 70'%3E%3Crect x='4' y='6' width='92' height='60' rx='2' fill='%23fbf3df' stroke='%23a07f3c' stroke-width='1.4'/%3E%3Cpath d='M4 8L50 40L96 8' fill='none' stroke='%23a07f3c' stroke-width='1.4'/%3E%3Cpath d='M4 64L38 32M96 64L62 32' stroke='%23a07f3c' stroke-width='.8' opacity='.6'/%3E%3Ccircle cx='50' cy='40' r='8' fill='%23b8343f'/%3E%3Ccircle cx='50' cy='40' r='5' fill='none' stroke='%23e88a8f' stroke-width='.8'/%3E%3C/svg%3E") center/contain no-repeat;opacity:.45}
.lp-card.glitch{border-top:2mm solid #5b6bd6}
.lp-card.glitch .motif{background:linear-gradient(90deg,#ff4f7b66,#ff4f7b66) 36mm 84mm/50mm 2.4mm no-repeat,linear-gradient(90deg,#39c6e566,#39c6e566) 48mm 89mm/46mm 1.4mm no-repeat,linear-gradient(90deg,#f5d04a77,#f5d04a77) 24mm 100mm/40mm 1.8mm no-repeat,linear-gradient(90deg,#ff4f7b55,#ff4f7b55) 56mm 108mm/40mm 3mm no-repeat,linear-gradient(90deg,#39c6e555,#39c6e555) 30mm 116mm/58mm 1.2mm no-repeat,linear-gradient(90deg,#5b6bd655,#5b6bd655) 62mm 124mm/34mm 2mm no-repeat,repeating-linear-gradient(0deg,transparent 0 3mm,#5b6bd60d 3mm 3.4mm)}
.lp-card.glitch .motif:before{width:34mm;height:9mm;right:6mm;bottom:40mm;background:linear-gradient(90deg,#ff4f7b55 0 30%,#39c6e555 30% 68%,#f5d04a66 68%)}
.lp-card.glitch .motif:after{width:22mm;height:5mm;right:20mm;bottom:52mm;background:linear-gradient(90deg,#39c6e544,#5b6bd655)}
.lp-card.hydrangea{border-top:2mm solid #8fa3e0}
.lp-card.hydrangea .motif{background:radial-gradient(ellipse at 100% 100%,#e3e6f7aa,transparent 58%)}
.lp-card.hydrangea .motif:before{width:50mm;height:50mm;right:2mm;bottom:10mm;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M30 78C40 70 46 74 50 90M70 78C60 72 54 76 50 90' fill='%239cbf8a' opacity='.8'/%3E%3Cpath d='M50 70V98' stroke='%237f9f6c' stroke-width='1.4'/%3E%3Cg transform='translate(44.8 56.4) rotate(73.9)' fill='%238fa3e0' opacity='.9'%3E%3Cellipse cx='0' cy='-4.2' rx='2.6' ry='4.2'/%3E%3Cellipse cx='0' cy='4.2' rx='2.6' ry='4.2'/%3E%3Cellipse cx='-4.2' cy='0' rx='4.2' ry='2.6'/%3E%3Cellipse cx='4.2' cy='0' rx='4.2' ry='2.6'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(69.0 58.8) rotate(3.4)' fill='%23a68fd8' opacity='.9'%3E%3Cellipse cx='0' cy='-4.5' rx='2.8' ry='4.5'/%3E%3Cellipse cx='0' cy='4.5' rx='2.8' ry='4.5'/%3E%3Cellipse cx='-4.5' cy='0' rx='4.5' ry='2.8'/%3E%3Cellipse cx='4.5' cy='0' rx='4.5' ry='2.8'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(42.8 49.2) rotate(5.3)' fill='%23b9a3e6' opacity='.9'%3E%3Cellipse cx='0' cy='-3.5' rx='2.2' ry='3.5'/%3E%3Cellipse cx='0' cy='3.5' rx='2.2' ry='3.5'/%3E%3Cellipse cx='-3.5' cy='0' rx='3.5' ry='2.2'/%3E%3Cellipse cx='3.5' cy='0' rx='3.5' ry='2.2'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(23.2 34.3) rotate(85.3)' fill='%239db8ea' opacity='.9'%3E%3Cellipse cx='0' cy='-4.2' rx='2.6' ry='4.2'/%3E%3Cellipse cx='0' cy='4.2' rx='2.6' ry='4.2'/%3E%3Cellipse cx='-4.2' cy='0' rx='4.2' ry='2.6'/%3E%3Cellipse cx='4.2' cy='0' rx='4.2' ry='2.6'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(33.3 37.2) rotate(50.1)' fill='%238fa3e0' opacity='.9'%3E%3Cellipse cx='0' cy='-4.6' rx='2.8' ry='4.6'/%3E%3Cellipse cx='0' cy='4.6' rx='2.8' ry='4.6'/%3E%3Cellipse cx='-4.6' cy='0' rx='4.6' ry='2.8'/%3E%3Cellipse cx='4.6' cy='0' rx='4.6' ry='2.8'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(63.0 60.4) rotate(27.8)' fill='%239db8ea' opacity='.9'%3E%3Cellipse cx='0' cy='-4.0' rx='2.5' ry='4.0'/%3E%3Cellipse cx='0' cy='4.0' rx='2.5' ry='4.0'/%3E%3Cellipse cx='-4.0' cy='0' rx='4.0' ry='2.5'/%3E%3Cellipse cx='4.0' cy='0' rx='4.0' ry='2.5'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(55.1 34.3) rotate(33.5)' fill='%23a68fd8' opacity='.9'%3E%3Cellipse cx='0' cy='-4.1' rx='2.5' ry='4.1'/%3E%3Cellipse cx='0' cy='4.1' rx='2.5' ry='4.1'/%3E%3Cellipse cx='-4.1' cy='0' rx='4.1' ry='2.5'/%3E%3Cellipse cx='4.1' cy='0' rx='4.1' ry='2.5'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(42.8 43.8) rotate(44.7)' fill='%23a68fd8' opacity='.9'%3E%3Cellipse cx='0' cy='-3.5' rx='2.2' ry='3.5'/%3E%3Cellipse cx='0' cy='3.5' rx='2.2' ry='3.5'/%3E%3Cellipse cx='-3.5' cy='0' rx='3.5' ry='2.2'/%3E%3Cellipse cx='3.5' cy='0' rx='3.5' ry='2.2'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(24.1 40.8) rotate(32.5)' fill='%23b9a3e6' opacity='.9'%3E%3Cellipse cx='0' cy='-4.0' rx='2.5' ry='4.0'/%3E%3Cellipse cx='0' cy='4.0' rx='2.5' ry='4.0'/%3E%3Cellipse cx='-4.0' cy='0' rx='4.0' ry='2.5'/%3E%3Cellipse cx='4.0' cy='0' rx='4.0' ry='2.5'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(50.1 58.7) rotate(51.7)' fill='%238fa3e0' opacity='.9'%3E%3Cellipse cx='0' cy='-4.3' rx='2.7' ry='4.3'/%3E%3Cellipse cx='0' cy='4.3' rx='2.7' ry='4.3'/%3E%3Cellipse cx='-4.3' cy='0' rx='4.3' ry='2.7'/%3E%3Cellipse cx='4.3' cy='0' rx='4.3' ry='2.7'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(22.3 41.6) rotate(54.8)' fill='%237fb1dd' opacity='.9'%3E%3Cellipse cx='0' cy='-4.3' rx='2.7' ry='4.3'/%3E%3Cellipse cx='0' cy='4.3' rx='2.7' ry='4.3'/%3E%3Cellipse cx='-4.3' cy='0' rx='4.3' ry='2.7'/%3E%3Cellipse cx='4.3' cy='0' rx='4.3' ry='2.7'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(69.2 55.5) rotate(13.7)' fill='%237fb1dd' opacity='.9'%3E%3Cellipse cx='0' cy='-3.6' rx='2.2' ry='3.6'/%3E%3Cellipse cx='0' cy='3.6' rx='2.2' ry='3.6'/%3E%3Cellipse cx='-3.6' cy='0' rx='3.6' ry='2.2'/%3E%3Cellipse cx='3.6' cy='0' rx='3.6' ry='2.2'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(44.1 46.4) rotate(51.6)' fill='%239db8ea' opacity='.9'%3E%3Cellipse cx='0' cy='-4.2' rx='2.6' ry='4.2'/%3E%3Cellipse cx='0' cy='4.2' rx='2.6' ry='4.2'/%3E%3Cellipse cx='-4.2' cy='0' rx='4.2' ry='2.6'/%3E%3Cellipse cx='4.2' cy='0' rx='4.2' ry='2.6'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(61.9 34.2) rotate(44.7)' fill='%239db8ea' opacity='.9'%3E%3Cellipse cx='0' cy='-4.2' rx='2.6' ry='4.2'/%3E%3Cellipse cx='0' cy='4.2' rx='2.6' ry='4.2'/%3E%3Cellipse cx='-4.2' cy='0' rx='4.2' ry='2.6'/%3E%3Cellipse cx='4.2' cy='0' rx='4.2' ry='2.6'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(52.3 38.5) rotate(42.7)' fill='%237fb1dd' opacity='.9'%3E%3Cellipse cx='0' cy='-3.5' rx='2.2' ry='3.5'/%3E%3Cellipse cx='0' cy='3.5' rx='2.2' ry='3.5'/%3E%3Cellipse cx='-3.5' cy='0' rx='3.5' ry='2.2'/%3E%3Cellipse cx='3.5' cy='0' rx='3.5' ry='2.2'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(46.2 39.7) rotate(89.4)' fill='%239db8ea' opacity='.9'%3E%3Cellipse cx='0' cy='-4.2' rx='2.6' ry='4.2'/%3E%3Cellipse cx='0' cy='4.2' rx='2.6' ry='4.2'/%3E%3Cellipse cx='-4.2' cy='0' rx='4.2' ry='2.6'/%3E%3Cellipse cx='4.2' cy='0' rx='4.2' ry='2.6'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(57.0 31.6) rotate(2.0)' fill='%237fb1dd' opacity='.9'%3E%3Cellipse cx='0' cy='-3.9' rx='2.4' ry='3.9'/%3E%3Cellipse cx='0' cy='3.9' rx='2.4' ry='3.9'/%3E%3Cellipse cx='-3.9' cy='0' rx='3.9' ry='2.4'/%3E%3Cellipse cx='3.9' cy='0' rx='3.9' ry='2.4'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(38.1 48.9) rotate(19.6)' fill='%238fa3e0' opacity='.9'%3E%3Cellipse cx='0' cy='-3.5' rx='2.2' ry='3.5'/%3E%3Cellipse cx='0' cy='3.5' rx='2.2' ry='3.5'/%3E%3Cellipse cx='-3.5' cy='0' rx='3.5' ry='2.2'/%3E%3Cellipse cx='3.5' cy='0' rx='3.5' ry='2.2'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(44.0 71.1) rotate(7.3)' fill='%23b9a3e6' opacity='.9'%3E%3Cellipse cx='0' cy='-3.9' rx='2.4' ry='3.9'/%3E%3Cellipse cx='0' cy='3.9' rx='2.4' ry='3.9'/%3E%3Cellipse cx='-3.9' cy='0' rx='3.9' ry='2.4'/%3E%3Cellipse cx='3.9' cy='0' rx='3.9' ry='2.4'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(28.9 53.0) rotate(77.8)' fill='%23b9a3e6' opacity='.9'%3E%3Cellipse cx='0' cy='-4.5' rx='2.8' ry='4.5'/%3E%3Cellipse cx='0' cy='4.5' rx='2.8' ry='4.5'/%3E%3Cellipse cx='-4.5' cy='0' rx='4.5' ry='2.8'/%3E%3Cellipse cx='4.5' cy='0' rx='4.5' ry='2.8'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(46.6 65.0) rotate(86.2)' fill='%23b9a3e6' opacity='.9'%3E%3Cellipse cx='0' cy='-3.8' rx='2.4' ry='3.8'/%3E%3Cellipse cx='0' cy='3.8' rx='2.4' ry='3.8'/%3E%3Cellipse cx='-3.8' cy='0' rx='3.8' ry='2.4'/%3E%3Cellipse cx='3.8' cy='0' rx='3.8' ry='2.4'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(57.3 56.2) rotate(1.1)' fill='%23a68fd8' opacity='.9'%3E%3Cellipse cx='0' cy='-3.7' rx='2.3' ry='3.7'/%3E%3Cellipse cx='0' cy='3.7' rx='2.3' ry='3.7'/%3E%3Cellipse cx='-3.7' cy='0' rx='3.7' ry='2.3'/%3E%3Cellipse cx='3.7' cy='0' rx='3.7' ry='2.3'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(56.2 34.8) rotate(37.7)' fill='%23a68fd8' opacity='.9'%3E%3Cellipse cx='0' cy='-3.7' rx='2.3' ry='3.7'/%3E%3Cellipse cx='0' cy='3.7' rx='2.3' ry='3.7'/%3E%3Cellipse cx='-3.7' cy='0' rx='3.7' ry='2.3'/%3E%3Cellipse cx='3.7' cy='0' rx='3.7' ry='2.3'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(34.6 62.5) rotate(85.5)' fill='%239db8ea' opacity='.9'%3E%3Cellipse cx='0' cy='-4.5' rx='2.8' ry='4.5'/%3E%3Cellipse cx='0' cy='4.5' rx='2.8' ry='4.5'/%3E%3Cellipse cx='-4.5' cy='0' rx='4.5' ry='2.8'/%3E%3Cellipse cx='4.5' cy='0' rx='4.5' ry='2.8'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(35.5 24.7) rotate(35.3)' fill='%239db8ea' opacity='.9'%3E%3Cellipse cx='0' cy='-3.9' rx='2.4' ry='3.9'/%3E%3Cellipse cx='0' cy='3.9' rx='2.4' ry='3.9'/%3E%3Cellipse cx='-3.9' cy='0' rx='3.9' ry='2.4'/%3E%3Cellipse cx='3.9' cy='0' rx='3.9' ry='2.4'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3Cg transform='translate(42.2 51.7) rotate(17.2)' fill='%238fa3e0' opacity='.9'%3E%3Cellipse cx='0' cy='-4.2' rx='2.6' ry='4.2'/%3E%3Cellipse cx='0' cy='4.2' rx='2.6' ry='4.2'/%3E%3Cellipse cx='-4.2' cy='0' rx='4.2' ry='2.6'/%3E%3Cellipse cx='4.2' cy='0' rx='4.2' ry='2.6'/%3E%3Ccircle r='1' fill='%23f6f0ff'/%3E%3C/g%3E%3C/svg%3E") center/contain no-repeat;opacity:.85}
.lp-card.tunnel{border-top:2mm solid #2d3550}
.lp-card.tunnel .motif:before{width:44mm;height:44mm;right:8mm;bottom:18mm;border-radius:3mm;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='0' y='0' width='100' height='100' fill='%232d3550'/%3E%3Crect x='0.0' y='0.0' width='100.0' height='100.0' rx='4.0' fill='none' stroke='%239fb2e0' stroke-width='2.0' opacity='0.25'/%3E%3Ccircle cx='0.0' cy='0.0' r='2.3' fill='%23ffe6a0'/%3E%3Ccircle cx='100.0' cy='0.0' r='2.3' fill='%23ffe6a0'/%3E%3Crect x='7.2' y='5.8' width='87.5' height='87.5' rx='3.6' fill='none' stroke='%239fb2e0' stroke-width='1.8' opacity='0.33'/%3E%3Ccircle cx='7.2' cy='5.8' r='2.1' fill='%23ffe6a0'/%3E%3Ccircle cx='94.8' cy='5.8' r='2.1' fill='%23ffe6a0'/%3E%3Crect x='14.5' y='11.5' width='75.0' height='75.0' rx='3.2' fill='none' stroke='%239fb2e0' stroke-width='1.6' opacity='0.40'/%3E%3Ccircle cx='14.5' cy='11.5' r='1.9' fill='%23ffe6a0'/%3E%3Ccircle cx='89.5' cy='11.5' r='1.9' fill='%23ffe6a0'/%3E%3Crect x='21.8' y='17.2' width='62.5' height='62.5' rx='2.9' fill='none' stroke='%239fb2e0' stroke-width='1.4' opacity='0.47'/%3E%3Ccircle cx='21.8' cy='17.2' r='1.6' fill='%23ffe6a0'/%3E%3Ccircle cx='84.2' cy='17.2' r='1.6' fill='%23ffe6a0'/%3E%3Crect x='29.0' y='23.0' width='50.0' height='50.0' rx='2.5' fill='none' stroke='%239fb2e0' stroke-width='1.2' opacity='0.55'/%3E%3Ccircle cx='29.0' cy='23.0' r='1.4' fill='%23ffe6a0'/%3E%3Ccircle cx='79.0' cy='23.0' r='1.4' fill='%23ffe6a0'/%3E%3Crect x='36.2' y='28.8' width='37.5' height='37.5' rx='2.1' fill='none' stroke='%239fb2e0' stroke-width='1.0' opacity='0.62'/%3E%3Ccircle cx='36.2' cy='28.8' r='1.2' fill='%23ffe6a0'/%3E%3Ccircle cx='73.8' cy='28.8' r='1.2' fill='%23ffe6a0'/%3E%3Crect x='43.5' y='34.5' width='25.0' height='25.0' rx='1.8' fill='none' stroke='%239fb2e0' stroke-width='0.8' opacity='0.70'/%3E%3Ccircle cx='43.5' cy='34.5' r='0.9' fill='%23ffe6a0'/%3E%3Ccircle cx='68.5' cy='34.5' r='0.9' fill='%23ffe6a0'/%3E%3Crect x='50.8' y='40.2' width='12.5' height='12.5' rx='1.4' fill='none' stroke='%239fb2e0' stroke-width='0.6' opacity='0.78'/%3E%3Ccircle cx='50.8' cy='40.2' r='0.7' fill='%23ffe6a0'/%3E%3Ccircle cx='63.2' cy='40.2' r='0.7' fill='%23ffe6a0'/%3E%3Ccircle cx='58' cy='46' r='5' fill='%23fffbe8'/%3E%3Ccircle cx='58' cy='46' r='10' fill='%23fff3c4' opacity='.35'/%3E%3C/svg%3E") center/cover no-repeat;opacity:.68}
.lp-card.cage{border-top:2mm solid #5c636b}
.lp-card.cage .motif:before{width:64mm;height:74mm;right:-6mm;bottom:-6mm;background:repeating-linear-gradient(45deg,transparent 0 4mm,#7d8792aa 4mm 4.3mm),repeating-linear-gradient(-45deg,transparent 0 4mm,#7d8792aa 4mm 4.3mm);-webkit-mask-image:radial-gradient(circle at 100% 100%,#000 30%,transparent 72%);mask-image:radial-gradient(circle at 100% 100%,#000 30%,transparent 72%);opacity:.6}
.lp-card.cage .motif:after{width:40mm;height:64mm;right:8mm;bottom:0;border-top:1.2mm solid #5c636b;background:repeating-linear-gradient(90deg,#5c636b 0 .9mm,transparent .9mm 7mm);-webkit-mask-image:linear-gradient(#000 60%,transparent);mask-image:linear-gradient(#000 60%,transparent);opacity:.45}
.lp-card.balloon{border-top:2mm solid #d8343f}
.lp-card.balloon .motif:before{width:40mm;height:48mm;right:6mm;bottom:12mm;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120'%3E%3Cpath d='M60 66C66 80 52 90 60 116' stroke='%238a5a5a' stroke-width='.8' fill='none'/%3E%3Cellipse cx='60' cy='38' rx='22' ry='28' fill='%23d8343f'/%3E%3Cpath d='M57 66L63 66L60 70Z' fill='%23d8343f'/%3E%3Cellipse cx='52' cy='26' rx='5' ry='8' fill='%23fff' opacity='.35' transform='rotate(-20 52 26)'/%3E%3Cpath d='M26 70C30 84 22 96 28 116' stroke='%23555' stroke-width='.7' fill='none'/%3E%3Cellipse cx='26' cy='54' rx='11' ry='14' fill='%232b2b33' opacity='.85'/%3E%3Cpath d='M24 68L28 68L26 71Z' fill='%232b2b33'/%3E%3C/svg%3E") center/contain no-repeat;opacity:.85}
.lp-card.curtain{border-top:2mm solid #b8343f}
.lp-card.curtain .motif:before{left:0;right:0;top:0;height:80mm;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 80' preserveAspectRatio='none'%3E%3Cpath d='M0 0H100V5Q93 10 86 5Q79 10 72 5Q65 10 58 5Q51 10 44 5Q37 10 30 5Q23 10 16 5Q9 10 0 5Z' fill='%23b8343f' opacity='.9'/%3E%3Cpath d='M0 4H100' stroke='%23d9b45a' stroke-width='.9'/%3E%3Cpath d='M100 6V70C96 66 92 64 88 66C91 46 90 24 92 6Z' fill='%23b8343f' opacity='.85'/%3E%3Cpath d='M95 8C94 30 95 50 94 66' stroke='%238d2232' stroke-width='.5' fill='none'/%3E%3Cpath d='M0 6V50C2 46 4 46 5 46C4 32 5 18 4 6Z' fill='%23b8343f' opacity='.7'/%3E%3Cpath d='M88 66Q90 70 92 74' stroke='%23d9b45a' stroke-width='.9' fill='none'/%3E%3C/svg%3E") 0 0/100% 100% no-repeat;opacity:.85}
.lp-card.curtain .motif:after{width:58mm;height:58mm;right:-10mm;bottom:-16mm;border:.6mm solid #d9b45a;border-radius:50% 50% 0 0;box-shadow:0 0 0 2.4mm #faf6ea,0 0 0 2.7mm #d9b45a88;opacity:.7}
.lp-card.rose{border-top:2mm solid #b8343f}
.lp-card.rose .motif{background:radial-gradient(ellipse at 100% 100%,#f3d6d899,transparent 55%)}
.lp-card.rose .motif:before{width:40mm;height:40mm;right:8mm;bottom:16mm;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 56C48 72 52 84 48 100' stroke='%234f7a4a' stroke-width='1.6' fill='none'/%3E%3Cpath d='M49 74C40 66 32 70 30 76C38 80 44 78 49 74Z' fill='%236f9a5f'/%3E%3Cpath d='M50 86C58 80 66 82 68 88C60 92 54 90 50 86Z' fill='%236f9a5f'/%3E%3Cpath d='M30 40C30 18.0 70 18.0 70 40C70 58.0 30 58.0 30 40Z' fill='%23b8343f' opacity='0.95' transform='rotate(0 50 40)'/%3E%3Cpath d='M35 40C35 23.5 65 23.5 65 40C65 53.5 35 53.5 35 40Z' fill='%23c9434e' opacity='0.95' transform='rotate(37 50 40)'/%3E%3Cpath d='M40 40C40 29.0 60 29.0 60 40C60 49.0 40 49.0 40 40Z' fill='%23a82838' opacity='0.95' transform='rotate(74 50 40)'/%3E%3Cpath d='M44 40C44 33.4 56 33.4 56 40C56 45.4 44 45.4 44 40Z' fill='%238d1f2e' opacity='1' transform='rotate(111 50 40)'/%3E%3Cpath d='M46 38C48 34 54 34 54 40C54 44 48 44 48 40' stroke='%23f2a0a8' stroke-width='.8' fill='none'/%3E%3C/svg%3E") center/contain no-repeat;opacity:.85}
.lp-card.spider{border-top:2mm solid #c42b3a}
.lp-card.spider .motif{background:linear-gradient(#c42b3a,#c42b3a) right 40mm top 0/.3mm 29mm no-repeat}
.lp-card.spider .motif:before{width:58mm;height:58mm;right:0;bottom:0;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M100 100L0.0 100.0' stroke='%239a8f8a' stroke-width='.5'/%3E%3Cpath d='M100 100L3.4 74.1' stroke='%239a8f8a' stroke-width='.5'/%3E%3Cpath d='M100 100L13.4 50.0' stroke='%239a8f8a' stroke-width='.5'/%3E%3Cpath d='M100 100L29.3 29.3' stroke='%239a8f8a' stroke-width='.5'/%3E%3Cpath d='M100 100L50.0 13.4' stroke='%239a8f8a' stroke-width='.5'/%3E%3Cpath d='M100 100L74.1 3.4' stroke='%239a8f8a' stroke-width='.5'/%3E%3Cpath d='M100 100L100.0 0.0' stroke='%239a8f8a' stroke-width='.5'/%3E%3Cpath d='M80.0 100.0 L80.7 94.8 L82.7 90.0 L85.9 85.9 L90.0 82.7 L94.8 80.7 L100.0 80.0' fill='none' stroke='%239a8f8a' stroke-width='.45'/%3E%3Cpath d='M64.0 100.0 L65.2 90.7 L68.8 82.0 L74.5 74.5 L82.0 68.8 L90.7 65.2 L100.0 64.0' fill='none' stroke='%239a8f8a' stroke-width='.45'/%3E%3Cpath d='M48.0 100.0 L49.8 86.5 L55.0 74.0 L63.2 63.2 L74.0 55.0 L86.5 49.8 L100.0 48.0' fill='none' stroke='%239a8f8a' stroke-width='.45'/%3E%3Cpath d='M32.0 100.0 L34.3 82.4 L41.1 66.0 L51.9 51.9 L66.0 41.1 L82.4 34.3 L100.0 32.0' fill='none' stroke='%239a8f8a' stroke-width='.45'/%3E%3Cpath d='M16.0 100.0 L18.9 78.3 L27.3 58.0 L40.6 40.6 L58.0 27.3 L78.3 18.9 L100.0 16.0' fill='none' stroke='%239a8f8a' stroke-width='.45'/%3E%3C/svg%3E") center/contain no-repeat;opacity:.7}
.lp-card.spider .motif:after{width:12mm;height:18mm;right:34mm;top:28mm;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 60'%3E%3Cpath d='M20 0V30' stroke='%23c42b3a' stroke-width='.8'/%3E%3Cellipse cx='20' cy='36' rx='5' ry='6' fill='%232b2b33'/%3E%3Ccircle cx='20' cy='29' r='3' fill='%232b2b33'/%3E%3Cpath d='M15 33L6 26M15 36L4 36M15 39L6 46M25 33L34 26M25 36L36 36M25 39L34 46' stroke='%232b2b33' stroke-width='1.1' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") center/contain no-repeat;opacity:.85}
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
.lp-card .msg .r{text-align:right}
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
.lp .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.lp-totop{position:fixed;z-index:20;right:max(16px,env(safe-area-inset-right));bottom:max(18px,env(safe-area-inset-bottom));width:54px;height:54px;border-radius:50%;border:1px solid var(--line);background:var(--paper);color:var(--accent);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;cursor:pointer;box-shadow:0 8px 22px #293b3b2e;opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .25s ease,transform .25s ease}
.lp-totop.is-shown{opacity:1;transform:none;pointer-events:auto}
.lp-totop span{font:400 20px/1 Georgia,serif}
.lp-totop small{font:600 8px/1 Arial,sans-serif;letter-spacing:.14em;color:var(--muted)}
@media(prefers-reduced-motion:reduce){.lp-totop{transition:none}}
.lp-admin-toggle{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--accent);border:1px dashed var(--accent);padding:6px 12px}
.lp-chrono{--night:#141a2e;--gold:#e2bf6a;--cream:#f6eedc;position:relative;color:var(--cream);background:radial-gradient(ellipse 80% 40% at 15% 0%,#3a2f5a88,transparent 70%),radial-gradient(ellipse 70% 35% at 100% 30%,#5a2a3f66,transparent 70%),radial-gradient(ellipse 90% 40% at 30% 100%,#1f4a5466,transparent 70%),linear-gradient(180deg,#1b2140,#10142a 60%,#0d1022);padding:34px 40px 60px;margin-top:8px;overflow:clip;border-top:1px solid #e2bf6a55;border-bottom:1px solid #e2bf6a55;box-shadow:0 30px 60px -30px #10142a99}
.lp-chrono:before{content:'';position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(1px 1px at 12% 8%,#fff9,transparent),radial-gradient(1px 1px at 72% 4%,#fff8,transparent),radial-gradient(1.5px 1.5px at 88% 18%,#ffe9b5aa,transparent),radial-gradient(1px 1px at 40% 14%,#fff7,transparent),radial-gradient(1px 1px at 22% 36%,#fff6,transparent),radial-gradient(1.5px 1.5px at 64% 42%,#ffe9b599,transparent),radial-gradient(1px 1px at 92% 58%,#fff7,transparent),radial-gradient(1px 1px at 8% 70%,#fff6,transparent),radial-gradient(1px 1px at 52% 78%,#fff5,transparent),radial-gradient(1.5px 1.5px at 80% 90%,#ffe9b588,transparent);background-size:100% 900px}
.lp-chrono-nav{position:sticky;top:0;z-index:3;display:flex;flex-wrap:wrap;gap:8px;margin:0 -40px 30px;padding:12px 40px;background:linear-gradient(#141a2ef2,#141a2ed9);backdrop-filter:blur(6px);border-bottom:1px solid #ffffff14}
.lp-chrono-nav a{display:inline-flex;align-items:center;gap:8px;text-decoration:none;font-size:12px;letter-spacing:.06em;color:#f6eedcaa;border:1px solid #f6eedc33;padding:6px 12px;min-height:36px}
.lp-chrono-nav a.has{color:var(--era);border-color:var(--era)}
.lp-chrono-nav a b{font:600 11px/1 Arial,sans-serif;background:var(--era);color:#141a2e;padding:3px 6px;border-radius:9px}
.lp-chrono-era{position:relative;padding:8px 0 40px 0}
.lp-chrono-era+.lp-chrono-era{border-top:1px solid #ffffff12;padding-top:36px}
.lp-chrono-era-head{display:flex;align-items:baseline;flex-wrap:wrap;gap:6px 18px;margin-bottom:22px}
.lp-chrono-era-head .num{font:italic 400 15px/1 Georgia,serif;color:var(--era)}
.lp-chrono-era-head h3{font:500 clamp(26px,4vw,40px)/1.3 var(--serif);letter-spacing:.06em;color:var(--cream);margin:0}
.lp-chrono-era.has .lp-chrono-era-head h3{background:linear-gradient(100deg,var(--cream) 20%,var(--era) 60%,var(--gold));-webkit-background-clip:text;background-clip:text;color:transparent}
.lp-chrono-era-head .count{font-size:12px;letter-spacing:.08em;color:#f6eedc88}
.lp-chrono-era.has .lp-chrono-era-head .count{color:var(--era)}
.lp-chrono-years{list-style:none;margin:0;padding:0;position:relative}
.lp-chrono-years:before{content:'';position:absolute;left:58px;top:6px;bottom:6px;width:1px;background:linear-gradient(var(--era),#ffffff1f 30%,#ffffff1f 70%,transparent)}
.lp-chrono-years>li{display:grid;grid-template-columns:58px 1fr;gap:0 26px;padding:10px 0;position:relative}
.lp-chrono-years>li:before{content:'';position:absolute;left:54px;top:17px;width:9px;height:9px;border-radius:50%;background:#141a2e;border:1px solid #f6eedc55}
.lp-chrono-years>li.has:before{background:var(--gold);border-color:var(--gold);box-shadow:0 0 0 4px #e2bf6a26,0 0 18px 2px #e2bf6a88}
.lp-chrono-years .yr{font:400 15px/1.6 Georgia,serif;letter-spacing:.06em;color:#f6eedc77;padding-top:3px}
.lp-chrono-years li.has .yr{color:var(--gold);font-size:18px}
.lp-beads{list-style:none;margin:0;padding:6px 0 0;display:flex;flex-wrap:wrap;gap:7px;align-items:center}
.lp-bead{display:block;width:7px;height:7px;border-radius:50%;background:#f6eedc33}
.lp-bead.has{width:auto;height:auto;border-radius:20px;background:linear-gradient(120deg,#f3d58c,#e2bf6a 50%,#c9954a);color:#2a1d08;border:0;font:500 12px/1.4 var(--sans);padding:5px 6px 5px 12px;display:inline-flex;align-items:center;gap:8px;box-shadow:0 0 0 1px #fff3 inset,0 0 16px #e2bf6a66;min-height:30px}
.lp-bead.has b{background:#2a1d08;color:var(--gold);font:600 11px/1 Arial,sans-serif;padding:4px 7px;border-radius:10px}
.lp-chrono-empty{font-size:13px;color:#f6eedc88;margin:0}
.lp-cluster{margin:18px 0 8px;padding:18px 20px 20px;background:linear-gradient(135deg,#252c4b,#191f38);border:1px solid #e2bf6a40;box-shadow:0 0 0 1px #ffffff08 inset,0 20px 40px -24px #000a;position:relative}
.lp-cluster:before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(var(--gold),var(--era))}
.lp-cluster-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 14px;margin-bottom:16px}
.lp-cluster-head .kind{font-size:10px;letter-spacing:.14em;color:var(--era);border:1px solid var(--era);padding:1px 7px}
.lp-cluster-head h4{font:500 19px/1.5 var(--serif);color:var(--cream);margin:0}
.lp-cluster-head time{font:12px/1 Georgia,serif;color:#f6eedc88;letter-spacing:.06em}
.lp-cluster-head .n{font-size:12px;color:var(--gold)}
.lp-cluster-head .write{margin-left:auto;font-size:12px;color:var(--cream);text-decoration:none;border-bottom:1px solid #f6eedc55;padding:2px 0}
.lp-cluster-cards{display:flex;gap:22px;overflow-x:auto;padding:6px 4px 14px;scroll-snap-type:x proximity;scrollbar-color:#e2bf6a55 transparent}
.lp-cluster-cards>a{flex:0 0 200px;scroll-snap-align:start;text-decoration:none;color:var(--cream);transition:transform .25s ease;position:relative}
.lp-cluster-cards>a:nth-child(odd){transform:rotate(-1.4deg)}
.lp-cluster-cards>a:nth-child(even){transform:rotate(1.2deg) translateY(4px)}
.lp-cluster-cards>a:hover,.lp-cluster-cards>a:focus-visible{transform:translateY(-6px) rotate(0)}
.lp-cluster-cards>a .lp-card{box-shadow:0 18px 30px -12px #000c,0 0 0 1px #0002}
.lp-cluster-cards .meta{display:block;font-size:11px;color:#f6eedc88;margin-top:8px}
.lp-cluster-cards .status{position:absolute;top:-8px;right:-6px;z-index:2;font-size:11px;background:#e8869a;color:#2a0d16;padding:3px 9px;font-weight:600;box-shadow:0 4px 10px #0006}
.lp-cluster-cards a.is-unchecked .lp-card{outline:2px dashed #e8869a;outline-offset:4px}
.lp-grid a.is-unchecked .lp-card{outline:2px dashed var(--accent);outline-offset:4px}
.lp-grid a.is-hidden .lp-card{opacity:.55}
.lp-status{display:inline-block;font-size:10px;color:#fff;background:var(--accent);padding:1px 7px;margin-right:6px}
.lp-cluster-cards a.is-hidden .lp-card{opacity:.6}
@media(max-width:860px){.lp-chrono{padding:26px 18px 44px;margin-inline:-20px}.lp-chrono-nav{margin:0 -18px 24px;padding:10px 18px;flex-wrap:nowrap;overflow-x:auto}.lp-chrono-nav a{flex-shrink:0}.lp-chrono-years:before{left:40px}.lp-chrono-years>li{grid-template-columns:40px 1fr;gap:0 16px}.lp-chrono-years>li:before{left:36px}.lp-chrono-years .yr{font-size:13px}.lp-chrono-years li.has .yr{font-size:14px}.lp-cluster{padding:16px 14px 16px 16px}.yr-body .lp-cluster{margin-left:-56px}.lp-cluster-cards>a{flex-basis:170px}.lp-cluster-head .write{margin-left:0}}

/* スマホでは「次へ」を入力のすぐ下に(カードの見本はその下)。確認の画面だけ、カードを見てから送る */
@media(max-width:860px){.lp-composer{display:flex;flex-direction:column}.lp-composer>.lp-atelier{display:contents}.lp-composer .lp-preview{order:2;margin-top:34px}.lp-composer .lp-step-nav{order:1}.lp-composer .lp-step-after{order:3}.lp-composer.is-confirm .lp-preview{order:1}}
@media(max-width:600px){.lp-address-parts{grid-template-columns:1fr 1fr}.lp-address-parts>label:first-child{grid-column:1/-1}}
@media(max-width:780px){
.lp{padding-bottom:env(safe-area-inset-bottom)}
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
.lp-admin-row{grid-template-columns:1fr 1fr}
.lp-admin-row>div:last-child{grid-column:1/-1}
}
@media(max-width:360px){.lp-chrono{margin-inline:-16px}.lp-birthday .wish{font-size:32px}.lp-birthday .artist{font-size:79px}.lp-project h2{font-size:18px}.lp-gift.left{left:8px}.lp-gift.right{right:8px}.lp-wrap{padding:0 16px}.lp-years{margin:0 -16px;padding-left:16px}}
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
