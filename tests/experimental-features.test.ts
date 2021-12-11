import { expect } from "chai";

import {
    ExperimentalFeaturesConfig,
    ExperimentalFeaturesConfigFactory
} from "../src/experimental-features";

describe("ExperimentalFeaturesConfigFactory class", () => {
    it("empty config, sets experimental feature to false", () => {
        let featureConfig = ExperimentalFeaturesConfigFactory.createExperimentalFeaturesConfig();
        expect(featureConfig.useBarCodeDetectorIfSupported).to.be.false;
    });

    it("non empty config, delegates the right config", () => {
        let featureConfig = ExperimentalFeaturesConfigFactory.createExperimentalFeaturesConfig(
            { useBarCodeDetectorIfSupported: false });
        expect(featureConfig.useBarCodeDetectorIfSupported).to.be.false;

        featureConfig = ExperimentalFeaturesConfigFactory.createExperimentalFeaturesConfig(
            { useBarCodeDetectorIfSupported: true });
        expect(featureConfig.useBarCodeDetectorIfSupported).to.be.true;
    });
});
