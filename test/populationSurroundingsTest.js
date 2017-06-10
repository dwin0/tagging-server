var expect = require("chai").expect;
var rewire = require("rewire");
var populationSurroundings = rewire("../business_logic/v5.1/populationSurroundings");

describe("Tests the populationSurroundings", function() {
    describe("function getPopulationDensity", function () {
        var getPopulationDensity = populationSurroundings.__get__('getPopulationDensity');

        it("no population density result", function () {
            expect(getPopulationDensity({ results: [] })).to.equal(0);
        });

        it("with population density result", function () {
            var geoAdminResult = { results: [
                { properties: { popt_ha: 3 } },
                { properties: { popt_ha: 6 } },
                { properties: { popt_ha: 3 } } ] };

            expect(getPopulationDensity(geoAdminResult)).to.equal(4);
        });
    });
    
    describe("function getTypeTag", function () {
        var getTypeTag = populationSurroundings.__get__('getTypeTag');

        it("should return UNKNOWN", function () {
            expect(getTypeTag('10').type).to.equal('unknown');
        });

        it("should return LARGE_CENTRE", function () {
            expect(getTypeTag('1').type).to.equal('Grosszentrum');
        });
    });

    describe("function getCommunityTypeJSON", function () {
        var getCommunityTypeJSON = populationSurroundings.__get__('getCommunityTypeJSON');

        it("should return UNKNOWN", function () {
            var expectedResult = {
                id: -1,
                type: 'unknown',
                description: 'No tagging possible.',
                communityId: -1,
                communityName: 'unknown',
                cantonId: -1,
                cantonName: 'unknown'
            };

            expect(getCommunityTypeJSON( { results: [] } )).to.deep.equal(expectedResult);
        });

        it("with correct input", function () {
            var input = { results: [
                {
                    featureId: 685,
                    layerBodId: "ch.are.gemeindetypen",
                    layerName: "Gemeindetypologie ARE",
                    id: 685,
                    properties: {
                        "kt_no": "8",
                        "typ_code": "6",
                        "label": "Glarus",
                        "typ_bez_d": "Kleinzentren",
                        "name_": "Glarus",
                        "flaeche_ha": 10367,
                        "typ_bez_f": "Petits centres",
                        "bfs_no": "1632",
                        "kt_kz": "GL"
                    }
                }
            ]};

            var expectedResult = {
                id: 6,
                type: 'Kleinzentrum',
                description: 'Tag comes from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)',
                communityId: '1632',
                communityName: 'Glarus',
                cantonId: '8',
                cantonName: 'GL'
            };

            expect(getCommunityTypeJSON(input)).to.deep.equal(expectedResult);
        });

    });
});