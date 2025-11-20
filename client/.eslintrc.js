module.exports = {
  root: true,
  extends: ["react-app", "react-app/jest"],
  rules: {
    // Temporarily relax noisy rules so the dev server runs without spamming warnings
    "no-unused-vars": "off",
    "react-hooks/exhaustive-deps": "off",
    "default-case": "off",
    "jsx-a11y/img-redundant-alt": "off"
  }
};
