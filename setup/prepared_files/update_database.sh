#!/bin/bash

#Pfad für Datenbank-Files und node.js-Server
WORK_DIRECTORY=/home/server
DATABASE_NAME=switzerland
DATABASE_PASSWORD=password

#Das Style-File bestimmt welche OSM-Einträge in welche Tabelle geladen werden.
#https://github.com/gravitystorm/openstreetmap-carto
STYLE_FILE=$WORK_DIRECTORY/osm/openstreetmap-carto/openstreetmap-carto.style
WORKDIR_OSMOSIS=$WORK_DIRECTORY/updates/.osmosis
export PGPASSWORD=$DATABASE_PASSWORD

#Hole neuste OpenStreetMap diffs von https://planet.osm.ch/ und füge sie in changes.osc.gz zusammen.
#http://wiki.openstreetmap.org/wiki/HowTo_minutely_hstore#Acquire_Replication_Data
osmosis --read-replication-interval workingDirectory=$WORKDIR_OSMOSIS --simplify-change --write-xml-change changes.osc.gz

#Lade alle gefundenen diffs in die Datenbank.
#http://wiki.openstreetmap.org/wiki/HowTo_minutely_hstore#Import_Replication_Data_using_Osm2Pgsql
#http://www.volkerschatz.com/net/osm/osm2pgsql-usage.html
osm2pgsql --append -l --database $DATABASE_NAME --username performance --host localhost --slim --cache 500 --number-processes 1 --hstore --style $STYLE_FILE --exclude-invalid-polygon --multi-geometry changes.osc.gz

#Lösche diff-Datei
rm changes.osc.gz

#Erhöhe die Performance. Indexe wurden bereits beim Aufsetzen der Datenbank durch osm2pgsql erstellt.
#VACUUM: Garbage-Collector, Garbage verursacht durch UPDATES und DELETES
#ANALYZE: Erneure die internen Statistiken für die Ausführungspläne
#https://github.com/gravitystorm/openstreetmap-carto/blob/master/indexes.sql
#http://revenant.ca/www/postgis/workshop/indexing.html
psql -U performance -h localhost -d $DATABASE_NAME -c "VACUUM ANALYZE planet_osm_line;"
psql -U performance -h localhost -d $DATABASE_NAME -c "VACUUM ANALYZE planet_osm_polygon;"



#Hinweis: Schlug das Update fehl, so ist im Ordner $WORK_DIRECTORY/updates/.osmosis die Datei state.txt auf eine ältere Version zu setzen.
#Grund: Osmosis sucht neue Updates anhand dem Inhalt dieser Datei.
#Dazu https://planet.osm.ch/ und im Ordner "replication/hour/..." die State-Datei des Zeitpunktes suchen, an welchem das letzte 
#erfolgreiche Update durchgelaufen ist. Ist dieser Zeitpunkt nur ungefähr bekannt, kann ein älterer State verwendet werden. Der Inhalt
#der lokalen state.txt-Datei ist mit dem Inhalt der planet.osm-state.txt-Datei zu ersetzen.