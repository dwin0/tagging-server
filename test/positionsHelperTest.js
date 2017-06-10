var expect = require("chai").expect;
var rewire = require("rewire");
var positionsHelper = rewire("../business_logic/v5.1/positionsHelper");

describe("Tests the positionsHelper", function() {
    describe("function filterValidPositions", function () {
        var filterValidPositions = positionsHelper.__get__('filterValidPositions');

        it("lon or lat 0", function () {
            var input = [ { latitude: 0, longitude: 0, time: "2017-03-28 07:31:44.0" } ];
            expect(filterValidPositions(input)).to.equal(undefined);
        });

        it("invalid Date", function () {
            var input = [ { latitude: 8.123, longitude: 47.987, time: "lalala" } ];
            expect(filterValidPositions(input)).to.equal(undefined);
        });

        it("correct input", function () {
            var input = [ { latitude: 8.123, longitude: 47.987, time: "2017-03-28 07:31:44.0" },
                          { latitude: 8.978, longitude: 47.123, time: "2017-03-28 07:31:50.0" } ];
            expect(filterValidPositions(input)).to.deep.equal(input);
        });

        it("mixed input correct and wrong, should only return correct ones", function () {
            var input = [ { latitude: 8.123, longitude: 47.987, time: "2017-03-28 07:31:44.0" },
                          { latitude: 8.978, longitude: 47.123, time: "jowejfo" },
                          { latitude: 0, longitude: 47.123, time: "jowejfo" }];
            var expectedResult = [ { latitude: 8.123, longitude: 47.987, time: "2017-03-28 07:31:44.0" } ];
            expect(filterValidPositions(input)).to.deep.equal(expectedResult);
        });
    });

    describe("function checkValidHorizontalAccuracy", function () {
        var checkValidHorizontalAccuracy = positionsHelper.__get__('checkValidHorizontalAccuracy');

        it("should return true, all horizontalAccuracy below 200", function () {
            var input = [ { horizontalAccuracy: 1 }, { horizontalAccuracy: 1 } ];
            expect(checkValidHorizontalAccuracy(input)).to.equal(true);
        });

        it("should return true, one horizontalAccuracy below 200", function () {
            var input = [ { horizontalAccuracy: 1 }, { horizontalAccuracy: 1000 } ];
            expect(checkValidHorizontalAccuracy(input)).to.equal(true);
        });

        it("should return false, all horizontalAccuracy above 200", function () {
            var input = [ { horizontalAccuracy: 1000 }, { horizontalAccuracy: 1000 } ];
            expect(checkValidHorizontalAccuracy(input)).to.equal(false);
        });
    });

    describe("function findMoreAccurate", function () {
        var findMoreAccurate = positionsHelper.__get__('findMoreAccurate');

        it("two different horizontalAccuracy", function () {
            expect(findMoreAccurate({ horizontalAccuracy: 100 }, { horizontalAccuracy: 200 }).horizontalAccuracy).to.equal(100);
        });

        it("same horizontalAccuracy", function () {
            expect(findMoreAccurate({ horizontalAccuracy: 100 }, { horizontalAccuracy: 100 }).horizontalAccuracy).to.equal(100);
        });
    });

    describe("function chooseBeforeDownload", function () {
        var chooseBeforeDownload = positionsHelper.__get__('chooseBeforeDownload');

        it("one input position", function () {
            var input = [ { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.0" } ];
            var expectedResult = { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.0" };
            expect(chooseBeforeDownload(input)).to.deep.equal(expectedResult);
        });

        it("input with more than 100 milliseconds difference", function () {
            var input = [ { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.0" },
                          { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:32:44.0" } ];
            var expectedResult = { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:32:44.0" };
            expect(chooseBeforeDownload(input)).to.deep.equal(expectedResult);
        });

        it("two input positions with same horizontalAccuracy", function () {
            var input = [ { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.0" },
                          { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.1" } ];
            var expectedResult = { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.1" };
            expect(chooseBeforeDownload(input)).to.deep.equal(expectedResult);
        });

        it("two input positions with different horizontalAccuracy", function () {
            var input = [ { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.0" },
                          { latitude: 0, longitude: 0, horizontalAccuracy: 200, time: "2017-03-28 07:31:44.1" } ];
            var expectedResult = { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.0" };
            expect(chooseBeforeDownload(input)).to.deep.equal(expectedResult);
        });
    });

    describe("function chooseBeforeUpload", function () {
        var chooseBeforeUpload = positionsHelper.__get__('chooseBeforeUpload');

        it("one input position", function () {
            var input = [ { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.0" } ];
            var expectedResult = { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.0" };
            expect(chooseBeforeUpload(input)).to.deep.equal(expectedResult);
        });

        it("two input positions with same horizontalAccuracy", function () {
            var input = [ { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.0" },
                          { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.1" } ];
            var expectedResult = { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.0" };
            expect(chooseBeforeUpload(input)).to.deep.equal(expectedResult);
        });

        it("two input positions with different horizontalAccuracy", function () {
            var input = [ { latitude: 0, longitude: 0, horizontalAccuracy: 200, time: "2017-03-28 07:31:44.0" },
                          { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.1" } ];
            var expectedResult = { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.1" };
            expect(chooseBeforeUpload(input)).to.deep.equal(expectedResult);
        });
    });

    describe("function chooseAfterUpload", function () {
        var chooseAfterUpload = positionsHelper.__get__('chooseAfterUpload');

        it("one input position", function () {
            var input = [ { latitude: 0, longitude: 0, time: "2017-03-28 07:31:44.0" } ];
            var expectedResult = { latitude: 0, longitude: 0, time: "2017-03-28 07:31:44.0" };
            expect(chooseAfterUpload(input)).to.deep.equal(expectedResult);
        });

        it("input with more than 100 milliseconds difference", function () {
            var input = [ { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.0" },
                          { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:32:44.0" } ];
            var expectedResult = { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.0" };
            expect(chooseAfterUpload(input)).to.deep.equal(expectedResult);
        });

        it("two input positions with same horizontalAccuracy", function () {
            var input = [ { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.0" },
                          { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.1" } ];
            var expectedResult = { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.0" };
            expect(chooseAfterUpload(input)).to.deep.equal(expectedResult);
        });

        it("two input positions with different horizontalAccuracy", function () {
            var input = [ { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.0" },
                          { latitude: 0, longitude: 0, horizontalAccuracy: 200, time: "2017-03-28 07:31:44.1" } ];
            var expectedResult = { latitude: 0, longitude: 0, horizontalAccuracy: 100, time: "2017-03-28 07:31:44.0" };
            expect(chooseAfterUpload(input)).to.deep.equal(expectedResult);
        });
    });
});