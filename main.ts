// main.ts for Me LED Matrix 8x16 MakeCode Extension

namespace ledMatrix {
    // Global variables for pin configuration
    let dinPin: DigitalPin;
    let sckPin: DigitalPin;

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

    // High-level functions exposed as blocks
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

    // **New Feature: Create Pattern from String Grid**
    /**
     * Create a custom pattern from a string grid (8 rows x 16 columns).
     * Use "*" for lit LEDs and "." for off.
     * @param patternStr A string with 8 lines, each containing 16 characters ("*" or ".").
     * @returns A 16-byte array representing the pattern.
     */
    //% block="create pattern from grid %patternStr"
    export function createPatternFromString(patternStr: string): number[] {
        let pattern: number[] = [];
        let rows = patternStr.trim().split("\n");
        
        // Check if we have exactly 8 rows
        if (rows.length !== 8) {
            serial.writeLine("Pattern must have exactly 8 rows.");
            return [];
        }

        // Process each column (16 total)
        for (let col = 0; col < 16; col++) {
            let byte = 0;
            for (let row = 0; row < 8; row++) {
                let line = rows[row].trim();
                // Check if each row has exactly 16 characters
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
}
