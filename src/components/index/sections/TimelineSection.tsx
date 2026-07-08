import React from "react";
import { FaCalendarAlt } from "react-icons/fa";

const TimelineSection: React.FC = () => {
  return (
    <section id="TIMELINE" style={{ contentVisibility: "auto" }} className="bg-white/5 border border-bx-line rounded-xl mx-2 sm:mx-4 my-4 sm:my-6 p-2 sm:p-3">
      <div className="pt-6 pb-2 px-2 sm:pt-12">
        <h2 className="flex items-center font-bold text-lg text-bx-ink">
          <FaCalendarAlt className="text-lg mr-2" />
          <span>TIMELINE</span>
        </h2>
        <div className="pt-2 text-xs sm:text-base break-words leading-relaxed tracking-widest text-bx-ink2">
          TIMELINEでは、あなた専用のReol年表を作成できます。
          <br />
          Reolとの出会いから現在までの軌跡を美しい年表として可視化し、思い出を振り返ることができます。
        </div>
      </div>

      <div className="rounded-lg border border-bx-line p-6 mx-2 my-4">
        <div className="text-center space-y-4">
          <div className="rounded-full border border-bx-line w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <FaCalendarAlt className="text-2xl text-bx-blue" />
          </div>

          <h3 className="text-2xl font-bold text-bx-ink">
            あなただけのReol年表を作成
          </h3>

          <p className="text-bx-ink2 leading-relaxed">
            Reolを知った瞬間から現在まで、リリース作品・ライブ・特別な思い出を
            <br />
            美しくインタラクティブな年表として自動生成。
            <br />
            <span className="text-bx-blue font-semibold">
              シェア用画像も作成できます！
            </span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
            <div className="bg-white/5 border border-bx-line p-6 rounded-xl">
              <div className="text-lg font-bold text-bx-ink mb-1">
                個人年表
              </div>
              <div className="text-sm text-bx-ink3">あなただけの音楽史</div>
            </div>
            <div className="bg-white/5 border border-bx-line p-6 rounded-xl">
              <div className="text-lg font-bold text-bx-ink mb-1">
                作品履歴
              </div>
              <div className="text-sm text-bx-ink3">全楽曲・アルバム</div>
            </div>
            <div className="bg-white/5 border border-bx-line p-6 rounded-xl">
              <div className="text-lg font-bold text-bx-ink mb-1">
                ライブ体験
              </div>
              <div className="text-sm text-bx-ink3">思い出のステージ</div>
            </div>
          </div>

          <div className="space-y-4">
            <a
              href="/timeline/generator"
              className="inline-block bg-bx-yellow text-bx-bg px-10 py-4 rounded-full font-bold text-xl hover:opacity-90 transition-opacity"
            >
              年表を作成する
            </a>

            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <span className="border border-bx-line text-bx-ink px-3 py-1 rounded-full text-sm font-medium">
                美しいデザイン
              </span>
              <span className="border border-bx-line text-bx-ink px-3 py-1 rounded-full text-sm font-medium">
                SNSシェア対応
              </span>
              <span className="border border-bx-line text-bx-ink px-3 py-1 rounded-full text-sm font-medium">
                数分で完成
              </span>
            </div>

            <p className="text-sm text-bx-ink3 mt-4">
              作成した年表は画像として保存・シェアできます
            </p>
          </div>
        </div>
      </div>

      <div className="pt-1 pb-4 px-1 mx-2 my-2 bg-white/5 rounded-lg border border-bx-line">
        <ul className="pl-2 pt-1 list-disc list-inside text-sm leading-loose tracking-wide text-bx-ink2">
          <li>
            <strong className="text-bx-ink">簡単3ステップ：</strong> ニックネーム→詳細情報→年表完成
          </li>
          <li>
            <strong className="text-bx-ink">自動生成：</strong>{" "}
            あなたの情報とReolの歴史を組み合わせて美しい年表を作成
          </li>
          <li>
            <strong className="text-bx-ink">シェア機能：</strong>{" "}
            完成した年表は画像として保存・SNS投稿が可能
          </li>
          <li>
            <strong className="text-bx-ink">思い出の保存：</strong>{" "}
            作成した年表はいつでも見返すことができます
          </li>
        </ul>
      </div>
    </section>
  );
};

export default TimelineSection;
