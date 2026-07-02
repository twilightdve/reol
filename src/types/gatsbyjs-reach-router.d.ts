// 最低限の型宣言: globalHistory.listen のみ Body で使用している。
declare module "@gatsbyjs/reach-router" {
  type HistoryListener = (event: {
    location: { pathname: string; search: string; hash: string };
    action?: string;
  }) => void;
  export const globalHistory: {
    listen: (listener: HistoryListener) => () => void;
    location: { pathname: string; search: string; hash: string };
  };
}
