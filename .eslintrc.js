module.exports = {
  "env": {
    "commonjs": true,
    "es6": true,
    "node": true
  },
  "extends": ["eslint:recommended"],
  "installedESLint": true,
  "parserOptions": {
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
    },
    "sourceType": "module"
  },
  "plugins": [],
  "rules": {
    "no-console": "off",
    "indent": [
      "error",
      2, {
        "SwitchCase": 0
      }
    ],
    "semi": "off"
  }
};
