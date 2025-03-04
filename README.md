# Me LED Matrix 8x16 MakeCode Extension

This extension allows you to control the Me LED Matrix 8x16 using MakeCode. It provides blocks for initializing the matrix, displaying static patterns, scrolling text, showing pre-defined patterns, and clearing the screen.

## Usage

1. **Initialize the matrix**: Use the `initialize LED matrix` block to set up the DIN and SCK pins.
2. **Display a static pattern**: Use the `display static pattern` block with a 16-byte array.
3. **Scroll text**: Use the `scroll text` block to display scrolling text.
4. **Show pre-defined patterns**: Use the `display pattern` block with names like "heart" or "smiley".
5. **Clear the screen**: Use the `clear LED matrix screen` block to turn off all LEDs.

## Examples

### Initialize the Matrix
```blocks
ledMatrix.initMatrix(DigitalPin.P0, DigitalPin.P1)
