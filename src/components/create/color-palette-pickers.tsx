/**
 * @fileoverview Color palette picker components for emoji customization.
 * Provides color picker popovers using react-aria-components that allow users
 * to select colors using a color area, hue slider, hex input, and preset colors.
 */

import { CopyIcon, EyedropperIcon } from "@phosphor-icons/react";
import { use, useRef } from "react";
import type { Color } from "react-aria-components";
import {
  Button as AriaButton,
  Input as AriaInput,
  Label as AriaLabel,
  ColorPickerStateContext,
  Dialog,
  DialogTrigger,
  Popover,
  parseColor,
} from "react-aria-components";
import { toast } from "sonner";
import {
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  ColorSwatchPickerItem,
  ColorThumb,
  SliderTrack,
} from "@/components/color";
import { Button } from "@/components/ui/button";
import { useEmoji } from "@/contexts/emoji-context";
import { PRESET_COLORS } from "@/lib/constants";
import { useT } from "@/lib/translations";

/**
 * EyeDropper button component that uses the browser's EyeDropper API
 * to pick colors from anywhere on the screen.
 * Returns null if the EyeDropper API is not supported by the browser.
 *
 * @returns EyeDropper button component or null if not supported.
 */
function EyeDropperButton() {
  const t = useT();
  const state = use(ColorPickerStateContext);
  if (!state)
    throw new Error("EyeDropperButton must be used inside ColorPicker");

  // Check if browser supports EyeDropper API
  // @ts-expect-error - EyeDropper API may not be available
  if (typeof EyeDropper === "undefined") {
    return null;
  }

  return (
    <AriaButton
      aria-label={t("Eye dropper")}
      className="inline-flex size-8 items-center justify-center rounded-md border border-input bg-background font-medium text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-offset-2"
      onPress={() => {
        // @ts-expect-error - EyeDropper API may not be available
        new EyeDropper()
          .open()
          .then((result: { sRGBHex: string }) =>
            state.setColor(parseColor(result.sRGBHex))
          );
      }}
    >
      <EyedropperIcon className="size-4" aria-hidden="true" />
    </AriaButton>
  );
}

interface ColorPickerPopoverProps {
  /** The current color value (hex string). */
  color: string;
  /** Callback invoked when the color changes. */
  onColorChange: (color: string) => void;
  /** Optional index for identification. */
  index?: number;
}

/**
 * Native color swatch for touch devices. Wraps the browser's built-in
 * `<input type="color">` so phones/tablets get the OS color picker instead of
 * the desktop popover (better ergonomics, no popover-close-on-tap issues).
 *
 * @param props - Component props (color + onColorChange).
 * @returns A swatch button backed by a native color input.
 */
export function NativeColorPicker({
  color,
  onColorChange,
}: ColorPickerPopoverProps) {
  const t = useT();
  return (
    <label
      aria-label={`${t("Pick color")} ${color}`}
      className="relative block size-12 cursor-pointer overflow-hidden rounded-lg border-2"
      style={{ backgroundColor: color }}
    >
      <input
        type="color"
        value={color}
        onChange={(e) => onColorChange(e.target.value)}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
      />
    </label>
  );
}

/**
 * Popover-based color picker component.
 * Displays a color swatch button that opens a color picker dialog with
 * color area selector, hue slider, hex input field, and preset colors.
 *
 * @param props - Component props.
 * @returns Color picker popover component.
 */
