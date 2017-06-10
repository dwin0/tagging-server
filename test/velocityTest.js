var expect = require("chai").expect;
var rewire = require("rewire");
var velocity = rewire("../business_logic/v5.1/velocity");

describe("Tests the velocity", function() {
    describe("function calcAverageVelocity", function () {
        var calcAverageVelocity = velocity.__get__('calcAverageVelocity');

        it("should return 0", function () {
            var input = [ { distanceMeters: 0, timeSeconds: 10 },
                          { distanceMeters: 0, timeSeconds: 11 } ];

            var expectedResult = {
                distanceMeters: 0,
                timeSeconds: 21,
                velocityMeterPerSecond: 0,
                velocityKilometersPerHour: 0
            };

            expect(calcAverageVelocity(input)).to.deep.equal(expectedResult);
        });

        it("correct input", function () {
            var input = [ { distanceMeters: 100, timeSeconds: 10 },
                { distanceMeters: 100, timeSeconds: 11 } ];

            var expectedResult = {
                distanceMeters: 200,
                timeSeconds: 21,
                velocityMeterPerSecond: 10,
                velocityKilometersPerHour: 34
            };

            expect(calcAverageVelocity(input)).to.deep.equal(expectedResult);
        });

        it("should return Infinity", function () {
            var input = [ { distanceMeters: 100, timeSeconds: 0 },
                { distanceMeters: 100, timeSeconds: 0 } ];

            var expectedResult = {
                distanceMeters: 200,
                timeSeconds: 0,
                velocityMeterPerSecond: Infinity,
                velocityKilometersPerHour: Infinity
            };

            expect(calcAverageVelocity(input)).to.deep.equal(expectedResult);
        });
    });
});