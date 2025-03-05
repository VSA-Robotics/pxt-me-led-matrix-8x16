// main.ts for Me LED Matrix 8x16 MakeCode Extension

namespace ledMatrix {
    // Global variables to store the pin configuration
    let dinPin: DigitalPin;
    let sckPin: DigitalPin;

    // Font dictionary for text display (8x8 pixel characters)
    let font: { [key: string]: number[] } = {
        "A": [0x38, 0x44, 0x44, 0x7C, 0x44, 0x44, 0x44, 0x00],
        "B": [0x78, 0x44, 0x44, 0x78, 0x44, 0x44, 0x78, 0x00],
        "C": [0x38, 0x44, 0x40, 0x40, 0x40, 0x44, 0x38, 0x00],
        "H": [0x44, 0x44, 0x44, 0x7C, 0x44, 0x44, 0x44, 0x00],
        "E": [0x7C, 0x40, 0x40, 0x78, 0x40, 0x40, 0x7C, 0x00],
        "L": [0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x7C, 0x00],
        "O": [0x38, 0x44, 0x44, 0x44, 0x44, 0x44, 0x38, 0x00],
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
        ]
    };

    // **Low-level communication functions**
    // Send a single bit to the matrix
    function sendBit(bit: number): void {
        pins.digitalWritePin(sckPin, 0);
        pins.digitalWritePin(dinPin, bit);
        control.waitMicros(2);
        pins.digitalWritePin(sckPin, 1);
        control.waitMicros(2);
    }

    // Send a full byte (8 bits) to the matrix
    function sendByte(byte: number): void {
        for (let i = 7; i >= 0; i--) {
            sendBit((byte >> i) & 1);
        }
    }

    // Start signal for communication with the matrix
    function startSignal(): void {
        pins.digitalWritePin(sckPin, 0);
        control.waitMicros(1);
        pins.digitalWritePin(sckPin, 1);
        pins.digitalWritePin(dinPin, 1);
        pins.digitalWritePin(dinPin, 0);
    }

    // End signal for communication with the matrix
    function endSignal(): void {
        pins.digitalWritePin(sckPin, 0);
        control.waitMicros(2);
        pins.digitalWritePin(dinPin, 0);
        pins.digitalWritePin(sckPin, 1);
        control.waitMicros(1);
        pins.digitalWritePin(dinPin, 1);
    }

    // Write an array of bytes to a specific address on the matrix
    function writeBytesToAddress(address: number, data: number[]): void {
        if (address > 15 || data.length == 0) return;
        startSignal();
        sendByte(0b01000000); // Auto-increment mode
        endSignal();
        startSignal();
        sendByte(0b11000000); // Grid Address
        for (let k = 0; k < data.length; k++) {
            sendByte(data[k]);
        }
        endSignal();
        startSignal();
        sendByte(0b10001000); // Display command
        endSignal();
    }

    // **High-level functions exposed as blocks**
    /**
     * Initialize the LED matrix with the specified pins.
     * @param dinPinParam The pin connected to the matrix's DIN.
     * @param sckPinParam The pin connected to the matrix's SCK.
     */
    export function initMatrix(dinPinParam: DigitalPin, sckPinParam: DigitalPin): void {
        dinPin = dinPinParam;
        sckPin = sckPinParam;
        turnOnScreen(); // Turn on the matrix
        clearScreen();  // Clear it initially
    }

    /**
     * Display a static pattern on the LED matrix.
     * @param pattern An array of 16 bytes representing the pattern.
     */
    export function displayStaticPattern(pattern: number[]): void {
        if (pattern.length !== 16) {
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
    export function displayScrollingText(text: string, speed: number): void {
        let textPattern: number[] = [];
        // Build the pattern by concatenating font data for each character
        for (let char of text.toUpperCase()) {
            if (font[char]) {
                textPattern = textPattern.concat(font[char]);
            } else {
                textPattern = textPattern.concat([0, 0, 0, 0, 0, 0, 0, 0]); // Default to empty space
            }
        }
        let totalColumns = textPattern.length / 8;
        let columnData = transposePattern(textPattern, totalColumns);
        // Scroll the text across the matrix
        for (let startCol = 0; startCol <= columnData.length - 16; startCol++) {
            let displayData = columnData.slice(startCol, startCol + 16);
            while (displayData.length < 16) displayData.push(0); // Pad with zeros if needed
            showRows(displayData);
            basic.pause(speed);
        }
    }

    /**
     * Display a pre-defined pattern.
     * @param patternName The name of the pattern (e.g., "heart", "smiley").
     */
    export function displayPattern(patternName: string): void {
        if (patterns[patternName]) {
            displayStaticPattern(patterns[patternName]);
        } else {
            serial.writeLine("Pattern not found.");
        }
    }

    /**
     * Clear the LED matrix screen.
     */
    export function clearScreen(): void {
        let data = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        writeBytesToAddress(0, data);
    }

    // **Helper functions**
    // Display a row of data on the matrix
    function showRows(data: number[]): void {
        clearScreen();
        writeBytesToAddress(0, data);
    }

    // Turn on the matrix display
    function turnOnScreen(): void {
        startSignal();
        sendByte(0b10100000); // Turn-on command
        let myData = [];
        for (let i = 0; i < 16; i++) myData.push(0x00);
        showRows(myData);
        endSignal();
    }

    // Transpose a row-based pattern to column-based data for the matrix
    function transposePattern(pattern: number[], totalColumns: number): number[] {
        let columnData: number[] = [];
        for (let col = 0; col < totalColumns * 8; col++) {
            let byte = 0;
            for (let row = 0; row < 8; row++) {
                if ((pattern[row * totalColumns + col >> 3] & (1 << (7 - (col % 8)))) !== 0) {
                    byte |= (1 << row);
                }
            }
            columnData.push(byte);
        }
        return columnData;
    }
}