export function ColorPickerPopover({
  color,
  onColorChange,
}: ColorPickerPopoverProps) {
  const t = useT();
  // Parse the hex color string to a Color object in HSB format
  const colorValue = parseColor(color).toFormat("hsb");
  // Track if user is dragging to prevent popover from closing during drag
  const isDraggingRef = useRef(false);

  /**
   * Handles color change from the color picker.
   *
   * @param newColor - The new color value from the picker.
   */
  const handleColorChange = (newColor: Color) => {
    onColorChange(newColor.toString("hex"));
  };

  return (
    <DialogTrigger>
      <AriaButton
        aria-label={`${t("Pick color")} ${color}`}
        className="size-12 cursor-pointer rounded-lg border-2 p-0 outline-none focus:ring-2 focus:ring-offset-2"
        style={{ backgroundColor: color }}
      >
        <ColorSwatch />
      </AriaButton>
      <Popover
        placement="bottom"
        className="w-fit"
        // Prevent popover from closing during color area/slider drag interactions
        shouldCloseOnInteractOutside={() => !isDraggingRef.current}
      >
        <Dialog
          className="relative flex flex-col gap-4 rounded-lg border bg-popover p-4 shadow-lg outline-none"
          aria-label={t("Color picker")}
        >
          <ColorPicker value={colorValue} onChange={handleColorChange}>
            {/* Color Area for saturation and brightness */}
            <div
              onPointerDown={() => {
                isDraggingRef.current = true;
              }}
              onPointerUp={() => {
                isDraggingRef.current = false;
              }}
              onPointerCancel={() => {
                isDraggingRef.current = false;
              }}
            >
              <ColorArea
                colorSpace="hsb"
                xChannel="saturation"
                yChannel="brightness"
                className="h-48 w-full rounded-b-none border-b-0"
              >
                <ColorThumb className="z-(--z-modal)" />
              </ColorArea>
              {/* Hue Slider */}
              <ColorSlider colorSpace="hsb" channel="hue">
                <SliderTrack className="w-full rounded-t-none border-t-0">
                  <ColorThumb className="top-1/2" />
                </SliderTrack>
              </ColorSlider>
            </div>

            {/* Hex Input Field */}
            <ColorField className="flex w-full gap-2">
              <AriaLabel className="sr-only">{t("Hex Color")}</AriaLabel>
              <AriaInput
                className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 font-mono text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                placeholder={t("Hex")}
                onKeyDown={(e) => {
                  // Blur on Enter to commit the color value
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
              />
              <Button
                aria-label={t("Copy color code")}
                className="size-9"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(colorValue.toString("hex"));
                  toast.success(t("Color copied to clipboard."), {
                    description: `${colorValue.toString("hex")}`,
                  });
                }}
              >
                <CopyIcon size={30} aria-hidden="true" />
              </Button>
            </ColorField>

            {/* Color Swatch Picker */}
            <div className="grid grid-cols-6 gap-2">
              <EyeDropperButton />
              {PRESET_COLORS.map((presetColor) => (
                <ColorSwatchPicker key={presetColor}>
                  <ColorSwatchPickerItem color={presetColor}>
                    <ColorSwatch />
                  </ColorSwatchPickerItem>
                </ColorSwatchPicker>
              ))}
            </div>
          </ColorPicker>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}

/**
 * Color palette pickers component.
 * Displays multiple color picker popovers for editing the emoji's color palette.
 * Each color in the palette can be individually customized.
 *
 * @returns Color palette pickers component.
 */
export default function ColorPalettePickers() {
  const { customizedPaletteColors, handleColorChange } = useEmoji();

  return (
    <div className="flex justify-center">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {customizedPaletteColors.map((color, idx) => {
          // Key by index, not color: colors can repeat or change on every drag,
          // so a color key would remount the popover mid-interaction (closing
          // it). Index is stable and unique per palette slot.
          const key = `palette-${idx}`;
          const onChange = (newColor: string) =>
            handleColorChange(idx, newColor);
          return (
            <div key={key}>
              {/* Touch devices: native OS color picker. */}
              <div className="lg:hidden">
                <NativeColorPicker color={color} onColorChange={onChange} />
              </div>
              {/* Desktop: rich popover picker. */}
              <div className="hidden lg:block">
                <ColorPickerPopover
                  color={color}
                  onColorChange={onChange}
                  index={idx}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
