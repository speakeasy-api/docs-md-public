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

  public render() {
    const data = this.#lines.join("\n\n");
    this.#lines = [];
    return data;
  }
}
