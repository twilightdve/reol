import { graphql, useStaticQuery } from "gatsby";
import { useMemo } from "react";
import { buildLetterEvents, ERA_EVENTS, LetterEvent } from "../../utils/letters/timeline";

/** 年表の宛先(サイトの DISCOGRAPHY / LIVE シートから。公開情報) */
export const useLetterEvents = (): { events: LetterEvent[]; byKey: Map<string, LetterEvent> } => {
  const data = useStaticQuery(graphql`
    query LetterTimelineData {
      discography {
        discographyWithSongs {
          discographyUuid
          slug
          title
          releaseDate
          name
          format
          songs {
            songName
          }
        }
      }
      live {
        liveInfos {
          liveUuid
          title
          name
          date
          type
          items {
            slug
            date
            place
          }
        }
      }
    }
  `);
  return useMemo(() => {
    const events = buildLetterEvents(data?.discography?.discographyWithSongs ?? [], data?.live?.liveInfos ?? []);
    const byKey = new Map<string, LetterEvent>();
    for (const e of [...ERA_EVENTS, ...events]) byKey.set(e.key, e);
    return { events, byKey };
  }, [data]);
};
