# Comparing the outputs of rust gb emulator with ours

# Debugging with test ROM `03-op sp,hl.gb`

### Test no.: 1

#### Date: 2021-02-27

#### Author: David Möller

#### ROM: 03-op sp,hl.gb

#### Output format: PC,SP,opcode,A,Z,N,H,C

#### First failing line no.: 1034

#### Fixed: True

Expected output:

```
    0x20d,0xfffe,0xd,0xf5,false,false,false,true,
    0x20e,0xfffe,0x20,0xf5,false,true,true,true,
```

Got:

```
    0x20d,0xfffe,0xd,0xf5,false,false,false,true,
    0x20e,0xfffe,0x20,0xf5,false,true,false,true,
```

#### Initial reason for error

- Instruction `DEC C`, op-code `0x0D` did not execute the same
- Can be because of different values in C, or the `DEC C` instructions is wrong

#### Further debugging

- Print the C register

#### Actual reason for failure

- `DEC C` is incorrectly implemented
- The logic of setting the C flag is different between addition and subtraction, in addition you check if there is a carry from bit 3 to bit 4 while in subtraction, you check if there is a carry from bit 4 to bit 3

#### Minimal example of error

```
    C = 0x10
    DEC C
    C == 0x0f
    H == 1 //Assert false, actual value 0
```

### Test no.: 2

#### ROM: 03-op sp,hl.gb

#### Date: 2021-02-27

#### Author: David Möller

#### Output format: PC,SP,opcode,A,C,Z,N,H,C

#### First failing line no.: 16508

#### Fixed: Fixed by mocking

Expected output:

```
    0xc6d7,0xdff3,0xf0,0xff,0x1f,false,false,false,false,
    0xc6d9,0xdff3,0xfe,0x7e,0x1f,false,false,false,false,
```

Got:

```
    0xc6d7,0xdff3,0xf0,0xff,0x1f,false,false,false,false,
    0xc6d9,0xdff3,0xfe,0x0,0x1f,false,false,false,false,
```

#### Initial reason for error

- Instruction `LD A, (a8)`, op-code `0xF0`, did not load register `A` with the correct value.
- This may be due to the value of the specified location has been changed by the PPU
- It may also be that `LD A, (a8)` is implemented incorrectly, line 16508 is the first time it has been executed

#### Further debugging

- Print `M(PC+1)`

#### Actual reason for failure

- The CPU expected the PPU to write to the display and change the memory, since the testing setup does not have a PPU, the memory never changed.

### Test no.: 3

#### ROM: 03-op sp,hl.gb

#### Date: 2021-02-28

#### Author: David Möller

#### Output format: PC,SP,OP,A,BC,DE,HL,F,

#### First failing line no.: 17539

#### Fixed: True

Expected output:

```
    PC:0xc6d9,SP:0xdff3,OP:0xfe,A:0x90,BC:0xfbb2,DE:0xd000,HL:0xcb23,F:0b0000,
    PC:0xc6db,SP:0xdff3,OP:0x20,A:0x90,BC:0xfbb2,DE:0xd000,HL:0xcb23,F:0b1100,
```

Got:

```
    PC:0xc6d9,SP:0xdff3,OP:0xfe,A:0x90,BC:0xfbb2,DE:0xd000,HL:0xcb23,F:0b0000,
    PC:0xc6db,SP:0xdff3,OP:0x20,A:0x90,BC:0xfbb2,DE:0xd000,HL:0xcb23,F:0b1101,
```

#### Initial reason for error

- Instruction `CP d8`, op-code `0xFE`, is not expected to set the `C` flag when comparing `0x90` with `0x90`
- The `C` flag should perhaps be inverted when using subtraction

#### Further debugging

- Check documentation of C flag

#### Actual reason for failure

- The carry should be inverted when executing subtraction

### Test no.: 4

#### ROM: 03-op sp,hl.gb

#### Date: 2021-02-28

#### Author: David Möller

