#!/bin/bash

#Komplette Anleitung unter: https://switch2osm.org/loading-osm-data/
#Skript starten:
#chmod +x setup_tagging_server.sh
#sed -i -e 's/\r$//' setup_tagging_server.sh
#. ./setup\_tagging\_server.sh




#Pfad für Datenbank-Files und node.js-Server
#Hierhin sind dieses Installations-Skript und der Ordner prepared_files zu kopieren
WORK_DIRECTORY=/home/server
DATABASE_NAME=switzerland
DATABASE_PASSWORD=password

#Lese die Paketlisten neu ein.
apt-get update

#Aktualisiere die installierten Pakete wenn möglich auf verbesserte Versionen.
apt-get upgrade -y

#Installiere Git und PostgreSQL (Datenbank) zusammen mit PostGIS (für räumliche Datenbanken).
apt-get install -y --no-install-recommends git
apt-get install -y --no-install-recommends postgresql-9.6-postgis-2.3 postgresql-contrib-9.6 proj-bin libgeos-dev

#Installiere osm2pgsql. Wird benötigt, um OSM-Daten in PostgreSQL zu laden.
add-apt-repository -y ppa:kakrueger/openstreetmap
apt-get update
apt-get install -y --no-install-recommends osm2pgsql

#Um Daten im mehreren Prozessen in die Datenbank zu laden:
#https://switch2osm.org/loading-osm-data/ Abschnitt "Getting ready to load"

#Erstelle Benutzer "performance". Der Benutzer muss für die Erstellung von DB-Extensions Superuser sein.
#Achtung: die Umgebungsvariable PGPASSWORD wird hier neu gesetzt!
#https://www.postgresql.org/docs/9.3/static/app-createuser.html
sudo -u postgres bash -c "psql -c \"CREATE USER performance WITH PASSWORD '"$DATABASE_PASSWORD"' SUPERUSER;\""
export PGPASSWORD=$DATABASE_PASSWORD

#Erstelle die OSM-Datenbank.
psql -U performance -h localhost -d postgres -c "CREATE DATABASE "$DATABASE_NAME";"

#hstore: Speichert Key/Value-Paare von OSM-Tags, welche nicht bereits in konventionellen 
#Database-Columns enthalten sind. Dies ist nötig, da OSM es erlaub, beliebige Key/Value-Paare
#auf einem Objekt zu erstellen. Dabei ist es unmöglich, für jedes dieser Paare eine eigene
#Database-Column anzulegen.
psql -U performance -h localhost -d $DATABASE_NAME -c "CREATE EXTENSION hstore;"

#postgis wird benötigt, um räumliche Datenbanken, wie OSM, zu erstellen.
psql -U performance -h localhost -d $DATABASE_NAME -c "CREATE EXTENSION postgis;"

#Lade das default-Style-File von OSM herunter.
#Das Style-File bestimmt welche OSM-Einträge in welche Tabelle geladen werden.
#https://github.com/gravitystorm/openstreetmap-carto
mkdir -p $WORK_DIRECTORY/osm
cd $WORK_DIRECTORY/osm
git clone https://github.com/gravitystorm/openstreetmap-carto.git
STYLE_FILE=$WORK_DIRECTORY/osm/openstreetmap-carto/openstreetmap-carto.style

#Lade den OSM-Ausschnitt der Schweiz und dessen State herunter.
#Der State beinhaltet die Daten der letzten Aktualisierung und wird für die Updates benötigt.
wget https://planet.osm.ch/replication/hour/state.txt
wget https://planet.osm.ch/switzerland.pbf

#Importiere den OSM-Ausschnitt in die Vorbereitete Datenbank.
#--latlong wird benötigt, damit Umwandlungen in SRID 4326 (WGS84) möglich sind.
#--slim wird benötigt, damit anschliessend Updates durchgeführt werden können.
#--multi-geometry wird benötigt, dass z.B. Multi-Polygons nicht auseinandergenommen werden.
#http://www.volkerschatz.com/net/osm/osm2pgsql-usage.html
osm2pgsql --create --latlong --database $DATABASE_NAME --username performance --host localhost --slim --cache 500 --number-processes 1 --hstore --style $STYLE_FILE --multi-geometry --exclude-invalid-polygon switzerland.pbf
rm switzerland.pbf

