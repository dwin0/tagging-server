var expect = require("chai").expect;
var rewire = require("rewire");
var velocityCommunication = rewire("../business_logic/v5.1/velocityCommunication");

describe("Tests the velocityCommunication", function() {
    describe("function checkPositions", function () {
        var checkPositions = velocityCommunication.__get__('checkPositions');

        it("should return true", function () {
            expect(checkPositions([ { time: "2017-03-28 07:31:44.0" } ])).to.equal(true);
        });

        it("should return false", function () {
            expect(checkPositions([ { time: "lu" } ])).to.equal(false);
        });

        it("mixed input should return false", function () {
            expect(checkPositions([ { time: "2017-03-28 07:31:44.0" }, { time: "lu" }])).to.equal(false);
        });
    });
});