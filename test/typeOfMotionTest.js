var expect = require("chai").expect;
var typeOfMotion = require("../business_logic/v5.1/typeOfMotion");

describe("Tests the typeOfMotion", function() {
    describe("function getTypeOfMotion", function () {

        it("should return stationary", function () {
            expect(typeOfMotion.getTypeOfMotion(0).name).to.equal("stationary");
        });

        it("should return stationary", function () {
            expect(typeOfMotion.getTypeOfMotion(2.99999999).name).to.equal("stationary");
        });

        it("should return pedestrian", function () {
            expect(typeOfMotion.getTypeOfMotion(3).name).to.equal("pedestrian");
        });

        it("should return UNKNOWN", function () {
            expect(typeOfMotion.getTypeOfMotion(1233).name).to.equal("unknown");
        });

        it("should return UNKNOWN", function () {
            expect(typeOfMotion.getTypeOfMotion(-1).name).to.equal("unknown");
        });
    });
});