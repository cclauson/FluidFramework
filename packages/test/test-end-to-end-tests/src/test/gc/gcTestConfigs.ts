/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { ITestContainerConfig, createTestConfigProvider } from "@fluidframework/test-utils";

/**
 * Default test container configs used by GC tests to create / load containers.
 */
export const defaultGCConfig: ITestContainerConfig = {
	runtimeOptions: {
		summaryOptions: {
			summaryConfigOverrides: { state: "disabled" },
		},
		gcOptions: { gcAllowed: true },
	},
	loaderProps: { configProvider: createTestConfigProvider() },
};
