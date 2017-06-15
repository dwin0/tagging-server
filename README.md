# tagging-server

API zur Kategorisierung von Mobile Speedtest Daten


### Dokumentation

Die Dokumentation ist unter folgender URL auffindbar: https://dwin94.github.io/


### Installation auf Linux

Das Installations-Skript befindet sich im Ordner "setup". Folgenden Variablen sind in den Dateien "setup_tagging_server.sh" 
und "update_database.sh" anzupassen.

* WORK_DIRECTORY=/tagging/server

  Hier werden alle vom tagging-server benötigten Dateien abgelegt.
* DATABASE_NAME=switzerland
* DATABASE_PASSWORD=password

Der Inhalt von "setup" ist anschliessend in den Ordner WORK_DIRECTORY zu kopieren. Von dort wird das Skript wie folgt gestartet:

```
chmod +x setup_tagging_server.sh
sed -i -e 's/\r$//' setup_tagging_server.sh
. ./setup_tagging_server.sh
```

## Authors

* **David Windler**
* **Andrea Hauser**
