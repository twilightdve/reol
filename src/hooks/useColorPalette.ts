import { useState, useEffect } from "react";
import {
  ColorPalette,
  extractColorsFromImage,
  getColorPaletteForContent,
  defaultColorPalette,
  applyColorPalette,
  resetColorPalette,
} from "../utils/colorExtractor";

export interface UseColorPaletteProps {
  title?: string;
  imageSrc?: string;
  autoApply?: boolean;
  prefix?: string;
}

export interface UseColorPaletteReturn {
  colorPalette: ColorPalette;
  isLoading: boolean;
  error: string | null;
  applyColors: () => void;
  resetColors: () => void;
}

/**
 * コンテンツに応じた動的カラーパレット管理フック
 */
export function useColorPalette({
  title,
  imageSrc,
  autoApply = false,
  prefix = "",
}: UseColorPaletteProps): UseColorPaletteReturn {
  const [colorPalette, setColorPalette] =
    useState<ColorPalette>(defaultColorPalette);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadColorPalette = async () => {
      if (!title && !imageSrc) return;

      setIsLoading(true);
      setError(null);

      try {
        let palette: ColorPalette | null = null;

        // 1. タイトルベースのプリセットカラーを試す
        if (title) {
          palette = getColorPaletteForContent(title);
        }

        // 2. プリセットが見つからない場合、画像から色を抽出
        if (!palette && imageSrc) {
          palette = await extractColorsFromImage(imageSrc);
        }

        // 3. どちらも失敗した場合はデフォルトを使用
        if (!palette) {
          palette = defaultColorPalette;
        }

        setColorPalette(palette);

        // 自動適用が有効な場合はCSSに適用
        if (autoApply) {
          applyColorPalette(palette, prefix);
        }
      } catch (err) {
        console.error("Color palette loading error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load color palette"
        );
        setColorPalette(defaultColorPalette);
      } finally {
        setIsLoading(false);
      }
    };

    loadColorPalette();
  }, [title, imageSrc, autoApply, prefix]);

  const applyColors = () => {
    applyColorPalette(colorPalette, prefix);
  };

  const resetColors = () => {
    resetColorPalette(prefix);
    setColorPalette(defaultColorPalette);
  };

  return {
    colorPalette,
    isLoading,
    error,
    applyColors,
    resetColors,
  };
}

/**
 * 複数のコンテンツアイテムのカラーパレットを管理するフック
 */
export function useMultipleColorPalettes<
  T extends { title?: string; imageSrc?: string; id: string | number }
>(items: T[]): Record<string | number, ColorPalette> {
  const [palettes, setPalettes] = useState<
    Record<string | number, ColorPalette>
  >({});

  useEffect(() => {
    const loadPalettes = async () => {
      const newPalettes: Record<string | number, ColorPalette> = {};

      for (const item of items) {
        let palette: ColorPalette | null = null;

        if (item.title) {
          palette = getColorPaletteForContent(item.title);
        }

        if (!palette && item.imageSrc) {
          try {
            palette = await extractColorsFromImage(item.imageSrc);
          } catch (error) {
            console.error(
              `Failed to extract colors for item ${item.id}:`,
              error
            );
          }
        }

        newPalettes[item.id] = palette || defaultColorPalette;
      }

      setPalettes(newPalettes);
    };

    if (items.length > 0) {
      loadPalettes();
    }
  }, [items]);

  return palettes;
}

/**
 * ホバー時などの一時的なカラーパレット適用フック
 */
export function useTemporaryColorPalette(prefix: string = "temp-") {
  const [appliedPalette, setAppliedPalette] = useState<ColorPalette | null>(
    null
  );

  const applyTemporary = (palette: ColorPalette) => {
    applyColorPalette(palette, prefix);
    setAppliedPalette(palette);
  };

  const clearTemporary = () => {
    if (appliedPalette) {
      resetColorPalette(prefix);
      setAppliedPalette(null);
    }
  };

  return {
    applyTemporary,
    clearTemporary,
    isApplied: appliedPalette !== null,
  };
}
