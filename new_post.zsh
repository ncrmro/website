#!/bin/zsh

## backup dir format ##
current_date=$(date +'%Y-%m-%d')

post_tile=$1
post_title_lower=$(echo "$post_tile" | awk '{print tolower($0)}')
post_title_underscored="${post_title_lower// /_}"
post_title_slug="${post_title_lower// /-}"

posts_dir=public/posts

# 2020_06_14_testing_new_post_script.md
post_file_name=$(date +'%Y_%m_%d')_$post_title_underscored.md

echo Creating file.. "$post_file_name"

cat <<EOT >> $posts_dir/$post_file_name
---
slug: $post_title_slug
title: $post_tile
date: '${current_date}'
description: CHANGEME
tags: ['CHANGEME']
---

Hello World
EOT

# ./new_post.zsh post_title
# chore just trigger a build..
