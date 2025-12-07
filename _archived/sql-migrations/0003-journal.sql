-- Only one journal per user per a should exist
DROP TABLE IF EXISTS journal_entries;
CREATE TABLE journal_entries
(
    id           text    NOT NULL PRIMARY KEY DEFAULT (uuid()),
    user_id      text    NOT NULL REFERENCES users,
    body         text    NOT NULL,
    created_date integer NOT NULL             DEFAULT (strftime('%s', CURRENT_DATE)),
    created_at   integer NOT NULL             DEFAULT (strftime('%s', CURRENT_TIMESTAMP)),
    updated_at   integer NOT NULL             DEFAULT (strftime('%s', CURRENT_TIMESTAMP)),
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE (user_id, created_date)
) STRICT, WITHOUT ROWID;

CREATE TRIGGER journal_entry_update_timestamp
    BEFORE UPDATE
    ON journal_entries
    FOR EACH ROW
BEGIN
    UPDATE journal_entries
    SET updated_at = strftime('%s', CURRENT_TIMESTAMP)
    WHERE id = old.id;
END;

CREATE TRIGGER journal_entry_immutable_columns
    BEFORE UPDATE of id, created_at, user_id, created_date
    ON journal_entries
BEGIN
    SELECT RAISE(FAIL, "these columns are read only");
END;

CREATE TABLE journal_entry_history
(
    id               text                            NOT NULL PRIMARY KEY DEFAULT (uuid()),
    journal_entry_id text references journal_entries NOT NULL,
    body             text                            not null,
    created_at       integer                         NOT NULL             DEFAULT (strftime('%s', CURRENT_TIMESTAMP))
);

CREATE TRIGGER journal_entry_history_immutable_columns
    BEFORE UPDATE of id, created_at, journal_entry_id, body
    ON journal_entry_history
BEGIN
    SELECT RAISE(FAIL, "these columns are read only");
END;

CREATE TRIGGER journal_entry_save_history
    BEFORE UPDATE
    ON journal_entries
    FOR EACH ROW
    WHEN old.body <> new.body
BEGIN
    INSERT INTO journal_entry_history (journal_entry_id, body)
    values (old.id, old.body);
END;


