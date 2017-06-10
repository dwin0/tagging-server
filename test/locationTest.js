var expect = require("chai").expect;
var rewire = require("rewire");
var location = rewire("../business_logic/v5.1/location");

function getTestLocation(railway, street, building) {
    return {
        railway: {
            weight: railway,
            location: location.__get__('RAILWAY')
        },
        street: {
            weight: street,
            location: location.__get__('STREET')
        },
        building: {
            weight: building,
            location: location.__get__('BUILDING')
        }
    };
}

describe("Tests the location", function() {
    describe("function returnLocation", function () {
        var returnLocation = location.__get__('returnLocation');

        it("callback should return no error", function (done) {
            returnLocation(getTestLocation(0, 0, 0), function (err) {
                expect(err).to.equal(null);
                done();
            });
        });

        it("callback should return UNKNOWN", function (done) {
            returnLocation(getTestLocation(0, 0, 0), function (err, result) {
                expect(result.name).to.equal("unknown");
                done();
            });
        });

        it("callback should return BUILDING", function (done) {
            returnLocation(getTestLocation(0, 0, 1), function (err, result) {
                expect(result.name).to.equal("building");
                done();
            });
        });

        it("callback should return RAILWAY", function (done) {
            returnLocation(getTestLocation(1, 1, 1), function (err, result) {
                expect(result.name).to.equal("railway");
                done();
            });
        });

        it("callback should return STREET", function (done) {
            returnLocation(getTestLocation(0.999999, 1, 0.999999), function (err, result) {
                expect(result.name).to.equal("street");
                done();
            });
        });
    });

    describe("function getPositionWeight", function () {
        var getPositionWeight = location.__get__('getPositionWeight');
        
        it("one position", function () {
            var position = [ { horizontalAccuracy: 1000 } ];
            expect(getPositionWeight(position)[0]).to.equal(1);
        });

        it("two positions with same horizontalAccuracy", function () {
            var positions = [ { horizontalAccuracy: 100 }, { horizontalAccuracy: 100 } ];
            expect(getPositionWeight(positions)[0]).to.equal(0.5);
        });

        it("three positions with different horizontalAccuracy", function () {
            var positions = [ { horizontalAccuracy: 150 }, { horizontalAccuracy: 100 }, { horizontalAccuracy: 50 } ];
            expect(getPositionWeight(positions)[0]).to.be.closeTo(0.18, 0.01);
            expect(getPositionWeight(positions)[1]).to.be.closeTo(0.27, 0.01);
            expect(getPositionWeight(positions)[2]).to.be.closeTo(0.54, 0.01);
        });

        it("two positions, showing the proportional relationship", function () {
            var positions = [ { horizontalAccuracy: 80 }, { horizontalAccuracy: 800 } ];
            expect(getPositionWeight(positions)[0]).to.be.closeTo(10*getPositionWeight(positions)[1], 0.01);
        });
    });

    describe("function getRailwayWeight", function () {
        var getRailwayWeight = location.__get__('getRailwayWeight');

        it("input without railway", function () {
            var positions = [ { horizontalAccuracy: 100 }, { horizontalAccuracy: 100 }, { horizontalAccuracy: 100 } ];
            var nearestRailways = [ [], [], [] ];
            expect(getRailwayWeight(getTestLocation(0,0,0), positions, nearestRailways).railway.weight).to.equal(0);
        });

        it("input with only railway", function () {
            var positions = [ { horizontalAccuracy: 150 }, { horizontalAccuracy: 100 }, { horizontalAccuracy: 50 } ];
            var nearestRailways = [ [ { osm_id: '1' } ], [ { osm_id: '2' } ], [ { osm_id: '3' } ] ];
            expect(getRailwayWeight(getTestLocation(0,0,0), positions, nearestRailways).railway.weight).to.equal(1);
        });

        it("input with mixed railway and something else", function () {
            var positions = [ { horizontalAccuracy: 100 }, { horizontalAccuracy: 100 } ];
            var nearestRailways = [ [ { osm_id: '1' } ], [] ];
            expect(getRailwayWeight(getTestLocation(0,0,0), positions, nearestRailways).railway.weight).to.equal(0.5);
        });
    });

    describe("function getBuildingWeight", function () {
        var getBuildingWeight = location.__get__('getBuildingWeight');

        it("input without building", function () {
            var positions = [ { horizontalAccuracy: 100 }, { horizontalAccuracy: 100 }, { horizontalAccuracy: 100 } ];
            var nearestBuildings = [ [], [], [] ];
            expect(getBuildingWeight(getTestLocation(0,0,0), positions, nearestBuildings).building.weight).to.equal(0);
        });

        it("input with only building", function () {
            var positions = [ { horizontalAccuracy: 100 }, { horizontalAccuracy: 100 }, { horizontalAccuracy: 100 } ];
            var nearestBuildings = [ [ { osm_id: '1' } ], [ { osm_id: '2' } ], [ { osm_id: '3' } ] ];
            expect(getBuildingWeight(getTestLocation(0,0,0), positions, nearestBuildings).building.weight).to.equal(1);
        });

        it("input with mixed building and something else", function () {
            var positions = [ { horizontalAccuracy: 100 }, { horizontalAccuracy: 100 } ];
            var nearestRailways = [ [ { osm_id: '1' } ], [] ];
            expect(getBuildingWeight(getTestLocation(0,0,0), positions, nearestRailways).building.weight).to.equal(0.5);
        });

        it("special case horizontalAccuracy between 20 and 30 meters and all locations with same weight", function () {
            var positions = [ { horizontalAccuracy: 25 }, { horizontalAccuracy: 25 }, { horizontalAccuracy: 25 } ];
            var nearestBuildings = [ [ { osm_id: '1' } ], [ { osm_id: '2' } ], [ { osm_id: '3' } ] ];
            expect(getBuildingWeight(getTestLocation(1,1,0), positions, nearestBuildings).building.weight).to.equal(1);
            expect(getBuildingWeight(getTestLocation(1,1,0), positions, nearestBuildings).railway.weight).to.equal(0.9);
            expect(getBuildingWeight(getTestLocation(1,1,0), positions, nearestBuildings).street.weight).to.equal(0.9);
        });
    });

    describe("function getStreetAndRailwayWeight", function () {
        var getStreetAndRailwayWeight = location.__get__('getStreetAndRailwayWeight');

        it("input without street and railway", function () {
            var positions = [ { horizontalAccuracy: 25 }, { horizontalAccuracy: 25 }, { horizontalAccuracy: 25 } ];
            var nearestWays = [ [], [], [] ];
            expect(getStreetAndRailwayWeight(getTestLocation(0,0,0), positions, nearestWays).street.weight).to.equal(0);
            expect(getStreetAndRailwayWeight(getTestLocation(0,0,0), positions, nearestWays).railway.weight).to.equal(0);
        });

        it("input with only street", function () {
            var positions = [ { horizontalAccuracy: 25 }, { horizontalAccuracy: 25 }, { horizontalAccuracy: 25 } ];
            var nearestWays = [ [ { highway: 'la', railway: null } ], [ { highway: 'la', railway: null } ], [ { highway: 'la', railway: null } ] ];
            expect(getStreetAndRailwayWeight(getTestLocation(0,0,0), positions, nearestWays).street.weight).to.equal(1);
            expect(getStreetAndRailwayWeight(getTestLocation(0,0,0), positions, nearestWays).railway.weight).to.equal(0);
        });

        it("input with only railway", function () {
            var positions = [ { horizontalAccuracy: 25 }, { horizontalAccuracy: 25 }, { horizontalAccuracy: 25 } ];
            var nearestWays = [ [ { highway: null, railway: 'lu' } ], [ { highway: null, railway: 'lu' } ], [ { highway: null, railway: 'lu' } ] ];
            expect(getStreetAndRailwayWeight(getTestLocation(0,0,0), positions, nearestWays).railway.weight).to.equal(1);
            expect(getStreetAndRailwayWeight(getTestLocation(0,0,0), positions, nearestWays).street.weight).to.equal(0);
        });

        it("input with mixed street and railway", function () {
            var positions = [ { horizontalAccuracy: 100 }, { horizontalAccuracy: 100 }, { horizontalAccuracy: 100 } ];
            var nearestWays = [ [ { highway: 'li', railway: 'li' } ], [ { highway: null, railway: 'li' } ], [ { highway: 'li', railway: null } ] ];
            expect(getStreetAndRailwayWeight(getTestLocation(0,0,0), positions, nearestWays).railway.weight).to.be.closeTo(0.66, 0.01);
            expect(getStreetAndRailwayWeight(getTestLocation(0,0,0), positions, nearestWays).street.weight).to.be.closeTo(0.66, 0.01);
        });

        it("input with mixed street and 'no match for street or railway'", function () {
            var positions = [ { horizontalAccuracy: 100 }, { horizontalAccuracy: 100 }, { horizontalAccuracy: 100 } ];
            var nearestWays = [ [ { highway: 'li', railway: null } ], [ { highway: null, railway: null } ], [ { highway: 'li', railway: null } ] ];
            expect(getStreetAndRailwayWeight(getTestLocation(0,0,0), positions, nearestWays).street.weight).to.be.closeTo(0.66, 0.01);
            expect(getStreetAndRailwayWeight(getTestLocation(0,0,0), positions, nearestWays).railway.weight).to.equal(0);
        });
    });
});