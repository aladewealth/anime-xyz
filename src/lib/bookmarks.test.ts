import { describe, expect, it } from "vitest";
import { titlePath } from "./bookmarks";

describe("titlePath", () => {
  it("opens anime on the MyAnimeList detail route", () => {
    expect(titlePath({ id: "5114", type: "anime" })).toBe("/title/anime/5114");
  });

  it("keeps numeric manga ids on the MyAnimeList detail route", () => {
    expect(titlePath({ id: "1", type: "manga" })).toBe("/title/manga/1");
  });

  it("opens MangaDex uuids in the reader catalog", () => {
    expect(titlePath({ id: "e900135b-8eba-4d29-85c9-db3d5ae885c7", type: "manga" })).toBe(
      "/manga/e900135b-8eba-4d29-85c9-db3d5ae885c7"
    );
  });
});
