import { getDocsData } from "./docsData/getDocsData.ts";
import { getDocsMDX } from "./mdx/getDocsMDX.ts";

/**
 * Given an OpenAPI spec, generate Markdown chunks of the spec. The returned
 * object is a map of chunk filenames to chunk contents.
 */
export async function generateChunks(
  specContents: string,
  basePath: string
): Promise<Record<string, string>> {
  const docsData = await getDocsData(specContents);
  return getDocsMDX(docsData, basePath);
}