#### Output format: PC,SP,OP,A,BC,DE,HL,F,

#### First failing line no.: 17539

#### Fixed: True

Got:

```
    PC:0xc6e2,SP:0xdffb,OP:0xfa,A:0xff,BC:0x1100,DE:0xd000,HL:0xcb23,F:0b1101,
    Tried to write to ROM at address: ff
```

#### Initial reason for error

- Instruction `LD A, (a16)`, op-code `0xFA`, tries to write to location `0xFF` which is ROM
- The instruction may be incorrectly implemented in `execute_instruction()`

#### Further debugging

- Check the code

#### Actual reason for failure

- In `execute_instruction()`, the value `a16` was written to address `A`

### Test no.: 5

#### ROM: 03-op sp,hl.gb

#### Date: 2021-02-28

#### Author: David Möller

#### Output format: PC,SP,OP,A,BC,DE,HL,F,

#### First failing line no.: 17536 + 12

#### Fixed: True

Expected output:

```
    PC:0xc6e7,SP:0xdffb,OP:0xc4,A:0x10,BC:0x1100,DE:0xd000,HL:0xcb23,F:0b0010,
    PC:0xc721,SP:0xdff9,OP:0x3e,A:0x10,BC:0x1100,DE:0xd000,HL:0xcb23,F:0b0010,
```

Got:

```
    PC:0xc6e7,SP:0xdffb,OP:0xc4,A:0x10,BC:0x1100,DE:0xd000,HL:0xcb23,F:0b0010,
    PC:0xc723,SP:0xdff9,OP:0xe0,A:0x10,BC:0x1100,DE:0xd000,HL:0xcb23,F:0b0010,
```

#### Initial reason for error

- Instruction `CALL NZ, a16`, op-code `0xC4`, calls a subroutine but jumps to the wrong location
- The instruction argument may be different
- The instruction itself could be incorrect

#### Further debugging

- Check the code
- Print the the instruction argument

#### Actual reason for failure

- PC was incremented after being pushed to the stack
  - The problem has been fixed for all similar bugs

### Test no.: 6

#### ROM: 03-op sp,hl.gb

#### Date: 2021-02-28

#### Author: David Möller

#### Output format: PC,SP,OP,A,BC,DE,HL,F,

#### First failing line no.: 44620

#### Fixed: True

Expected output:

```
    PC:0xc06b,SP:0xdfe9,OP:0xcb,OP+1:0x38,A:0xcf,BC:0xffff,DE:0xff0c,HL:0x880,F:0b0000,
    PC:0xc06d,SP:0xdfe9,OP:0xcb,OP+1:0x19,A:0xcf,BC:0x7fff,DE:0xff0c,HL:0x880,F:0b0001,
```

Got:

```
    PC:0xc06b,SP:0xdfe9,OP:0xcb,OP+1:0x38,A:0xcf,BC:0xffff,DE:0xff0c,HL:0x880,F:0b0000,
    PC:0xc06d,SP:0xdfe9,OP:0xcb,OP+1:0x19,A:0xcf,BC:0xffff,DE:0xff0c,HL:0x880,F:0b0000,
```

#### Initial reason for error

- Instruction `SRL B`, op-code `0xBC38`, did not execute at all

#### Further debugging

- Check the code

#### Actual reason for failure

- The op-code `0xBC38` had not been implemented

## Error no.: 7

#### Date: 2021-03-01

#### Line: 58545

#### Fixed: True

Expected:

```
    PC:0xc7fe,SP:0xdfe9,OP:0x29,OP+1:0x11,A:0x0,BC:0xff,DE:0xcb0c,HL:0x4c00,F:0b1000,
    PC:0xc7ff,SP:0xdfe9,OP:0x11,OP+1:0x1b,A:0x0,BC:0xff,DE:0xcb0c,HL:0x9800,F:0b1010,
```

Got:

