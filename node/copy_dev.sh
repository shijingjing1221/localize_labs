#!/bin/bash

export app_dir=$1
export labs_id=$2
echo "cp localize path_to_app_dir:"$app_dir
if [ $app_dir ]; then
sh $delete_dev.sh $app_dir
cp Gruntfile_dev.js $app_dir/Gruntfile_dev.js
sed -i 's/nodedemo/'$labs_id'/g' $app_dir/Gruntfile_dev.js
cp server/app_dev.js $app_dir/server/app_dev.js
sed -i 's/nodedemo/'$labs_id'/g' $app_dir/server/app_dev.js

# Copy the client side dev code
cp client/index_dev.html $app_dir/client/index_dev.html
sed -i 's/nodedemo/'$labs_id'/g' $app_dir/client/index_dev.html
cp -rf client/dev $app_dir/client/dev
sed -i 's/nodedemo/'$labs_id'/g' $app_dir/client/dev/loader_dev.js


cat >> $app_dir/.gitignore << EOF
*/dev/*
*dev*
server/*_dev.js
client/*_dev.html

EOF

fi
