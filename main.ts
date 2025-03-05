// main.ts for Me LED Matrix 8x16 MakeCode Extension

namespace ledMatrix {
    // Global variables to store the pin configuration
    // Global variables for pin configuration
    let dinPin: DigitalPin;
    let sckPin: DigitalPin;

    // Font dictionary for text display (supports A-Z and space)
    let font: { [key: string]: number[] } = {
        "A": [0x38, 0x44, 0x44, 0x7C, 0x44, 0x44, 0x44, 0x00],
        "B": [0x78, 0x44, 0x44, 0x78, 0x44, 0x44, 0x78, 0x00],
        "C": [0x38, 0x44, 0x40, 0x40, 0x40, 0x44, 0x38, 0x00],
        "D": [0x78, 0x44, 0x44, 0x44, 0x44, 0x44, 0x78, 0x00],
        "E": [0x7C, 0x40, 0x40, 0x78, 0x40, 0x40, 0x7C, 0x00],
        "F": [0x7C, 0x40, 0x40, 0x78, 0x40, 0x40, 0x40, 0x00],
        "G": [0x38, 0x44, 0x40, 0x40, 0x4C, 0x44, 0x38, 0x00],
        "H": [0x44, 0x44, 0x44, 0x7C, 0x44, 0x44, 0x44, 0x00],
        "I": [0x38, 0x10, 0x10, 0x10, 0x10, 0x10, 0x38, 0x00],
        "J": [0x04, 0x04, 0x04, 0x04, 0x44, 0x44, 0x38, 0x00],
        "K": [0x44, 0x48, 0x50, 0x60, 0x50, 0x48, 0x44, 0x00],
        "L": [0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x7C, 0x00],
        "M": [0x44, 0x6C, 0x54, 0x44, 0x44, 0x44, 0x44, 0x00],
        "N": [0x44, 0x44, 0x64, 0x54, 0x4C, 0x44, 0x44, 0x00],
        "O": [0x38, 0x44, 0x44, 0x44, 0x44, 0x44, 0x38, 0x00],
        "P": [0x78, 0x44, 0x44, 0x78, 0x40, 0x40, 0x40, 0x00],
        "Q": [0x38, 0x44, 0x44, 0x44, 0x54, 0x48, 0x34, 0x00],
        "R": [0x78, 0x44, 0x44, 0x78, 0x50, 0x48, 0x44, 0x00],
        "S": [0x38, 0x44, 0x40, 0x38, 0x04, 0x44, 0x38, 0x00],
        "T": [0x7C, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x00],
        "U": [0x44, 0x44, 0x44, 0x44, 0x44, 0x44, 0x38, 0x00],
        "V": [0x44, 0x44, 0x44, 0x44, 0x28, 0x10, 0x00, 0x00],
        "W": [0x44, 0x44, 0x44, 0x54, 0x6C, 0x44, 0x44, 0x00],
        "X": [0x44, 0x44, 0x28, 0x10, 0x28, 0x44, 0x44, 0x00],
        "Y": [0x44, 0x44, 0x28, 0x10, 0x10, 0x10, 0x10, 0x00],
        "Z": [0x7C, 0x04, 0x08, 0x10, 0x20, 0x40, 0x7C, 0x00],
        " ": [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
    };

    // Pre-defined patterns (16 bytes each, representing 8 rows x 16 columns)
    let patterns: { [key: string]: number[] } = {
        "heart": [
            0b00000000, 0b01100110, 0b11111111, 0b11111111, 0b11111111, 0b01111110,
            0b00111100, 0b00011000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,
            0b00000000, 0b00000000, 0b00000000, 0b00000000
        ],
        "smiley": [
            0b00000000, 0b00111100, 0b01000010, 0b10100101, 0b10000001, 0b10100101,
            0b01000010, 0b00111100, 0b00000000, 0b00000000, 0b00000000, 0b00000000,
            0b00000000, 0b00000000, 0b00000000, 0b00000000
        ],
        "arrow": [
            0b00001000, 0b00011100, 0b00111110, 0b01111111, 0b00011100, 0b00011100,
            0b00011100, 0b00011100, 0b00011100, 0b00011100, 0b00011100, 0b00011100,
            0b00011100, 0b00011100, 0b00011100, 0b00000000
        ]
    };

    // **Low-level communication functions**
    // Low-level communication functions (unchanged from your original)
    function sendBit(bit: number): void {
        pins.digitalWritePin(sckPin, 0);
        pins.digitalWritePin(dinPin, bit);
@@ -103,7 +53,7 @@ namespace ledMatrix {
        endSignal();
    }

    // **High-level functions exposed as blocks**
    // High-level functions exposed as blocks
    /**
     * Initialize the LED matrix with the specified pins.
     * @param dinPinParam The pin connected to the matrix's DIN.
@@ -113,8 +63,12 @@ namespace ledMatrix {
    export function initMatrix(dinPinParam: DigitalPin, sckPinParam: DigitalPin): void {
        dinPin = dinPinParam;
        sckPin = sckPinParam;
        turnOnScreen();
        clearScreen();
        let data = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        startSignal();
        sendByte(0b10100000); // Turn-on command
        writeBytesToAddress(0, data);
        endSignal();
    }

    /**
@@ -127,45 +81,7 @@ namespace ledMatrix {
            serial.writeLine("Pattern must have 16 bytes.");
            return;
        }
        showRows(pattern);
    }

    /**
     * Display scrolling text on the LED matrix.
     * @param text The text to scroll.
     * @param speed The speed of scrolling in milliseconds.
     */
    //% block="scroll text %text|at speed %speed"
    export function displayScrollingText(text: string, speed: number): void {
        let textPattern: number[] = [];
        for (let char of text.toUpperCase()) {
            if (font[char]) {
                textPattern = textPattern.concat(font[char]);
            } else {
                textPattern = textPattern.concat([0, 0, 0, 0, 0, 0, 0, 0]);
            }
        }
        let totalColumns = textPattern.length / 8;
        let columnData = transposePattern(textPattern, totalColumns);
        for (let startCol = 0; startCol <= columnData.length - 16; startCol++) {
            let displayData = columnData.slice(startCol, startCol + 16);
            while (displayData.length < 16) displayData.push(0);
            showRows(displayData);
            basic.pause(speed);
        }
    }

    /**
     * Display a pre-defined pattern.
     * @param patternName The name of the pattern (e.g., "heart", "smiley", "arrow").
     */
    //% block="display pattern %patternName"
    export function displayPattern(patternName: string): void {
        if (patterns[patternName]) {
            displayStaticPattern(patterns[patternName]);
        } else {
            serial.writeLine("Pattern not found.");
        }
        writeBytesToAddress(0, pattern);
    }

    /**
@@ -178,105 +94,40 @@ namespace ledMatrix {
        writeBytesToAddress(0, data);
    }

    // **Helper functions**
    function showRows(data: number[]): void {
        clearScreen();
        writeBytesToAddress(0, data);
    }

    function turnOnScreen(): void {
        startSignal();
        sendByte(0b10100000); // Turn-on command
        let myData = [];
        for (let i = 0; i < 16; i++) myData.push(0x00);
        showRows(myData);
        endSignal();
    }

    function transposePattern(pattern: number[], totalColumns: number): number[] {
        let columnData: number[] = [];
        for (let col = 0; col < totalColumns * 8; col++) {
            let byte = 0;
            for (let row = 0; row < 8; row++) {
                if ((pattern[row * totalColumns + (col >> 3)] & (1 << (7 - (col % 8)))) !== 0) {
                    byte |= (1 << row);
                }
            }
            columnData.push(byte);
        }
        return columnData;
    }

    // **New and Amazing Features**
    // **New Feature: Create Pattern from String Grid**
    /**
     * Create a custom pattern from a string grid.
     * @param patternStr A string representing the pattern (e.g., "........\n.*......\n..*.....").
     * Create a custom pattern from a string grid (8 rows x 16 columns).
     * Use "*" for lit LEDs and "." for off.
     * @param patternStr A string with 8 lines, each containing 16 characters ("*" or ".").
     * @returns A 16-byte array representing the pattern.
     */
    //% block="create pattern from string %patternStr"
    //% block="create pattern from grid %patternStr"
    export function createPatternFromString(patternStr: string): number[] {
        let pattern: number[] = [];
        let rows = patternStr.trim().split("\n");
        
        // Check if we have exactly 8 rows
        if (rows.length !== 8) {
            serial.writeLine("Pattern must have 8 rows.");
            serial.writeLine("Pattern must have exactly 8 rows.");
            return [];
        }

        // Process each column (16 total)
        for (let col = 0; col < 16; col++) {
            let byte = 0;
            for (let row = 0; row < 8; row++) {
                let line = rows[row];
                let line = rows[row].trim();
                // Check if each row has exactly 16 characters
                if (line.length !== 16) {
                    serial.writeLine("Each row must have 16 characters.");
                    serial.writeLine("Each row must have exactly 16 characters.");
                    return [];
                }
                if (line[col] === "*") {
                    byte |= (1 << row);
                    byte |= (1 << row); // Set the bit for this row if "*"
                }
            }
            pattern.push(byte);
        }
        return pattern;
    }

    /**
     * Display a sequence of patterns with a delay between each.
     * @param sequence An array of 16-byte patterns.
     * @param delayMs The delay between patterns in milliseconds.
     */
    //% block="display pattern sequence %sequence|with delay %delayMs ms"
    export function displayPatternSequence(sequence: number[][], delayMs: number): void {
        for (let i = 0; i < sequence.length; i++) {
            if (sequence[i].length !== 16) {
                serial.writeLine("Each pattern must have 16 bytes.");
                return;
            }
            showRows(sequence[i]);
            basic.pause(delayMs);
        }
    }

    /**
     * Set the brightness of the LED matrix.
     * @param level The brightness level (0-7).
     */
    //% block="set brightness to %level"
    export function setBrightness(level: number): void {
        if (level < 0 || level > 7) {
            serial.writeLine("Brightness level must be between 0 and 7.");
            return;
        }
        startSignal();
        sendByte(0b10001000 | level); // Brightness command
        endSignal();
    }

    /**
     * Turn off the LED matrix screen.
     */
    //% block="turn off LED matrix screen"
    export function turnOffScreen(): void {
        startSignal();
        sendByte(0b10000000); // Turn-off command
        endSignal();
    }
}