```
    PC:0xc7fe,SP:0xdfe9,OP:0x29,OP+1:0x11,A:0x0,BC:0xff,DE:0xcb0c,HL:0x4c00,F:0b1000,
    PC:0xc7ff,SP:0xdfe9,OP:0x11,OP+1:0x1b,A:0x0,BC:0xff,DE:0xcb0c,HL:0x9800,F:0b1000,
```

#### Description of failure

- Instruction `ADD HL, HL`, op-code `0x29`, did not set the `H` flag

#### Actual reason

- When performing addition with 16bit values, the H flag is set on half carry for the higher bytes, not with a carry between the bytes

## Error no.: 8

#### Date: 2021-03-01

#### Line: 311533

#### Fixed: True

Expected:

```
    PC:0xc2d6,SP:0xdff3,OP:0xfe,OP+1:0x0,A:0x0,BC:0xf0,DE:0xff84,HL:0xc6b1,F:0b1100,
    PC:0xc2d8,SP:0xdff3,OP:0xe1,OP+1:0xd1,A:0x0,BC:0xf0,DE:0xff84,HL:0xc6b1,F:0b1100,
```

Got:

```
    PC:0xc2d6,SP:0xdff3,OP:0xfe,OP+1:0x0,A:0x0,BC:0xf0,DE:0xff84,HL:0xc6b1,F:0b1100,
    PC:0xc2d8,SP:0xdff3,OP:0xe1,OP+1:0xd1,A:0x0,BC:0xf0,DE:0xff84,HL:0xc6b1,F:0b1101,
```

#### Description of failure

- Instruction `CP d8`, op-code `0xFE`, sets the C flag when comparing 0 with 0

#### Actual reason

- The twosComp function calculates the two complement for a 16-bit number, not 8-bit. The overflow was therefore not detected

## Error no.: 9

#### Date: 2021-03-01

#### Line: 642645

#### Fixed: True

Expected:

```
    PC:0xdef9,SP:0xf,OP:0xe8,OP+1:0x1,A:0x12,BC:0x5691,DE:0x9abc,HL:0x0,F:0b0000,
    PC:0xdefb,SP:0x10,OP:0x0,OP+1:0xc3,A:0x12,BC:0x5691,DE:0x9abc,HL:0x0,F:0b0010,
```

Got:

```
    PC:0xdef9,SP:0xf,OP:0xe8,OP+1:0x1,A:0x12,BC:0x5691,DE:0x9abc,HL:0x0,F:0b0000,
    PC:0xdefb,SP:0x10,OP:0x0,OP+1:0xc3,A:0x12,BC:0x5691,DE:0x9abc,HL:0x0,F:0b0000,
```

#### Description of failure

- Instruction `ADD HL,s8`, op-code `0xE8`, did not set the H flag

#### Actual reason

- The C and H flag is set from the lower byte, instad of the higher byte in. This is the oposite done for `ADD HL, REG`

# Debugging with test ROM `04-op r,imm.gb`

## Error no.: 10

#### Date: 2021-03-02

#### Line: 1092494

#### Fixed: False

Expected:

```
    PC:0xdef9,SP:0xdff1,OP:0xde,OP+1:0xff,A:0x0,BC:0x1234,DE:0x5678,HL:0xdef4,F:0b0001,
    PC:0xdefb,SP:0xdff1,OP:0x0,OP+1:0xc3,A:0x0,BC:0x1234,DE:0x5678,HL:0xdef4,F:0b1111,
```

Got:

```
    PC:0xdef9,SP:0xdff1,OP:0xde,OP+1:0xff,A:0x0,BC:0x1234,DE:0x5678,HL:0xdef4,F:0b0001,
    PC:0xdefb,SP:0xdff1,OP:0x0,OP+1:0xc3,A:0x0,BC:0x1234,DE:0x5678,HL:0xdef4,F:0b1110,
```

#### Description of failure

- Instruction `SBC A, d8`, op-code `0xDE`, did not set the C flag

#### Actual reason

-
