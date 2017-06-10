var expect = require("chai").expect;
var rewire = require("rewire");
var geographicalSurroundings = rewire("../business_logic/v5.1/geographicalSurroundings");

describe("Tests the geographicalSurroundings", function() {
    describe("function prepareResult", function() {
        var prepareResult = geographicalSurroundings.__get__('prepareResult');

        it("should return UNKNOWN", function() {
            var expectedResult = {
                osmKey: 'unknown',
                osmValue: 'unknown',
                description: 'No tagging possible.'
            };

            expect(prepareResult({})).to.deep.equal(expectedResult);
        });

        it("with correct input", function () {
            var expectedResult = {
                osmKey: 'testKey',
                osmValue: 'testValue',
                description: 'Tag comes from: OpenStreetMap'
            };

            expect(prepareResult({ testKey: "testValue" })).to.deep.equal(expectedResult);
        });
    });
});