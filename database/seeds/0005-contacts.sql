INSERT into contacts(name, number, email, notes)
values ('John Doe', 7132222048, 'jdoe@gmail.com', 'Has no idea who he is'),
       ('Jane Doe', 7132222047, 'jndoe@gmail.com', 'Has no idea who she is')
on conflict do nothing;
