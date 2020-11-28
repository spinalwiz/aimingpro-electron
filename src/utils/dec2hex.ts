export const dec2hexString = (dec : number) => {
    return (dec+0x10000).toString(16).substr(-4).toUpperCase();
}