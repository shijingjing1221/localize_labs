#!/bin/bash
export app_dir=$1
echo "Remove the dev files in "$app_dir
if [ $app_dir ]; then
rm $app_dir/Gruntfile_dev.js
rm $app_dir/server/app_dev.js
rm $app_dir/client/index_dev.html
rm -rf $app_dir/client/dev
fi