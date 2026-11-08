/**
 * 本文の装飾エディター(plan/64)。Tiptap(ProseMirror)で、使える装飾を絞る。
 * 太字・色 4 種・大きさ(小・標準・大)・左寄せ / 中央寄せ・段落と改行だけ。画像・リンク・見出し・貼り付けた HTML の装飾は通さない。
 * 中身は LetterBody(JSON)でやりとりする。
 */
import React, { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { Mark, mergeAttributes } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import HardBreak from "@tiptap/extension-hard-break";
import History from "@tiptap/extension-history";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { fromEditorJson, LetterBody, toEditorJson } from "../../utils/letters/body";
import { TEXT_COLORS, TextColor, TextSize } from "../../utils/letters/constants";

const COLOR_IDS = TEXT_COLORS.map((c) => c.id) as string[];

const LetterColor = Mark.create({
  name: "letterColor",
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (el) => {
          const v = el.getAttribute("data-lp-color");
          return v && COLOR_IDS.includes(v) ? v : null;
        },
        renderHTML: (attrs) => {
          const c = TEXT_COLORS.find((t) => t.id === attrs.color);
          return c ? { "data-lp-color": c.id, style: `color:${c.value}` } : {};
        },
      },
    };
  },
  // 自分で出した span だけを読み戻す(よそから貼り付けた色は通さない)
  parseHTML() {
    return [{ tag: "span[data-lp-color]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },
});

const LetterSize = Mark.create({
  name: "letterSize",
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (el) => {
          const v = el.getAttribute("data-lp-size");
          return v === "s" || v === "l" ? v : null;
        },
        renderHTML: (attrs) => (attrs.size === "s" || attrs.size === "l" ? { "data-lp-size": attrs.size, class: `lp-${attrs.size}` } : {}),
      },
    };
  },
  parseHTML() {
    return [{ tag: "span[data-lp-size]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },
});

type Props = {
  value: LetterBody;
  /** これが変わった時だけ、value でエディターの中身を置き換える */
  resetKey: string | number;
  onChange: (body: LetterBody) => void;
  /** 今の文字数と、カードに入るか */
  length: number;
  fits: boolean;
  labelId: string;
};

export const BodyEditor: React.FC<Props> = ({ value, resetKey, onChange, length, fits, labelId }) => {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      HardBreak,
      History,
      LetterColor,
      LetterSize,
      TextAlign.configure({ types: ["paragraph"], alignments: ["left", "center", "right"], defaultAlignment: "left" }),
      Placeholder.configure({ placeholder: "ここにお祝いの言葉を。改行もそのままカードに載ります。" }),
    ],
    content: toEditorJson(value),
    editorProps: {
      attributes: {
        "aria-labelledby": labelId,
        "aria-multiline": "true",
        role: "textbox",
        spellcheck: "false",
      },
    },
    onUpdate: ({ editor: e }) => onChangeRef.current(fromEditorJson(e.getJSON() as Parameters<typeof fromEditorJson>[0])),
    immediatelyRender: false,
  });

  // 外から本文を差し替える時(書きかけの復元・修正画面の読み込み・もう一通)だけ、resetKey を変えて反映する。
  // 入力のたびに value を書き戻すと、速く打った時に一つ前の内容で上書きしてしまうため、ふだんは書き戻さない
  const valueRef = useRef(value);
  valueRef.current = value;
  const firstReset = useRef(true);
  useEffect(() => {
    if (!editor) return;
    if (firstReset.current) {
      firstReset.current = false;
      return;
    }
    editor.commands.setContent(toEditorJson(valueRef.current), false);
  }, [editor, resetKey]);

  const colorNow = (editor?.getAttributes("letterColor").color as TextColor | undefined) ?? null;
  const sizeNow = (editor?.getAttributes("letterSize").size as TextSize | undefined) ?? null;
  const align = editor?.isActive({ textAlign: "center" }) ? "center" : editor?.isActive({ textAlign: "right" }) ? "right" : "left";

  const setColor = (c: TextColor | null) => {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (c) chain.setMark("letterColor", { color: c }).run();
    else chain.unsetMark("letterColor").run();
  };
  const setSize = (s: TextSize | null) => {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (s) chain.setMark("letterSize", { size: s }).run();
    else chain.unsetMark("letterSize").run();
  };

  return (
    <div className="lp-editor">
      {/* ボタンを押しても本文から入力位置が外れないよう、押した時にフォーカスを移さない */}
      <div className="lp-toolbar" role="toolbar" aria-label="本文の装飾" onMouseDown={(e) => e.preventDefault()}>
        <button
          type="button"
          aria-pressed={editor?.isActive("bold") ?? false}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          aria-label="太字"
        >
          <b>B</b>
        </button>
        <span className="sep" aria-hidden />
        <button type="button" aria-pressed={!colorNow} onClick={() => setColor(null)} aria-label="文字の色: 標準">
          <span className="dot" style={{ background: "#293b3e" }} />
        </button>
        {TEXT_COLORS.map((c) => (
          <button key={c.id} type="button" aria-pressed={colorNow === c.id} onClick={() => setColor(c.id)} aria-label={`文字の色: ${c.label}`}>
            <span className="dot" style={{ background: c.value }} />
          </button>
        ))}
        <span className="sep" aria-hidden />
        <button type="button" aria-pressed={sizeNow === "s"} onClick={() => setSize(sizeNow === "s" ? null : "s")} aria-label="文字を小さく">
          <span style={{ fontSize: 11 }}>小</span>
        </button>
        <button type="button" aria-pressed={!sizeNow} onClick={() => setSize(null)} aria-label="文字の大きさ: 標準">
          中
        </button>
        <button type="button" aria-pressed={sizeNow === "l"} onClick={() => setSize(sizeNow === "l" ? null : "l")} aria-label="文字を大きく">
          <span style={{ fontSize: 17 }}>大</span>
        </button>
        <span className="sep" aria-hidden />
        <button
          type="button"
          aria-pressed={align === "left"}
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          aria-label="左寄せ"
        >
          左寄せ
        </button>
        <button
          type="button"
          aria-pressed={align === "center"}
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          aria-label="中央寄せ"
        >
          中央
        </button>
        <button
          type="button"
          aria-pressed={align === "right"}
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          aria-label="右寄せ"
        >
          右寄せ
        </button>
      </div>
      <div className="lp-editor-area">
        <EditorContent editor={editor} />
      </div>
      <div className="lp-meter" aria-live="polite">
        <span>{length.toLocaleString()} 字</span>
        {fits ? <span>カードに収まっています</span> : <span className="over">カードに入りきりません。文を短くするか、文字を小さくしてください</span>}
      </div>
    </div>
  );
};

export default BodyEditor;
