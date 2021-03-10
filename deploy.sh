rm -rf Mobile/www
mkdir Mobile/www
cp -r Game/* Mobile/www
mv Mobile/www/index_mobile.html Mobile/www/index.html
now=$(date +"%T")
echo "Last deployed $now"