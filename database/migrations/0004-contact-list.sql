CREATE TABLE contacts
(
    id          text    NOT NULL PRIMARY KEY DEFAULT (uuid()),
    name        text    not null,
    number      integer unique,
    email       text unique,
    notes       text,
    birth_day   integer,
    birth_month integer,
    birth_year  integer,
    created_at  integer NOT NULL             DEFAULT (strftime('%s', CURRENT_TIMESTAMP)),
    updated_at  integer NOT NULL             DEFAULT (strftime('%s', CURRENT_TIMESTAMP))
) STRICT, WITHOUT ROWID;

CREATE TRIGGER contact_timestamp
    BEFORE UPDATE
    ON contacts
    FOR EACH ROW
BEGIN
    UPDATE contacts
    SET updated_at = strftime('%s', CURRENT_TIMESTAMP)
    WHERE id = old.id;
END;

CREATE TRIGGER contacts_immutable_columns
    BEFORE UPDATE of id, created_at
    ON contacts
BEGIN
    SELECT RAISE(FAIL, "these columns are read only");
END;
