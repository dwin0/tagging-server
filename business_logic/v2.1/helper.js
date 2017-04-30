function getDbStatements(statement, positions) {

    //TODO: Prepared Statements
    //TODO: foreach for variable amount of statements
    var statement1 = statement.replaceAll("{lon}", positions[0].longitude).replaceAll("{lat}", positions[0].latitude);
    var statement2 = statement.replaceAll("{lon}", positions[1].longitude).replaceAll("{lat}", positions[1].latitude);
    var statement3 = statement.replaceAll("{lon}", positions[2].longitude).replaceAll("{lat}", positions[2].latitude);

    return [statement1, statement2, statement3];
}

module.exports = { "getDBStatements": getDbStatements };