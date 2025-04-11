declare module 'otp-generator' {
  interface Options {
    digits?: boolean;
    alphabets?: boolean;
    upperCase?: boolean;
    specialChars?: boolean;
    length?: number;
  }

  function generate(length: number, options?: Options): string;
  export default { generate };
} 