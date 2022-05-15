# P7_back_Werquin_Lucas

sample .env file :

TOKEN_SECRET=this_is_a_random_secret  	//secret phrase for jwt encryption
DB_HOST=127.0.0.1					//ip address of sql server
DB_USERNAME=groupomania				// username of sql database user
DB_PASSWORD=Whitedog+44				//password of sql database user
DB_NAME=groupomania					//name of the database
DB_DIALECT=mysql					//dialect used by sequelize



Run the following commands in the terminal:

To create database:
npx sequelize-cli db:migrate

To create an admin user:
npx sequelize-cli db:seed:all

to run the server:
node server


Admin logs:
email: 'admin@groupomania.com',
password: 'Whitedog44'
