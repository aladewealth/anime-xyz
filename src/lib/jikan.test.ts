import { afterEach, describe, expect, it, vi } from "vitest";
import { getRecommendations, getTopAnime, searchAnime } from "./jikan";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("jikan client", () => {
  it("returns titles from a successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: [{ mal_id: 1, title: "Cowboy Bebop" }] }),
      })
    );

    await expect(getTopAnime("anime", 1)).resolves.toEqual([{ mal_id: 1, title: "Cowboy Bebop" }]);
  });

  it("retries once when Jikan rate-limits the request", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({}) })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [{ mal_id: 2, title: "Naruto" }] }),
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchAnime("naruto")).resolves.toEqual([{ mal_id: 2, title: "Naruto" }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws when the database does not return a usable response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: "unavailable" }),
      })
    );

    await expect(getTopAnime()).rejects.toThrow(/500/);
  });

  it("drops recommendation rows that are missing an entry", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: [{ entry: { mal_id: 5, title: "Monster" } }, { entry: null }, {}] }),
      })
    );

    await expect(getRecommendations(1)).resolves.toEqual([{ mal_id: 5, title: "Monster" }]);
  });
});
