export function register({ bluehawk }) {
  bluehawk.addLanguage(["yml"], {
    languageId: "yaml",
    lineComments: [/#/],
  });
  bluehawk.addLanguage("css", {
    languageId: "css",
    blockComments: [[/\/\*/, /\*\//]],
  });
  bluehawk.addLanguage(["bash", "zsh"], {
    languageId: "shell",
    lineComments: [/#/],
  });
  bluehawk.addLanguage(["ini", "cfg", "conf", "env"], {
    languageId: "ini",
    lineComments: [/#/],
  });
  bluehawk.addLanguage("toml", {
    languageId: "toml",
    lineComments: [/#/],
  });
  bluehawk.addLanguage("sql", {
    languageId: "sql",
    lineComments: [/--/],
    blockComments: [[/\/\*/, /\*\//]],
  });
  bluehawk.addLanguage(["graphql", "gql"], {
    languageId: "graphql",
    lineComments: [/#/],
  });
  bluehawk.addLanguage("properties", {
    languageId: "properties",
    lineComments: [/#/],
  });
  bluehawk.addLanguage(["dockerfile", "containerfile"], {
    languageId: "dockerfile",
    lineComments: [/#/],
  });
}
