# Product Description:


# To Run:
1. Make sure MySQL is running. Make sure that you have a User account and have created a local instance.
2. Open MySQL Workbench and run `mydb.sql`
3. Go to `CSSWENG-MCO/backend/` and open the `.env` file.
    - Edit the values to match your system's settings and your database.
    - The following are examples of what you could place for each variable:
        1. DB_HOST=localhost
        2. DB_USER=root
        3. DB_PASSWORD="12345678"
        4. DB_NAME=mydb
        5. PORT=5000
4. Go to `CSSWENG-MCO/frontend/` and create a second `.env` file.
    - Paste the following code into the file:
        - `PUBLIC_API_BASE_URL=http://localhost:5000`
        - where:
            - the variable is kept as is `PUBLIC_API_BASE_URL`
            - the host string is the same value as your DB_HOST in the backend's env file: `http://localhost`
            - and the port string is the same value as your PORT in the backend's env file: `5000`
5. Run the backend
    - Open a terminal/cmd from the root folder and run the commands:
        1. `cd CSSWENG-MCO/backend`
        2. `npm i`
        3. `node app`
6. Run the frontend
    - Open another terminal/cmd from the root folder and run the commands:
        1. `cd CSSWENG-MCO/frontend end`
        2. `npm i`
        3. `npm run dev`
7. Go back to your MySQL Workbench and run the `CSSWENG-MCO/public/generateRandomData.sql` file.
8. Run the `CSSWENG-MCO/public/populate_products_categorized.sql` file as well.
9. Open your terminal for the frontend and go to the local URL that it points to.
    - It should tell you to go to `http://localhost:5173/`
10. Log in with the default admin credentials:
    - Username: `admin`
    - Password: `123456789`

# Client: 



# Team Roles:

Product Owner: Henry Villanueva @ShrekIsGoat

Scrum Master/Team Leader: Andrei Balingit @aaaaandreiii

UI/UX Designers: Sophia Avelino @Gl1tch8, Marcus Apetreor @Marcus-Apetreor

Developers: Ching Man Wong @ChingManWong, Rafael Navarro @ChinoLim, Deo Diamante @DeoZD

Quality Assurance Engineer: Lance Medina @limborock12


# Links:

Jira: https://aaaaandreiii.atlassian.net/jira/software/projects/CGPI/summary

GitHub: https://github.com/aaaaandreiii/CSSWENG-MCO.git
