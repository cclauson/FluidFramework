/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

const {
	ApiItemKind,
	ApiItemUtilities,
	createDocumentWriter,
	MarkdownRenderer,
	transformTsdocNode,
} = require("@fluid-tools/api-markdown-documenter");
const { EOL } = require("os");

const generatedContentNotice =
	"[//]: # (Do not edit this file. It is automatically generated by @fluidtools/api-markdown-documenter.)";

/**
 * Creates Hugo front-matter for the given API item.
 * This will be appended to the top of the generated API documents.
 *
 * @param {ApiItem} apiItem - The root API item of the document being rendered.
 * @param {@fluid-tools/api-markdown-documenter#MarkdownDocumenterConfiguration} config - See
 * {@link @fluid-tools/api-markdown-documenter#MarkdownDocumenterConfiguration}.
 * @param {@fluid-tools/api-markdown-documenter#MarkdownRenderers} - Custom renderers to use.
 * @param {string} version - Version label string.
 * Will be inserted as the `version` metadata in the generated document front-matter.
 *
 * @returns The JSON-formatted Hugo front-matter as a `string`.
 */
function createHugoFrontMatter(apiItem, config, customRenderers, version) {
	const associatedPackage = apiItem.getAssociatedPackage();
	const frontMatter = {
		title: createFrontMatterTitle(apiItem),
		version,
		kind: apiItem.kind,
		members: new Map(),
		package: associatedPackage?.name.replace(/"/g, "").replace(/!/g, ""),
		unscopedPackageName: associatedPackage
			? ApiItemUtilities.getUnscopedPackageName(associatedPackage)
			: undefined,
	};

	if (apiItem.tsdocComment) {
		frontMatter.summary = extractSummary(apiItem, config, customRenderers);
	}

	const apiMembers =
		apiItem.kind === ApiItemKind.Package ? apiItem.entryPoints[0].members : apiItem.members;

	apiMembers
		.filter(({ displayName }) => displayName !== "")
		.forEach((api) => {
			frontMatter.members[api.kind] = frontMatter.members[api.kind] ?? {};
			frontMatter.members[api.kind][api.displayName] = ApiItemUtilities.getLinkForApiItem(
				api,
				config,
			).target;
		});

	const hugoFrontMatter = JSON.stringify(frontMatter, undefined, 2).trim();
	return [hugoFrontMatter, generatedContentNotice].join(`${EOL}${EOL}`).trim();
}

const extractSummary = (apiItem, config, customRenderers) => {
	const summaryParagraph = transformTsdocNode(
		apiItem.tsdocComment.summarySection,
		apiItem,
		config,
	);

	if (!summaryParagraph) {
		return "";
	}

	const documentWriter = createDocumentWriter();
	MarkdownRenderer.renderNode(summaryParagraph, documentWriter, {
		customRenderers,
	});
	return documentWriter.getText().replace(/"/g, "'").trim();
};

const createFrontMatterTitle = (apiItem) => {
	const baseTitle = apiItem.displayName.replace(/"/g, "").replace(/!/g, "");
	const kindTitleMap = {
		[ApiItemKind.Model]: "Package Reference",
		[ApiItemKind.Class]: `${baseTitle} Class`,
		[ApiItemKind.Interface]: `${baseTitle} Interface`,
		[ApiItemKind.Package]: `${baseTitle} Package`,
		[ApiItemKind.Namespace]: `${baseTitle} Namespace`,
	};
	return kindTitleMap[apiItem.kind] ?? baseTitle;
};

module.exports = {
	createHugoFrontMatter,
};
