import React, { Component } from "react";
import unboxIndex from "../../../images/unbox/unbox_index_tobira.png";

type Props = {};

export default class Features extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {}

  componentDidUpdate(prevProps: Readonly<Props>, snapshot?: any) {}

  render() {
    return (
      <ul className="m-auto max-w-192 ">
        {/* <li className="relative h-24 border-b border-solid border-gray-50 mb-2">
          <a
            className="grid grid-cols-[6rem_0.8rem_1fr] grid-rows-[1.5rem_3.5rem_1rem] w-full h-full"
            href="/fs/unbox/osaka"
          >
            <div className="relative inline-block row-start-1 row-end-4 col-start-1 col-end-2 m-0 p-0">
              <img
                className="inline-block m-0 p-0 text-center w-full h-full object-cover object-center"
                srcSet={unboxOsaka}
                alt="#Reol黒箱 大阪公演 ライヴレポート"
              />
            </div>
            <h2 className="m-0 p-0 row-start-1 row-end-4 col-start-3 col-end-4 w-full h-full text-sm">
              #Reol黒箱 大阪公演 ライヴレポート
            </h2>
            <div className="m-0 p-0 row-start-2 row-end-3 col-start-3 col-end-4 text-gray-500 w-full h-full overflow-hidden text-xs tracking-wide leading-normal">
              2023/11/18に開催されたUNBOX
              black公演第一弾の思い出を振り返ります！
            </div>
            <div className="flex justify-between row-start-3 row-end-4 col-start-3 col-end-4 text-gray-600 text-xs">
              <span></span>
              <span className="p-caption-date">2024/06/xx</span>
            </div>
          </a>
        </li> */}
        <li className="relative h-24 border-b border-solid border-gray-50 mb-2">
          <a
            className="grid grid-cols-[6rem_0.8rem_1fr] grid-rows-[1.5rem_3.5rem_1rem] w-full h-full"
            href="/fs/unbox/"
          >
            <div className="relative inline-block row-start-1 row-end-4 col-start-1 col-end-2 m-0 p-0">
              <img
                className="inline-block m-0 p-0 text-center w-full h-full object-cover object-center"
                srcSet={unboxIndex}
                alt="UNBOXを振り返る"
              />
            </div>
            <h2 className="m-0 p-0 row-start-1 row-end-4 col-start-3 col-end-4 w-full h-full text-sm">
              UNBOXを振り返る
            </h2>
            <div className="m-0 p-0 row-start-2 row-end-3 col-start-3 col-end-4 text-gray-500 w-full h-full overflow-hidden text-xs tracking-wide leading-normal">
              2023/11/18〜2024/3/20と4ヶ月もの間全国を回ったUNBOXについて振り返ります。
            </div>
            <div className="flex justify-between row-start-3 row-end-4 col-start-3 col-end-4 text-gray-600 text-[.65rem] tracking-wider">
              <div className="flex gap-2">
                <span>#Reol黒箱</span>
                <span>#Reol白箱</span>
              </div>
              <span className="p-caption-date">2024-07-08</span>
            </div>
          </a>
        </li>
      </ul>
    );
  }
}
