# clone-tabnews


Subir o container docker
````
docker compose up -d 
````
---

parar um container docker
````
docker compose down
````
---

instalar o psql no linux
````
sudo apt install postgresql-client
````
no mac
````
brew install libql
e echo 'export PATH="/usr/local/opt/libpq/bin:$PATH"' >> ~/.zshrc
````

----

acessar o banco
````
 psql --host=localhost --username=postgres --port=5432
````
se necesário recriar o container do docker
````
docker compose up -d --force-recreate 
````

---

Subir o container docker especificando o arquivo docker-compose.yml
````
docker compose -f infra/compose.yaml up -d 
````
parar o container docker especificando o arquivo docker-compose.yml
````
docker compose -f infra/compose.yaml down
````
