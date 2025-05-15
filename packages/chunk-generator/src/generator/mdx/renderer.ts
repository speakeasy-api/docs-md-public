type AppendOptions = {
  // We almost always want to escape special Markdown characters, so we default
  // to true. However, sometimes content coming in is actually in Markdown, so
  // we want to preserve this Markdown formatting by setting this to false
  escape?: boolean;
};

export class Renderer {
  #lines: string[] = [];

  public escapeText(text: string) {
    return text
      .replace("\\", "\\\\")
      .replace("`", "\\`")
      .replace("*", "\\*")
      .replace("_", "\\_")
      .replace("{", "\\{")
      .replace("}", "\\}")
      .replace("[", "\\[")
      .replace("]", "\\]")
      .replace("<", "\\<")
      .replace(">", "\\>")
      .replace("(", "\\(")
      .replace(")", "\\)")
      .replace("#", "\\#")
      .replace("+", "\\+")
      .replace("-", "\\-")
      .replace(".", "\\.")
      .replace("!", "\\!")
      .replace("|", "\\|");
  }

  public insertFrontMatter({
    sidebarPosition,
    sidebarLabel,
  }: {
    sidebarPosition: number;
    sidebarLabel: string;
  }) {
    this.#lines.unshift(
      `---
sidebar_position: ${sidebarPosition}
sidebar_label: ${this.escapeText(sidebarLabel)}
---`
    );
  }

  public appendHeading(
    level: number,
    text: string,
    { escape = true }: AppendOptions = {}
  ) {
    this.#lines.push(
      `#`.repeat(level) + " " + (escape ? this.escapeText(text) : text)
    );
  }

  public appendParagraph(text: string, { escape = true }: AppendOptions = {}) {
    this.#lines.push(escape ? this.escapeText(text) : text);
  }

  public appendList(items: string[], { escape = true }: AppendOptions = {}) {
    this.#lines.push(
      items
        .map((item) => "- " + (escape ? this.escapeText(item) : item))
        .join("\n")
    );
  }

  public beginExpandableSection(
    title: string,
    {
      isOpenOnLoad = false,
      escape = true,
    }: { isOpenOnLoad?: boolean } & AppendOptions
  ) {
    this.#lines.push(`<details ${isOpenOnLoad ? "open" : ""}>`);
    this.#lines.push(
      `<summary>${escape ? this.escapeText(title) : title}</summary>`
    );
  }

  public endExpandableSection() {
    this.#lines.push("</details>");
  }

  public render() {
    const data = this.#lines.join("\n\n");
    this.#lines = [];
    return data;
  }
}
