export function register({ bluehawk }) {
  // Bluehawk 1.6.0 only includes a small built-in language set; these cover
  // common example-file extensions that otherwise warn or fail during snip/copy.
  bluehawk.addLanguage("mts", {
    languageId: "typescript",
    lineComments: [/\/\//],
    blockComments: [[/\/\*/, /\*\//]],
  });
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
  bluehawk.addLanguage("pug", {
    languageId: "pug",
    lineComments: [/\/\//],
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
  bluehawk.addLanguage(["md", "markdown"], {
    languageId: "markdown",
    blockComments: [[/<!--/, /-->/]],
  });
  bluehawk.addLanguage(["dockerfile", "containerfile"], {
    languageId: "dockerfile",
    lineComments: [/#/],
  });
  bluehawk.addLanguage("erb", {
    languageId: "erb",
    blockComments: [[/<%# BLUEHAWK/, /!BLUEHAWK %>/]],
  });
  // FreeMarker, for the default email and message templates under
  // extractedcode/templates-*. They carry no annotations, but bluehawk still
  // needs a language for the extension or `check` fails on them.
  bluehawk.addLanguage("ftl", {
    languageId: "ftl",
    blockComments: [[/<#--/, /-->/]],
  });
}
