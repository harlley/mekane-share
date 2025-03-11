module.exports = {
  root: true,
  extends: ["eslint-config-custom/typescript"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
};
