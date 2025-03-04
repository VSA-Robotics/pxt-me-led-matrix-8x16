// main.ts for Me LED Matrix 8x16 MakeCode Extension

namespace ledMatrix {
    // Global variables for pin configuration
    let dinPin: DigitalPin;
    let sckPin: DigitalPin;

    // Current pattern being edited (8 rows x 16 columns, as a string grid)
    let currentPattern: string[] = [
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................"
    ];
    let cursorRow = 0; // Current row in the grid (0-7)
    let cursorCol = 0; // Current column in the grid (0-15)

    // Low-level communication functions (unchanged from your original)
    function sendBit(bit: number): void {
        pins.digitalWritePin(sckPin, 0);
        pins.digitalWritePin(dinPin, bit);
        control.waitMicros(2);
        pins.digitalWritePin(sckPin, 1);
        control.waitMicros(2);
    }

    function sendByte(byte: number): void {
        for (let i = 7; i >= 0; i--) {
            sendBit((byte >> i) & 1);
        }
    }

    function startSignal(): void {
        pins.digitalWritePin(sckPin, 0);
        control.waitMicros(1);
        pins.digitalWritePin(sckPin, 1);
        pins.digitalWritePin(dinPin, 1);
        pins.digitalWritePin(dinPin, 0);
    }

    function endSignal(): void {
        pins.digitalWritePin(sckPin, 0);
        control.waitMicros(2);
        pins.digitalWritePin(dinPin, 0);
        pins.digitalWritePin(sckPin, 1);
        control.waitMicros(1);
        pins.digitalWritePin(dinPin, 1);
    }

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

    // High-level functions for matrix control (unchanged core functions, simplified for brevity)
    /**
     * Initialize the LED matrix with the specified pins.
     * @param dinPinParam The pin connected to the matrix's DIN.
     * @param sckPinParam The pin connected to the matrix's SCK.
     */
    //% block="initialize LED matrix with DIN %dinPinParam|SCK %sckPinParam"
    export function initMatrix(dinPinParam: DigitalPin, sckPinParam: DigitalPin): void {
        dinPin = dinPinParam;
        sckPin = sckPinParam;
        let data = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        startSignal();
        sendByte(0b10100000); // Turn-on command
        writeBytesToAddress(0, data);
        endSignal();
    }

    /**
     * Display a static pattern on the LED matrix.
     * @param pattern An array of 16 bytes representing the pattern.
     */
    //% block="display static pattern %pattern"
    export function displayStaticPattern(pattern: number[]): void {
        if (pattern.length !== 16) {
            serial.writeLine("Pattern must have 16 bytes.");
            return;
        }
        writeBytesToAddress(0, pattern);
    }

    /**
     * Clear the LED matrix screen.
     */
    //% block="clear LED matrix screen"
    export function clearScreen(): void {
        let data = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        writeBytesToAddress(0, data);
    }

    // **Pattern Editor Functions**
    /**
     * Start editing a new pattern on the 8x16 grid, initializing all LEDs to off.
     */
    //% block="start pattern editor"
    export function startPatternEditor(): void {
        currentPattern = [
            "................",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................"
        ];
        cursorRow = 0;
        cursorCol = 0;
        updatePreview(); // Show initial state on micro:bit
    }

    /**
     * Move the cursor up in the pattern grid.
     */
    //% block="move cursor up"
    export function moveCursorUp(): void {
        if (cursorRow > 0) cursorRow--;
        updatePreview();
    }

    /**
     * Move the cursor down in the pattern grid.
     */
    //% block="move cursor down"
    export function moveCursorDown(): void {
        if (cursorRow < 7) cursorRow++;
        updatePreview();
    }

    /**
     * Move the cursor left in the pattern grid.
     */
    //% block="move cursor left"
    export function moveCursorLeft(): void {
        if (cursorCol > 0) cursorCol--;
        updatePreview();
    }

    /**
     * Move the cursor right in the pattern grid.
     */
    //% block="move cursor right"
    export function moveCursorRight(): void {
        if (cursorCol < 15) cursorCol++;
        updatePreview();
    }

    /**
     * Toggle the LED at the current cursor position (on/off).
     */
    //% block="toggle LED at cursor"
    export function toggleLedAtCursor(): void {
        let currentRow = currentPattern[cursorRow];
        currentPattern[cursorRow] = currentRow.substr(0, cursorCol) + 
            (currentRow[cursorCol] === "." ? "*" : ".") + 
            currentRow.substr(cursorCol + 1);
        updatePreview();
    }

    /**
     * Display the current pattern on the LED matrix.
     */
    //% block="display current pattern"
    export function displayCurrentPattern(): void {
        let pattern = createPatternFromString(currentPattern.join("\n"));
        displayStaticPattern(pattern);
    }

    // Helper function to convert string grid to byte array
    function createPatternFromString(patternStr: string): number[] {
        let pattern: number[] = [];
        let rows = patternStr.trim().split("\n");
        if (rows.length !== 8) {
            serial.writeLine("Pattern must have exactly 8 rows.");
            return [];
        }
        for (let col = 0; col < 16; col++) {
            let byte = 0;
            for (let row = 0; row < 8; row++) {
                let line = rows[row].trim();
                if (line.length !== 16) {
                    serial.writeLine("Each row must have exactly 16 characters.");
                    return [];
                }
                if (line[col] === "*") {
                    byte |= (1 << row); // Set the bit for this row if "*"
                }
            }
            pattern.push(byte);
        }
        return pattern;
    }

    // Helper function to update a preview on the micro:bit's 5x5 LED grid
    function updatePreview(): void {
        // Convert the current 8x16 pattern to a 5x5 preview (simplified)
        let preview: boolean[][] = Array(5).fill(null).map(() => Array(5).fill(false));
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                let matrixRow = row * 2; // Scale down 8 rows to 5
                let matrixCol = col * 3; // Scale down 16 columns to 5
                if (matrixRow < 8 && matrixCol < 16) {
                    preview[row][col] = currentPattern[matrixRow][matrixCol] === "*";
                }
            }
        }
        // Display on micro:bit LED (simplified, shows cursor position as well)
        basic.clearScreen();
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (preview[row][col]) {
                    led.plot(col, row);
                }
            }
        }
        // Show cursor position (e.g., as a brighter or different color if possible)
        led.plotBrightness(cursorCol % 5, cursorRow % 5, 255);
    }

    // Initial setup for pattern editor
    basic.forever(function () {
        // Use buttons and gestures for navigation (optional, for interactivity)
        input.onButtonPressed(Button.A, moveCursorLeft);
        input.onButtonPressed(Button.B, moveCursorRight);
        input.onButtonPressed(Button.AB, toggleLedAtCursor);
        input.onGesture(Gesture.Shake, moveCursorUp);
        input.onGesture(Gesture.TiltLeft, moveCursorDown);
    });
}
