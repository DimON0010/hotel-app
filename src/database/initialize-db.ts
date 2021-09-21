const { Pool } = require('pg');
const { host, user, database, password, port } = require('./config');

const pool = new Pool({
  host,
  user,
  database,
  password,
  port,
});

const initText = `
  DROP TABLE IF EXISTS "rooms" CASCADE; 
  DROP TABLE IF EXISTS "reservations" CASCADE;

  CREATE OR REPLACE FUNCTION trigger_set_timestamp()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TABLE IF NOT EXISTS "rooms" (
    "id" SERIAL,
    "number" INT NOT NULL,
    "smoke" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY ("id")
  );

  CREATE TABLE IF NOT EXISTS "reservations" (
    "id" SERIAL,
    "room_id" INT NOT NULL,
    "date_in" DATE NOT NULL,
    "date_out" DATE NOT NULL,
    "price" INT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY ("id"),
    FOREIGN KEY(room_id) REFERENCES rooms (id) ON DELETE CASCADE
  );
  
  DROP TRIGGER IF EXISTS set_timestamp ON "rooms";
  CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON "rooms" 
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

  DROP TRIGGER IF EXISTS set_timestamp ON "reservations";
  CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON "reservations" 
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

  `;

const execute = async (query): Promise<boolean> => {
  try {
    await pool.query(query);
    return true;
  } catch (error) {
    console.error(error.stack);
    return false;
  } finally {
    await pool.end();
  }
};

const initializeDB = (): void => {
  execute(initText).then((result) => console.log('DB initialized', result));
}

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  },
  connect: (err, client, done) => {
    return pool.connect(err, client, done);
  },
};

initializeDB()
