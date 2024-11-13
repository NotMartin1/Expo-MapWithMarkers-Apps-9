import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('markers.db');

type marker = {
    latitude: any,
    longitude: any,
    name: string,
}

const dropMarkersTable = () => {
    db.execAsync('DROP TABLE IF EXISTS markers;');
}

const createMarkersTable = () => {
    db.execSync(`
        CREATE TABLE IF NOT EXISTS markers (
            id INTEGER PRIMARY KEY NOT NULL,
            latitude REAL,
            longitude real,
            name text
        );
    `)
}

const insertMarker = (marker: marker) => {
    db.runSync('INSERT INTO markers (latitude, longitude, name) VALUES (?, ?, ?);', marker.latitude, marker.longitude, marker.name)
}

const deleteMarkerById = (id: number) => {
    db.runSync('DELETE FROM markers WHERE Id = ?', id);
}

const getMarkers = async () => {
    var result = await db.getAllAsync('SELECT * FROM markers;');
    return result;
}

export default {
    createMarkersTable,
    insertMarker,
    getMarkers,
    dropMarkersTable,
    deleteMarkerById,
}