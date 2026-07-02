// .md ファイルを文字列としてインポートするための型宣言
declare module '*.md' {
  const content: string
  export default content
}
