var expect = require("chai").expect;
var jsonHelper = require("../business_logic/v5.1/jsonHelper");

describe("Tests the jsonHelper", function() {
    describe("function renderTagJson", function() {
        it("correct input", function() {
            var locationRes = { id: 1, name: "test" };
            var typeOfMotionRes = { id: 4, name: "test" };
            var velocityRes = { distanceMeters: 900 };
            var geographicalSurroundingsRes = { download: { osmKey: "landuse" },
                                                  upload: { osmKey: "natural" } };
            var geoAdminRes = { download: { populationDensity: { number: 75 }, communityType: { id: 2 } },
                                  upload: { populationDensity: { number: 65 }, communityType: { id: 1 } } };
            var resultingJson = jsonHelper.renderTagJson(locationRes, typeOfMotionRes, velocityRes, geographicalSurroundingsRes, geoAdminRes);

            var expectedResult = {
                title: "Calculated Tagging",
                location: {
                    id: 1,
                    name: "test"
                },
                typeOfMotion: {
                    id: 4,
                    name: "test"
                },
                velocity: {
                    distanceMeters: 900
                },
                surroundings: {
                    download: {
                        populationDensity: {
                            number: 75
                        },
                        communityType: {
                            id: 2
                        },
                        geographicalSurroundings: {
                            osmKey: "landuse"
                        }
                    },
                    upload: {
                        populationDensity: {
                            number: 65
                        },
                        communityType: {
                            id: 1
                        },
                        geographicalSurroundings: {
                            osmKey: "natural"
                        }
                    }
                }
            };

            expect(resultingJson).to.deep.equal(expectedResult);
        });
    });
});