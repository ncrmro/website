-- Password: 74W9Q4GTA0dE
INSERT INTO users (id, username, first_name, last_name, email, password)
VALUES ('ca55d247-66e2-4346-b130-06c2d5a7c826', 'ncrmro', 'Nicholas', 'Romero', 'ncrmro@gmail.com',
        '261c4f54a615d99144a431972d963b719ad54427fd9d384ef9efc4b7f0e663aa4ee34107cf753ed7fc6e2bb944136b9badf692c079837cdc4d4020df242f4e3b.5cc8610ec2570dd165a9261b615651ba')
ON CONFLICT DO NOTHING;