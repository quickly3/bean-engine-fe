
pm2 start --name bean-fe "sudo ng serve --host 0.0.0.0 --port 80 --disable-host-check --configuration production"


pm2 start "sudo http-server dist/bean-engine-fe -p 80" --name bean-fe