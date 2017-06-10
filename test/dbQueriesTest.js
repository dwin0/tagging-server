var expect = require("chai").expect;
var dbQueries = require("../business_logic/v5.1/dbQueries");

describe("Tests the dbQueries", function() {
    describe("function makePoints", function() {
        it("one point as input", function() {
            var inputPosition = [{longitude: 8.123, latitude: 47.987}];
            var resultingPointString = dbQueries.makePoints(inputPosition)[0];

            expect(resultingPointString).to.equal("POINT(8.123 47.987)");
        });

        it("two points as input", function() {
            var inputPositions = [{longitude: 8.123, latitude: 47.987}, {longitude: 8.987, latitude: 47.123}];
            var resultingPointsArray = dbQueries.makePoints(inputPositions);

            expect(resultingPointsArray).to.deep.equal(["POINT(8.123 47.987)", "POINT(8.987 47.123)"]);
        });
    });

    describe("function makeMultipoints", function() {
        it("two points as input", function() {
            var inputPositions = [{longitude: 8.123, latitude: 47.987}, {longitude: 8.987, latitude: 47.123}];
            var resultingPointsArray = dbQueries.makeMultipoints(inputPositions);

            expect(resultingPointsArray).to.deep.equal(["MULTIPOINT (8.123 47.987, 8.987 47.123)"]);
        });

        it("three points as input", function() {
            var inputPositions = [{longitude: 8.1, latitude: 47.1}, {longitude: 8.5, latitude: 47.5}, {longitude: 8.9, latitude: 47.9}];
            var resultingPointsArray = dbQueries.makeMultipoints(inputPositions);

            expect(resultingPointsArray).to.deep.equal(["MULTIPOINT (8.1 47.1, 8.5 47.5)", "MULTIPOINT (8.5 47.5, 8.9 47.9)"]);
        });
    });
});