INSERT into journal_entries(user_id, created_date, body)
values ('ca55d247-66e2-4346-b130-06c2d5a7c826', strftime('%s', '2023-09-26'),
        'We can take this idea even further when implementing a dropdown selector in the
code below we can now pass any props to the root/label/select/options tags.
'),
       ('ca55d247-66e2-4346-b130-06c2d5a7c826', strftime('%s', '2023-09-24'),
        'I''ve become a big fan of not using too many libraries in my frontend
applications both because of performance concerns and often pre-made components
styles are hard to override with small tweaks.'),
       ('ca55d247-66e2-4346-b130-06c2d5a7c826', strftime('%s', '2023-09-19'),
        'Something that will become apparent at some point of your journey using a Linux
workstation as a development environment is that Docker runs as Root hence all
commands must be run with sudo, directories and volumes will be owned by the
root users (and must be removed with sudo for instance) as well.'),
       ('ca55d247-66e2-4346-b130-06c2d5a7c826', strftime('%s', '2023-09-01'),
        'Got the API in node for my form'),
       ('ca55d247-66e2-4346-b130-06c2d5a7c826', strftime('%s', '2023-08-20'),
        'I build a form in html javascript'),
       ('ca55d247-66e2-4346-b130-06c2d5a7c826', strftime('%s', '2023-08-01'),
        'I installed node js and created a file with hello world'),
       ('ca55d247-66e2-4346-b130-06c2d5a7c826', strftime('%s', '2023-07-01'),
        'First day learning to code, I learned about hello world.')
on conflict do nothing;