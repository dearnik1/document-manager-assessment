import { describe, it, expect, beforeEach } from "vitest";
import { getFavorites, isFavorite, toggleFavorite } from "./favorites";

describe("favorites utility", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getFavorites", () => {
    it("returns empty array when localStorage is empty", () => {
      expect(getFavorites()).toEqual([]);
    });

    it("returns parsed array from localStorage", () => {
      localStorage.setItem("favorites", JSON.stringify(["/doc/a", "/doc/b"]));
      expect(getFavorites()).toEqual(["/doc/a", "/doc/b"]);
    });

    it("returns empty array for invalid JSON", () => {
      localStorage.setItem("favorites", "not-json");
      expect(getFavorites()).toEqual([]);
    });

    it("returns empty array for non-array JSON", () => {
      localStorage.setItem("favorites", JSON.stringify({ key: "value" }));
      expect(getFavorites()).toEqual([]);
    });
  });

  describe("isFavorite", () => {
    it("returns false when path is not in favorites", () => {
      expect(isFavorite("/doc/a")).toBe(false);
    });

    it("returns true when path is in favorites", () => {
      localStorage.setItem("favorites", JSON.stringify(["/doc/a"]));
      expect(isFavorite("/doc/a")).toBe(true);
    });

    it("returns false for similar but non-matching path", () => {
      localStorage.setItem("favorites", JSON.stringify(["/doc/a"]));
      expect(isFavorite("/doc/ab")).toBe(false);
    });
  });

  describe("toggleFavorite", () => {
    it("adds path when not already favorited", () => {
      const result = toggleFavorite("/doc/a");
      expect(result).toEqual(["/doc/a"]);
      expect(JSON.parse(localStorage.getItem("favorites")!)).toEqual(["/doc/a"]);
    });

    it("removes path when already favorited", () => {
      localStorage.setItem("favorites", JSON.stringify(["/doc/a", "/doc/b"]));
      const result = toggleFavorite("/doc/a");
      expect(result).toEqual(["/doc/b"]);
      expect(JSON.parse(localStorage.getItem("favorites")!)).toEqual(["/doc/b"]);
    });

    it("persists changes to localStorage", () => {
      toggleFavorite("/doc/x");
      toggleFavorite("/doc/y");
      expect(JSON.parse(localStorage.getItem("favorites")!)).toEqual(["/doc/x", "/doc/y"]);
    });

    it("toggle on then off returns to empty", () => {
      toggleFavorite("/doc/a");
      toggleFavorite("/doc/a");
      expect(getFavorites()).toEqual([]);
    });
  });
});
