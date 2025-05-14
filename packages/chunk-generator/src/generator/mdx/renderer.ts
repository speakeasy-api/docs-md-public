export class Renderer {
  #lines: string[] = [];

  public appendHeading(level: number, text: string) {
    this.#lines.push(`#`.repeat(level) + " " + text);
  }

  public appendParagraph(text: string) {
    this.#lines.push(text);
  }

  public appendList(items: string[]) {
    this.#lines.push(items.map((item) => "- " + item).join("\n"));
  }

  public beginExpandableSection(
    title: string,
    { isOpenOnLoad = false }: { isOpenOnLoad?: boolean }
  ) {
    this.#lines.push(`<details ${isOpenOnLoad ? "open" : ""}>`);
    this.#lines.push(`<summary>${title}</summary>`);
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
