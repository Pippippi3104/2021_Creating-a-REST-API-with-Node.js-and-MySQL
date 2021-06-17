## Creating a REST API with Node.js and MySQL

### Credentials

- Instance ID
  - barkbark
- password
  - 111111111!Qq

### Cloud Shell Terminal

- step 001: login

  - ```
    gcloud sql connect barkbark -u root
    ```
  - ctrl c: exit

- step 002: move
  - ```
    use dog_data;
    show tables;
    ```
- step 003: create
  - ```
    CREATE TABLE breeds (name varchar(30) UNIQUE, type varchar(30), lifeExpectancy INT, origin varchar(30));
    show tables;
    ```
- step 004: insert and select
  - ```
    INSERT INTO breeds VALUES ('poodle', 'sporting', 14, 'Germany');
    select * from breeds;
    ```

### Node

- step 001: init
  - ```
    npm init
    npm i -D express mysql
    ```
- step 002: server init

  - index.js
  - ```
    const express = require("express");
    const mysql = require("mysql");

    // app
    const app = express();

    // connect
    app.use(express.json());
    const port = process.env.PORT || 8080;
    app.listen(port, () => {
        console.log(`BarkBark Rest API listening on port ${port}`);
    });

    // API
    app.get("/", async (req, res) => {
        res.json({ status: "Bark bark! Ready to roll!" });
    });
    ```

  - ```
    npm run start (node index.js)
    curl localhost:8080
    ```

### connect to GCP

- create deploy.sh
- install
  - ```
    curl https://sdk.cloud.google.com | bash
    ```
  - シェル再起動必須
- run
  - ```
    chmod +x deploy.sh
    gcloud auth login
    gcloud config set project bark-bark-api-317105
    ./deploy.sh
    ```
- links
  - [Permission denied](https://qiita.com/sanstktkrsyhsk/items/ef88ddfb9fa8e7306e45)
  - [Mac に gcloud をインストールする](https://note.com/in_colors_net/n/n98ef81d6eb46)
  - [gcloud コマンドが認識されないとき（初心者向け）](https://qiita.com/jre233kei/items/355914b36e505152e29d)

### Links

- [Creating a REST API with Node.js and MySQL](https://www.youtube.com/watch?v=_w_idf928WY)