#Erhöhe die Performance derjenigen Tables, welche durch den Tagging-Server abgefragt werden.
#Indexe wurden durch osm2pgsql bereits erstellt und können mit \d <tableName> angezeigt werden.
#VACUUM: Garbage-Collector, Garbage verursacht durch UPDATES und DELETES
#ANALYZE: Erneure die internen Statistiken für die Ausführungspläne.
#CLUSTER: Sortiere die Tabelleneinträge nach dem angegebenen Index.
#https://github.com/gravitystorm/openstreetmap-carto/blob/master/indexes.sql
#http://revenant.ca/www/postgis/workshop/indexing.html
psql -U performance -h localhost -d $DATABASE_NAME -c "VACUUM ANALYZE planet_osm_line;"
psql -U performance -h localhost -d $DATABASE_NAME -c "CLUSTER planet_osm_line USING planet_osm_line_index;"
psql -U performance -h localhost -d $DATABASE_NAME -c "ANALYZE planet_osm_line;"
psql -U performance -h localhost -d $DATABASE_NAME -c "VACUUM ANALYZE planet_osm_polygon;"
psql -U performance -h localhost -d $DATABASE_NAME -c "CLUSTER planet_osm_polygon USING planet_osm_polygon_index;"
psql -U performance -h localhost -d $DATABASE_NAME -c "ANALYZE planet_osm_polygon;"






#Die Datenbank ist eingerichtet. Es folgt das Einrichten der automatischen Datenbank-Updates.
mkdir -p $WORK_DIRECTORY/updates
cd $WORK_DIRECTORY/updates

#Installiere Osmosis, welches die benötigten Updates jeweils zusammensucht.
#http://wiki.openstreetmap.org/wiki/Osmosis/Installation
apt-get install -y --no-install-recommends osmosis

#Osmosis-Konfiguration einrichten
#http://wiki.openstreetmap.org/wiki/HowTo_minutely_hstore#Initializing
WORKDIR_OSMOSIS=$WORK_DIRECTORY/updates/.osmosis
mkdir -p $WORKDIR_OSMOSIS
osmosis --read-replication-interval-init workingDirectory=$WORKDIR_OSMOSIS
mv -f $WORK_DIRECTORY/prepared_files/osmosis/configuration.txt $WORKDIR_OSMOSIS
mv -f $WORK_DIRECTORY/osm/state.txt $WORKDIR_OSMOSIS

#Update-File vorbereiten: Ausführbar setzen und Windows-Zeichen bereinigen
#https://askubuntu.com/questions/304999/not-able-to-execute-a-sh-file-bin-bashm-bad-interpreter
mv -f $WORK_DIRECTORY/prepared_files/update_database.sh $WORK_DIRECTORY/updates
chmod +x update_database.sh
sed -i -e 's/\r$//' update_database.sh






#node.js und npm (Package Manager) installieren
#http://www.sysadminslife.com/linux/howto-node-js-installation-unter-debian-squeeze-wheezy-ubuntu/
cd $WORK_DIRECTORY
apt-get install -y --no-install-recommends g++ curl libssl-dev
wget http://nodejs.org/dist/node-latest.tar.gz
tar -xzvf node-latest.tar.gz
rm node-latest.tar.gz
cd $(find -maxdepth 1 -name "node-v*")
./configure
make
make install
cd $WORK_DIRECTORY
rm -r -f $(find -maxdepth 1 -name "node-v*")
apt-get install -y --no-install-recommends npm

#Tagging-Server aufsetzen
cd $WORK_DIRECTORY
git clone https://github.com/dwin94/tagging-server.git
mv -f $WORK_DIRECTORY/prepared_files/tagging-server/config.json $WORK_DIRECTORY/tagging-server/config
cd $WORK_DIRECTORY/tagging-server
mkdir -p $WORK_DIRECTORY/tagging-server/log
touch $WORK_DIRECTORY/tagging-server/log/error.log
npm install
node ./bin/www>stdout.txt 2>./log/error.log &






#Update-Cronjob einrichten
#2>/dev/null, um Fehlermeldungen zu vermeiden, wenn noch kein Cronjob für den Benutzer erstellt wurde
#Update-Skript wird jede Stunde um Viertel nach aufgerufen
(crontab -l 2>/dev/null; echo "15 * * * * cd "$WORK_DIRECTORY"/updates && . ./update_database.sh >> database_update_logfile.log 2>&1") | crontab -