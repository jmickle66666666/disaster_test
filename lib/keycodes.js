var codes = [
    "up",
    "down",
    "left",
    "right",

    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",

    "key0",
    "key1",
    "key2",
    "key3",
    "key4",
    "key5",
    "key6",
    "key7",
    "key8",
    "key9",

    "f1",
    "f2",
    "f3",
    "f4",
    "f5",
    "f6",
    "f7",
    "f8",
    "f9",
    "f10",
    "f11",
    "f12",

    "escape",
    "return",
    "backspace",
    "tab",
    "space",
    "leftbracket",
    "rightbracket",

    "printscreen",
    "scrollock",
    "pause",
    "insert",
    "home",
    "pageup",
    "delete",
    "end",
    "pagedown",
];

for (var i = 0; i < codes.length; i++)
{
    this[codes[i]] = i;
}